use serde::{Deserialize, Serialize};
use tauri::AppHandle;

const RELEASES_URL: &str = "https://api.github.com/repos/ocedo-apps/StoryBook-AI/releases/latest";

#[derive(Deserialize)]
struct GithubRelease {
    tag_name: String,
    html_url: String,
}

#[derive(Serialize)]
pub struct UpdateStatus {
    pub current: String,
    pub latest: String,
    pub update_available: bool,
    pub release_url: String,
}

/// Parses "1.2.3" or "v1.2.3" into a comparable (major, minor, patch) tuple.
/// No pre-release/build metadata support — the project doesn't use either.
fn parse_semver(input: &str) -> Option<(u64, u64, u64)> {
    let trimmed = input.trim().trim_start_matches('v');
    let mut parts = trimmed.split('.');
    let major = parts.next()?.parse().ok()?;
    let minor = parts.next()?.parse().ok()?;
    let patch = parts.next()?.parse().ok()?;
    Some((major, minor, patch))
}

#[tauri::command]
pub fn check_for_updates(app: AppHandle) -> Result<UpdateStatus, String> {
    let current = app.package_info().version.to_string();
    let release: GithubRelease = ureq::get(RELEASES_URL)
        .header("User-Agent", "storybook-ai-desktop")
        .call()
        .map_err(|err| err.to_string())?
        .body_mut()
        .read_json()
        .map_err(|err| err.to_string())?;

    let current_semver = parse_semver(&current)
        .ok_or_else(|| format!("Could not parse current version: {current}"))?;
    let latest_semver = parse_semver(&release.tag_name)
        .ok_or_else(|| format!("Could not parse release tag: {}", release.tag_name))?;

    Ok(UpdateStatus {
        current,
        latest: release.tag_name.trim_start_matches('v').to_string(),
        update_available: latest_semver > current_semver,
        release_url: release.html_url,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_versions_with_and_without_v_prefix() {
        assert_eq!(parse_semver("1.2.3"), Some((1, 2, 3)));
        assert_eq!(parse_semver("v1.2.3"), Some((1, 2, 3)));
    }

    #[test]
    fn rejects_malformed_versions() {
        assert_eq!(parse_semver("not-a-version"), None);
        assert_eq!(parse_semver("1.2"), None);
        assert_eq!(parse_semver(""), None);
    }

    #[test]
    fn compares_versions_numerically_not_lexically() {
        assert!(parse_semver("1.0.28").unwrap() < parse_semver("1.0.29").unwrap());
        assert!(parse_semver("1.1.0").unwrap() > parse_semver("1.0.99").unwrap());
        assert!(parse_semver("2.0.0").unwrap() > parse_semver("1.99.99").unwrap());
        assert!(parse_semver("1.0.9").unwrap() < parse_semver("1.0.10").unwrap());
    }
}
