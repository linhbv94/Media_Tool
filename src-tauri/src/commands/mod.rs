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

#[tauri::command]
pub fn print_file(window: tauri::Window, file_path: String) -> Result<(), String> {
    let _ = &window;
    #[cfg(target_os = "macos")]
    {
        use cocoa::base::{id, nil, BOOL, YES};
        use cocoa::foundation::NSString;
        use objc::{msg_send, sel, sel_impl};

        unsafe {
            let bundle_cls = match objc::runtime::Class::get("NSBundle") {
                Some(cls) => cls,
                None => return Err("NSBundle class not found".into()),
            };
            let framework_path = NSString::alloc(nil).init_str("/System/Library/Frameworks/PDFKit.framework");
            let bundle: id = msg_send![bundle_cls, bundleWithPath: framework_path];
            if bundle != nil {
                let _: BOOL = msg_send![bundle, load];
            }

            let pdf_doc_cls = match objc::runtime::Class::get("PDFDocument") {
                Some(cls) => cls,
                None => return Err("PDFKit PDFDocument class not available".into()),
            };

            let ns_url_cls = match objc::runtime::Class::get("NSURL") {
                Some(cls) => cls,
                None => return Err("NSURL class not found".into()),
            };

            let ns_path = NSString::alloc(nil).init_str(&file_path);
            let file_url: id = msg_send![ns_url_cls, fileURLWithPath: ns_path];

            let pdf_doc: id = msg_send![pdf_doc_cls, alloc];
            let pdf_doc: id = msg_send![pdf_doc, initWithURL: file_url];

            if pdf_doc == nil {
                return Err("Failed to load PDF document for printing".into());
            }

            let ns_print_info_cls = match objc::runtime::Class::get("NSPrintInfo") {
                Some(cls) => cls,
                None => return Err("NSPrintInfo class not found".into()),
            };
            let shared_print_info: id = msg_send![ns_print_info_cls, sharedPrintInfo];

            let print_op: id = msg_send![pdf_doc, printOperationWithPrintInfo: shared_print_info autoRotate: YES];
            if print_op == nil {
                return Err("Failed to create print operation".into());
            }

            let _: () = msg_send![print_op, setShowsPrintPanel: YES];
            let _: () = msg_send![print_op, setShowsProgressPanel: YES];

            let _: BOOL = msg_send![print_op, runOperation];
        }
        Ok(())
    }

    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("powershell")
            .args(&[
                "-NoProfile",
                "-Command",
                &format!("Start-Process -FilePath '{}' -Verb Print", file_path.replace("'", "''")),
            ])
            .spawn();
        Ok(())
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let _ = std::process::Command::new("lpr")
            .arg(&file_path)
            .spawn();
        Ok(())
    }
}
