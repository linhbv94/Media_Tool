use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MediaType {
    Image,
    Video,
    Audio,
    Pdf,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaItem {
    pub path: String,
    pub name: String,
    pub media_type: MediaType,
    pub extension: String,
    pub size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaListResponse {
    pub parent_dir: String,
    pub current_index: usize,
    pub total_count: usize,
    pub items: Vec<MediaItem>,
}

#[derive(Debug, Eq, PartialEq)]
enum SortChunk {
    Text(String),
    Number(u64),
}

impl Ord for SortChunk {
    fn cmp(&self, other: &Self) -> Ordering {
        match (self, other) {
            (SortChunk::Number(a), SortChunk::Number(b)) => a.cmp(b),
            (SortChunk::Text(a), SortChunk::Text(b)) => a.to_lowercase().cmp(&b.to_lowercase()),
            (SortChunk::Number(_), SortChunk::Text(_)) => Ordering::Less,
            (SortChunk::Text(_), SortChunk::Number(_)) => Ordering::Greater,
        }
    }
}

impl PartialOrd for SortChunk {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

/// Natural Sort chunking: Splits "img12_photo.jpg" into [Text("img"), Number(12), Text("_photo.jpg")]
fn natural_sort_key(s: &str) -> Vec<SortChunk> {
    let mut chunks = Vec::new();
    let mut current_text = String::new();
    let mut current_number = String::new();

    for c in s.chars() {
        if c.is_ascii_digit() {
            if !current_text.is_empty() {
                chunks.push(SortChunk::Text(current_text.clone()));
                current_text.clear();
            }
            current_number.push(c);
        } else {
            if !current_number.is_empty() {
                if let Ok(num) = current_number.parse::<u64>() {
                    chunks.push(SortChunk::Number(num));
                }
                current_number.clear();
            }
            current_text.push(c);
        }
    }

    if !current_text.is_empty() {
        chunks.push(SortChunk::Text(current_text));
    }
    if !current_number.is_empty() {
        if let Ok(num) = current_number.parse::<u64>() {
            chunks.push(SortChunk::Number(num));
        }
    }

    chunks
}

fn classify_extension(ext: &str) -> MediaType {
    match ext.to_lowercase().as_str() {
        "jpg" | "jpeg" | "png" | "webp" | "gif" | "avif" | "bmp" | "svg" | "ico" => MediaType::Image,
        "mp4" | "mov" | "webm" | "mkv" | "avi" | "wmv" | "flv" | "m4v" => MediaType::Video,
        "mp3" | "wav" | "flac" | "m4a" | "ogg" | "aac" | "wma" | "aiff" => MediaType::Audio,
        "pdf" => MediaType::Pdf,
        _ => MediaType::Unknown,
    }
}

#[tauri::command]
pub fn get_directory_media(file_path: String) -> Result<MediaListResponse, String> {
    let target_path = PathBuf::from(&file_path);
    let parent_dir = if target_path.is_dir() {
        target_path.clone()
    } else {
        target_path
            .parent()
            .map(|p| p.to_path_buf())
            .unwrap_or_else(|| PathBuf::from("."))
    };

    let parent_dir_str = parent_dir.to_string_lossy().to_string();
    let mut items = Vec::new();

    if let Ok(entries) = fs::read_dir(&parent_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if !path.is_file() {
                continue;
            }

            let file_name = match path.file_name() {
                Some(name) => name.to_string_lossy().to_string(),
                None => continue,
            };

            // Filter hidden files (.DS_Store, Thumbs.db, .*)
            if file_name.starts_with('.') || file_name.eq_ignore_ascii_case("Thumbs.db") {
                continue;
            }

            let extension = path
                .extension()
                .map(|ext| ext.to_string_lossy().to_string())
                .unwrap_or_default();

            let media_type = classify_extension(&extension);
            if matches!(media_type, MediaType::Unknown) {
                continue;
            }

            let size_bytes = entry.metadata().map(|m| m.len()).unwrap_or(0);

            items.push(MediaItem {
                path: path.to_string_lossy().to_string(),
                name: file_name,
                media_type,
                extension,
                size_bytes,
            });
        }
    }

    // Natural sort ordering
    items.sort_by(|a, b| natural_sort_key(&a.name).cmp(&natural_sort_key(&b.name)));

    let normalized_target = Path::new(&file_path)
        .canonicalize()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or(file_path.clone());

    let current_index = items
        .iter()
        .position(|item| {
            if item.path == file_path {
                return true;
            }
            if let Ok(can) = Path::new(&item.path).canonicalize() {
                if can.to_string_lossy() == normalized_target {
                    return true;
                }
            }
            false
        })
        .unwrap_or(0);

    let total_count = items.len();

    Ok(MediaListResponse {
        parent_dir: parent_dir_str,
        current_index,
        total_count,
        items,
    })
}
