#[tauri::command]
pub async fn create_media_window(
    app: tauri::AppHandle,
    label: String,
    title: String,
) -> Result<(), String> {
    let url_str = format!("index.html?win={}", label);
    let mut builder = tauri::WebviewWindowBuilder::new(
        &app,
        &label,
        tauri::WebviewUrl::App(url_str.into()),
    )
    .title(&title)
    .inner_size(1100.0, 750.0)
    .min_inner_size(280.0, 180.0)
    .resizable(true);

    #[cfg(target_os = "macos")]
    {
        builder = builder
            .title_bar_style(tauri::TitleBarStyle::Overlay)
            .hidden_title(true);
    }

    #[cfg(target_os = "windows")]
    {
        builder = builder.decorations(false);
    }

    builder.build().map_err(|e| e.to_string())?;
    Ok(())
}
