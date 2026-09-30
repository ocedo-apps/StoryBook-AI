use std::process::Command;

use serde::Serialize;

#[derive(Serialize)]
pub struct GpuSuggestion {
    pub vram_mb: u64,
    /// A stable tier key ("3b", "7b", "14b", "30b", "70b") — never shown
    /// to the user directly. The frontend maps it to a localized label
    /// (sv/en/nb) so this doesn't hardcode any one language.
    pub tier: String,
}

/// Rough VRAM-to-model-size rule of thumb for a 4-bit quantized local model.
/// Deliberately conservative: leaves headroom for the OS, the webview, and
/// Ollama's own context buffers rather than assuming every megabyte is free.
pub fn suggest_model_tier(vram_mb: u64) -> &'static str {
    match vram_mb {
        0..=5_999 => "3b",
        6_000..=11_999 => "7b",
        12_000..=19_999 => "14b",
        20_000..=31_999 => "30b",
        _ => "70b",
    }
}

/// Reads total VRAM from `nvidia-smi`. Returns `None` for non-NVIDIA GPUs,
/// missing drivers, or any other vendor — callers should treat that as
/// "couldn't detect", not "no GPU".
fn detect_nvidia_vram_mb() -> Option<u64> {
    let output = Command::new("nvidia-smi")
        .args(["--query-gpu=memory.total", "--format=csv,noheader,nounits"])
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    let text = String::from_utf8_lossy(&output.stdout);
    let first_line = text.lines().next()?.trim();
    first_line.parse::<u64>().ok()
}

#[tauri::command]
pub fn detect_gpu_suggestion() -> Option<GpuSuggestion> {
    let vram_mb = detect_nvidia_vram_mb()?;
    Some(GpuSuggestion {
        vram_mb,
        tier: suggest_model_tier(vram_mb).to_string(),
    })
}

fn is_allowed_external_url(url: &str) -> bool {
    url.starts_with("https://")
}

/// Opens a URL in the system's default browser. Restricted to `https://` —
/// this is a general-purpose bridge command, not just for the Ollama link
/// below, so it shouldn't silently accept `file://` or other local schemes.
#[tauri::command]
pub fn open_external_url(url: String) -> Result<(), String> {
    if !is_allowed_external_url(&url) {
        return Err(format!("Refusing to open non-https URL: {url}"));
    }
    tauri_plugin_opener::open_url(url, None::<&str>).map_err(|err| err.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tiers_follow_the_rule_of_thumb() {
        assert_eq!(suggest_model_tier(4_000), "3b");
        assert_eq!(suggest_model_tier(8_000), "7b");
        assert_eq!(suggest_model_tier(16_000), "14b");
        assert_eq!(suggest_model_tier(24_000), "30b");
        assert_eq!(suggest_model_tier(80_000), "70b");
    }

    #[test]
    fn boundaries_round_down_to_the_safer_tier() {
        assert_eq!(suggest_model_tier(5_999), suggest_model_tier(0));
        assert_eq!(suggest_model_tier(11_999), suggest_model_tier(6_000));
        assert_eq!(suggest_model_tier(19_999), suggest_model_tier(12_000));
        assert_eq!(suggest_model_tier(31_999), suggest_model_tier(20_000));
    }

    #[test]
    fn only_https_urls_are_allowed() {
        assert!(is_allowed_external_url("https://ollama.com/download"));
        assert!(!is_allowed_external_url("http://ollama.com/download"));
        assert!(!is_allowed_external_url("file:///etc/passwd"));
        assert!(!is_allowed_external_url("javascript:alert(1)"));
    }
}
