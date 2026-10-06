pub mod clipboard;
pub mod dialog;
pub mod fs_scan;
pub mod metadata;
pub mod window;

#[tauri::command]
pub fn set_always_on_top(window: tauri::Window, is_pinned: bool) -> Result<bool, String> {
    window.set_always_on_top(is_pinned).map_err(|e| e.to_string())?;
    Ok(is_pinned)
}

#[tauri::command]
pub fn set_traffic_lights_visible(window: tauri::Window, visible: bool) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        use cocoa::base::{id, BOOL, NO, YES};
        use objc::{msg_send, sel, sel_impl};

        if let Ok(ns_win_ptr) = window.ns_window() {
            let ns_window = ns_win_ptr as id;
            unsafe {
                let hidden_val: BOOL = if visible { NO } else { YES };
                // 0 = Close, 1 = Miniaturize, 2 = Zoom
                for btn_id in 0..3 {
                    let btn: id = msg_send![ns_window, standardWindowButton: btn_id];
                    if btn != cocoa::base::nil {
                        let _: () = msg_send![btn, setHidden: hidden_val];
                    }
                }
                let _: () = msg_send![ns_window, setTitlebarAppearsTransparent: YES];
            }
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        let _ = window.set_decorations(visible);
    }

    Ok(())
}
