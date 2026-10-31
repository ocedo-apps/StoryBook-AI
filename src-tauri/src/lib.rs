mod system_check;
mod update_check;
mod core_bridge;

use tauri_plugin_deep_link::DeepLinkExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_deep_link::init())
    .plugin(tauri_plugin_http::init())
    .invoke_handler(tauri::generate_handler![
      system_check::detect_gpu_suggestion,
      system_check::open_external_url,
      update_check::check_for_updates,
      core_bridge::core_pair,
      core_bridge::core_auto_claim,
      core_bridge::core_connection,
      core_bridge::core_shared_access,
      core_bridge::core_save_private,
      core_bridge::core_private_manuscripts,
      core_bridge::core_private_versions,
      core_bridge::core_private_revision,
      core_bridge::core_publish_shared,
      core_bridge::core_revoke_shared
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // On Windows/Linux, a storybookai:// link spawns a *new* instance of
      // this app with the URL as its only CLI argument (see
      // roadmap-ideas.md #35) — there's no separate "deep link" event to
      // listen for there, unlike macOS/iOS. Check once at startup: if this
      // process was launched that way, run the same update check the
      // in-app button uses, and jump straight to the release page when
      // one is available — that's the one useful thing a browser-tab user
      // clicking such a link is asking for.
      let deep_link = app.deep_link();
      deep_link.handle_cli_arguments(std::env::args());
      let launched_via_deep_link = deep_link
        .get_current()
        .ok()
        .flatten()
        .is_some_and(|urls| urls.iter().any(|url| url.scheme() == "storybookai"));
      if launched_via_deep_link
        && let Ok(status) = update_check::check_for_updates(app.handle().clone())
        && status.update_available
      {
        let _ = tauri_plugin_opener::open_url(status.release_url, None::<&str>);
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
