use base64::prelude::*;
use lofty::file::{AudioFile, TaggedFileExt};
use lofty::probe::Probe;
use lofty::tag::{Accessor, ItemKey};
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioMetadataResponse {
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub album_artist: Option<String>,
    pub track_number: Option<u32>,
    pub year: Option<u32>,
    pub genre: Option<String>,
    pub duration_seconds: Option<f64>,
    pub artwork_data_url: Option<String>,
}

#[tauri::command]
pub fn read_audio_metadata(file_path: String) -> Result<AudioMetadataResponse, String> {
    let path = Path::new(&file_path);
    if !path.exists() {
        return Err(format!("File does not exist: {}", file_path));
    }

    let tagged_file = match Probe::open(path).and_then(|p| p.read()) {
        Ok(f) => f,
        Err(_) => {
            // Fallback: extract title from file stem
            let title = path
                .file_stem()
                .map(|s| s.to_string_lossy().to_string())
                .unwrap_or_else(|| "Unknown".to_string());
            return Ok(AudioMetadataResponse {
                title: Some(title),
                artist: Some("Unknown Artist".to_string()),
                album: None,
                album_artist: None,
                track_number: None,
                year: None,
                genre: None,
                duration_seconds: None,
                artwork_data_url: None,
            });
        }
    };

    let duration_seconds = Some(tagged_file.properties().duration().as_secs_f64());
    let tag = tagged_file.primary_tag().or_else(|| tagged_file.first_tag());

    let mut title = None;
    let mut artist = None;
    let mut album = None;
    let mut album_artist = None;
    let mut track_number = None;
    let mut year = None;
    let mut genre = None;
    let mut artwork_data_url = None;

    if let Some(t) = tag {
        title = t.get_string(&ItemKey::TrackTitle).map(|s| s.to_string());
        artist = t.get_string(&ItemKey::TrackArtist).map(|s| s.to_string());
        album = t.get_string(&ItemKey::AlbumTitle).map(|s| s.to_string());
        album_artist = t.get_string(&ItemKey::AlbumArtist).map(|s| s.to_string());
        genre = t.get_string(&ItemKey::Genre).map(|s| s.to_string());

        if let Some(y) = t.year() {
            year = Some(y);
        }
        if let Some(track) = t.track() {
            track_number = Some(track);
        }

        // Extract artwork picture
        if let Some(pic) = t.pictures().first() {
            let mime = pic.mime_type().map(|m| m.as_str()).unwrap_or("image/jpeg");
            let b64 = BASE64_STANDARD.encode(pic.data());
            artwork_data_url = Some(format!("data:{};base64,{}", mime, b64));
        }
    }

    // Fallback if title is empty
    if title.is_none() {
        title = path.file_stem().map(|s| s.to_string_lossy().to_string());
    }

    Ok(AudioMetadataResponse {
        title,
        artist,
        album,
        album_artist,
        track_number,
        year,
        genre,
        duration_seconds,
        artwork_data_url,
    })
}
