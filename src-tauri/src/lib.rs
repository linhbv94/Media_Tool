mod commands;

use commands::dialog::InitialMediaState;
use tauri::menu::{AboutMetadataBuilder, MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri::{Emitter, Manager, WindowEvent};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .manage(InitialMediaState::default())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {

            // Build Native Menus (macOS Menu Bar & Windows Menu)
            let open_file = MenuItemBuilder::with_id("open_file", "Mở tệp...")
                .accelerator("CmdOrCtrl+O")
                .build(app)?;
            let open_folder = MenuItemBuilder::with_id("open_folder", "Mở thư mục...")
                .accelerator("CmdOrCtrl+Shift+O")
                .build(app)?;
            #[cfg(target_os = "macos")]
            let about_metadata = AboutMetadataBuilder::new()
                .name(Some("VXMedia"))
                .version(Some(env!("CARGO_PKG_VERSION")))
                .copyright(Some("by Viet Linh Bui"))
                .authors(Some(vec!["Viet Linh Bui".into()]))
                .comments(Some("Trình duyệt ảnh & phát media cá nhân siêu nhẹ"))
                .credits(Some(
                    "VXMedia — Trình duyệt ảnh & phát media cá nhân siêu nhẹ (One App, Shared Core)\n\
                    Created by Viet Linh Bui\n\n\
                    [VI] Điểm khác biệt so với các Player/Viewer khác:\n\
                    • Hợp nhất All-in-One: Duyệt ảnh tốc độ cao + Trình phát Video/Audio chuyên dụng trong 1 app.\n\
                    • Lặp đoạn A–B siêu êm: Thuật toán Adaptive Audio Fade (0–100ms) loại bỏ hoàn toàn tiếng nấc giật.\n\
                    • Phát nhạc ngầm toàn cục: Thẻ audio bền vững, tiếp tục nghe nhạc liên tục khi chuyển tab duyệt ảnh.\n\
                    • Quản lý Tab & Đa Cửa sổ: Phân tách Folder Sessions độc lập, tái sử dụng tab và mở cửa sổ song song.\n\
                    • Tích hợp Native OS: Đánh dấu và copy/cut file trực tiếp vào Finder (macOS) / Explorer (Win32 CF_HDROP).\n\n\
                    [EN] Key Differentiators:\n\
                    • All-in-One: Fast photo browsing + Dedicated Video/Audio player in a single unified app.\n\
                    • Smooth A–B Loop: Adaptive Audio Fade (0–100ms) eliminates loop clicks/pops.\n\
                    • Global Playback: Persistent audio playback across photo tabs and folders.\n\
                    • Folder Tabs & Multi-Window: Independent folder sessions with parallel comparison.\n\
                    • Native OS Integration: Mark files and copy directly to Finder / Explorer."
                ))
                .build();

            #[cfg(target_os = "macos")]
            let app_submenu = SubmenuBuilder::new(app, "VXMedia")
                .about(Some(about_metadata))
                .separator()
                .services()
                .separator()
                .hide()
                .hide_others()
                .show_all()
                .separator()
                .quit()
                .build()?;

            let file_submenu = SubmenuBuilder::new(app, "File")
                .item(&open_file)
                .item(&open_folder)
                .separator()
                .close_window()
                .build()?;

            let edit_submenu = SubmenuBuilder::new(app, "Edit")
                .undo()
                .redo()
                .separator()
                .cut()
                .copy()
                .paste()
                .select_all()
                .build()?;

            #[cfg(target_os = "macos")]
            let menu = MenuBuilder::new(app)
                .item(&app_submenu)
                .item(&file_submenu)
                .item(&edit_submenu)
                .build()?;

            #[cfg(not(target_os = "macos"))]
            let menu = MenuBuilder::new(app)
                .item(&file_submenu)
                .item(&edit_submenu)
                .build()?;

            let _ = app.set_menu(menu);

            Ok(())
        })
        .on_menu_event(|app_handle, event| match event.id().as_ref() {
            "open_file" => {
                let _ = app_handle.emit("trigger-open-file", ());
            }
            "open_folder" => {
                let _ = app_handle.emit("trigger-open-folder", ());
            }
            _ => {}
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { .. } = event {
                // Only exit application if this is the last open window
                let remaining = window.app_handle().webview_windows();
                if remaining.len() <= 1 {
                    window.app_handle().exit(0);
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::fs_scan::get_directory_media,
            commands::clipboard::clipboard_files,
            commands::metadata::read_audio_metadata,
            commands::set_always_on_top,
            commands::set_traffic_lights_visible,
            commands::dialog::open_file_dialog,
            commands::dialog::open_folder_dialog,
            commands::dialog::get_initial_media_file,
            commands::dialog::log_frontend,
            commands::window::create_media_window,
            commands::fs_scan::read_file_binary
        ])
        .build(tauri::generate_context!())
        .expect("error while building media_tool");

    commands::dialog::debug_log(&format!("Rust process starting. Args: {:?}", std::env::args().collect::<Vec<_>>()));

    app.run(|app_handle, event| {
        match &event {
            #[cfg(target_os = "macos")]
            tauri::RunEvent::Opened { urls } => {
                commands::dialog::debug_log(&format!("RunEvent::Opened received with {} urls: {:?}", urls.len(), urls));
                for url in urls {
                    let file_path = if let Ok(path) = url.to_file_path() {
                        Some(path.to_string_lossy().to_string())
                    } else if url.scheme() == "file" {
                        Some(url.path().to_string())
                    } else {
                        None
                    };

                    commands::dialog::debug_log(&format!("RunEvent::Opened resolved file_path: {:?}", file_path));

                    if let Some(path_str) = file_path {
                        // 1. Cache for get_initial_media_file() on cold start
                        if let Some(state) = app_handle.try_state::<InitialMediaState>() {
                            if let Ok(mut lock) = state.0.lock() {
                                *lock = Some(path_str.clone());
                                commands::dialog::debug_log(&format!("Saved path to InitialMediaState: {}", path_str));
                            }
                        } else {
                            commands::dialog::debug_log("CRITICAL: try_state::<InitialMediaState>() returned None in RunEvent::Opened!");
                        }

                        // 2. Emit to frontend if webview is already running and listening
                        let emit_res = app_handle.emit("open-media-file", path_str.clone());
                        commands::dialog::debug_log(&format!("Emitted open-media-file: {:?}", emit_res));

                        // 3. Bring window to front
                        if let Some(win) = app_handle.get_webview_window("main") {
                            let _ = win.unminimize();
                            let _ = win.set_focus();
                        }
                    }
                }
            }
            tauri::RunEvent::Ready => {
                commands::dialog::debug_log("RunEvent::Ready received");
            }
            _ => {}
        }
    });
}
