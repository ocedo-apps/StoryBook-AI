use serde::Serialize;
use serde_json::Value;

const CORE_URL: &str = "http://127.0.0.1:43127";

#[derive(Serialize)]
pub struct CoreConnection {
    pub paired: bool,
    pub reachable: bool,
}

fn valid_project_id(id: &str) -> bool {
    !id.is_empty() && id.len() <= 256 && id.bytes().all(|byte| byte.is_ascii_alphanumeric() || byte == b'-' || byte == b'_')
}

#[cfg(any(target_os = "windows", target_os = "linux", target_os = "macos"))]
fn credential() -> Result<keyring::Entry, String> {
    keyring::Entry::new("se.ocedo.storybookai.core", "storybook")
        .map_err(|_| "The system credential store is unavailable".to_string())
}

#[cfg(any(target_os = "windows", target_os = "linux", target_os = "macos"))]
fn saved_token() -> Result<String, String> {
    credential()?.get_password().map_err(|_| "Storybook is not paired with Core".to_string())
}

#[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
fn saved_token() -> Result<String, String> {
    Err("Core desktop pairing is not available on this platform".to_string())
}

/// Matches Core's own default database location exactly
/// (packages/service/server.mjs's defaultDbPath) — the installer never
/// overrides it, so this is the one place a freshly installed Core leaves
/// its first-run pairing credentials. Windows: %LOCALAPPDATA%\StoryCore;
/// Linux and macOS share one branch: ~/.storycore, server.mjs's own
/// homedir()-based fallback for every non-Windows platform (its own
/// process.platform check is a plain `!== 'win32'`, not a Linux-specific
/// one, so this was already the right path for macOS the moment Codex
/// itself ran there - nothing Core-side needed to change for this).
#[cfg(target_os = "windows")]
fn bootstrap_path() -> Result<std::path::PathBuf, String> {
    let base = std::env::var("LOCALAPPDATA").map_err(|_| "LOCALAPPDATA is not set".to_string())?;
    Ok(std::path::Path::new(&base).join("StoryCore").join("core.db.bootstrap.json"))
}

#[cfg(any(target_os = "linux", target_os = "macos"))]
fn bootstrap_path() -> Result<std::path::PathBuf, String> {
    let home = std::env::var("HOME").map_err(|_| "HOME is not set".to_string())?;
    Ok(std::path::Path::new(&home).join(".storycore").join("core.db.bootstrap.json"))
}

fn check_identity(token: &str) -> Result<(), String> {
    let identity: Value = ureq::get(&format!("{CORE_URL}/v1/identity"))
        .header("Authorization", format!("Bearer {token}"))
        .call()
        .map_err(|_| "Cannot authenticate with local Core".to_string())?
        .body_mut()
        .read_json()
        .map_err(|_| "Invalid Core identity response".to_string())?;
    if identity.get("app").and_then(Value::as_str) != Some("storybook") {
        return Err("This Core credential does not belong to Storybook".to_string());
    }
    Ok(())
}

/// Pair once using the 64-character secret from Core's administrator-only provisioning.
/// The secret is held by the system credential store (Windows Credential
/// Manager, the Secret Service on Linux, or Keychain on macOS), never
/// returned to the webview.
#[tauri::command]
pub async fn core_pair(token: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        if token.len() != 64 || !token.bytes().all(|byte| byte.is_ascii_hexdigit() && !byte.is_ascii_uppercase()) {
            return Err("Invalid Core credential".to_string());
        }
        check_identity(&token)?;
        #[cfg(any(target_os = "windows", target_os = "linux", target_os = "macos"))]
        { credential()?.set_password(&token).map_err(|_| "Could not save the Core credential".to_string()) }
        #[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
        { Err("Core desktop pairing is not available on this platform".to_string()) }
    }).await.map_err(|_| "Core pairing failed".to_string())?
}

/// Looks for a freshly installed Core's own first-run pairing file instead
/// of asking a human to copy a 64-character key by hand — the common case
/// of "both on the same machine, Core was just installed". Claims only
/// Storybook's own entry, so a later call (or ComicBook AI/Sandbox reading
/// the same file) never hands the same token out twice; sibling apps'
/// entries are left untouched for them to claim on their own. Fails
/// quietly (a plain error, nothing shown as a crash) whenever there's
/// nothing to claim — the caller falls back to the manual key field.
#[tauri::command]
pub async fn core_auto_claim() -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(|| {
        #[cfg(any(target_os = "windows", target_os = "linux", target_os = "macos"))]
        {
            let path = bootstrap_path()?;
            let raw = std::fs::read_to_string(&path).map_err(|_| "No local Core pairing file found".to_string())?;
            let mut doc: Value = serde_json::from_str(&raw).map_err(|_| "Core pairing file is unreadable".to_string())?;
            let token = doc.get("storybook").and_then(Value::as_str)
                .filter(|candidate| candidate.len() == 64 && candidate.bytes().all(|byte| byte.is_ascii_hexdigit() && !byte.is_ascii_uppercase()))
                .ok_or_else(|| "No unclaimed Storybook credential in the pairing file".to_string())?
                .to_string();
            check_identity(&token)?;
            credential()?.set_password(&token).map_err(|_| "Could not save the Core credential".to_string())?;
            // Already paired successfully at this point - a failure to
            // update the file below just means it stays claimable again,
            // not that pairing itself failed.
            if let Some(object) = doc.as_object_mut() {
                object.insert("storybook".to_string(), Value::Null);
                let _ = std::fs::write(&path, serde_json::to_string_pretty(&doc).unwrap_or(raw));
            }
            Ok(())
        }
        #[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
        { Err("Core desktop pairing is not available on this platform".to_string()) }
    }).await.map_err(|_| "Core auto-pairing failed".to_string())?
}

#[tauri::command]
pub async fn core_connection() -> CoreConnection {
    tauri::async_runtime::spawn_blocking(|| match saved_token() {
        Ok(token) => CoreConnection { paired: true, reachable: check_identity(&token).is_ok() },
        Err(_) => CoreConnection { paired: false, reachable: false },
    }).await.unwrap_or(CoreConnection { paired: false, reachable: false })
}

/// Read the server's actual grant set after a restored Core or lost local queue.
#[tauri::command]
pub async fn core_shared_access(project_id: String) -> Result<Value, String> {
    tauri::async_runtime::spawn_blocking(move || {
        if !valid_project_id(&project_id) { return Err("Invalid manuscript ID".to_string()); }
        let token = saved_token()?;
        ureq::get(&format!("{CORE_URL}/v1/shared-manuscripts/{project_id}/access"))
            .header("Authorization", format!("Bearer {token}"))
            .call()
            .map_err(|_| "Cannot read Core manuscript access".to_string())?
            .body_mut()
            .read_json()
            .map_err(|_| "Invalid Core access response".to_string())
    }).await.map_err(|_| "Core access request failed".to_string())?
}

#[tauri::command]
pub async fn core_save_private(book: Value) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let id = book.get("id").and_then(Value::as_str).ok_or_else(|| "Missing manuscript ID".to_string())?;
        if !valid_project_id(id) { return Err("Invalid manuscript ID".to_string()); }
        let token = saved_token()?;
        ureq::put(&format!("{CORE_URL}/v1/private-manuscripts/{id}"))
            .header("Authorization", format!("Bearer {token}"))
            .send_json(serde_json::json!({ "book": book }))
            .map_err(|_| "Core did not accept the private manuscript".to_string())?;
        Ok(())
    }).await.map_err(|_| "Core private snapshot failed".to_string())?
}

/// Every book Codex has a private snapshot of, titled and dated but
/// without the book bodies - the "Import Codex book" picker on Home, for
/// a machine that doesn't know any of these project IDs yet (unlike
/// core_private_versions below, which needs one).
#[tauri::command]
pub async fn core_private_manuscripts() -> Result<Value, String> {
    tauri::async_runtime::spawn_blocking(|| {
        let token = saved_token()?;
        ureq::get(&format!("{CORE_URL}/v1/private-manuscripts"))
            .header("Authorization", format!("Bearer {token}"))
            .call()
            .map_err(|_| "Cannot list private Core manuscripts".to_string())?
            .body_mut()
            .read_json()
            .map_err(|_| "Invalid Core manuscript list response".to_string())
    }).await.map_err(|_| "Core manuscript list request failed".to_string())?
}

#[tauri::command]
pub async fn core_private_versions(project_id: String) -> Result<Value, String> {
    tauri::async_runtime::spawn_blocking(move || {
        if !valid_project_id(&project_id) { return Err("Invalid manuscript ID".to_string()); }
        let token = saved_token()?;
        ureq::get(&format!("{CORE_URL}/v1/private-manuscripts/{project_id}/versions"))
            .header("Authorization", format!("Bearer {token}"))
            .call()
            .map_err(|_| "Cannot list private Core versions".to_string())?
            .body_mut()
            .read_json()
            .map_err(|_| "Invalid Core version response".to_string())
    }).await.map_err(|_| "Core version request failed".to_string())?
}

#[tauri::command]
pub async fn core_private_revision(revision_id: String) -> Result<Value, String> {
    tauri::async_runtime::spawn_blocking(move || {
        if !valid_project_id(&revision_id) { return Err("Invalid revision ID".to_string()); }
        let token = saved_token()?;
        ureq::get(&format!("{CORE_URL}/v1/revisions/{revision_id}"))
            .header("Authorization", format!("Bearer {token}"))
            .call()
            .map_err(|_| "Cannot read private Core revision".to_string())?
            .body_mut()
            .read_json()
            .map_err(|_| "Invalid Core revision response".to_string())
    }).await.map_err(|_| "Core revision request failed".to_string())?
}

#[tauri::command]
pub async fn core_publish_shared(publication: Value) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let id = publication.get("projectId").and_then(Value::as_str)
            .ok_or_else(|| "Missing manuscript ID".to_string())?;
        if !valid_project_id(id) { return Err("Invalid manuscript ID".to_string()); }
        let token = saved_token()?;
        ureq::put(&format!("{CORE_URL}/v1/shared-manuscripts/{id}"))
            .header("Authorization", format!("Bearer {token}"))
            .send_json(&publication)
            .map_err(|_| "Core did not accept the manuscript publication".to_string())?;
        Ok(())
    }).await.map_err(|_| "Core publication failed".to_string())?
}

#[tauri::command]
pub async fn core_revoke_shared(project_id: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        if !valid_project_id(&project_id) { return Err("Invalid manuscript ID".to_string()); }
        let token = saved_token()?;
        ureq::delete(&format!("{CORE_URL}/v1/shared-manuscripts/{project_id}"))
            .header("Authorization", format!("Bearer {token}"))
            .call()
            .map_err(|_| "Core did not confirm revoked sharing".to_string())?;
        Ok(())
    }).await.map_err(|_| "Core revocation failed".to_string())?
}

#[cfg(test)]
mod tests {
    use super::valid_project_id;

    #[test]
    fn paths_accept_only_local_book_ids() {
        assert!(valid_project_id("a1b2-uuid"));
        assert!(!valid_project_id("../other"));
        assert!(!valid_project_id("book?reader=comic"));
        assert!(!valid_project_id(""));
    }
}
