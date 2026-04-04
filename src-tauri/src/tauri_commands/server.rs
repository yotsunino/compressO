#![allow(unexpected_cfgs)]

#[cfg(target_os = "linux")]
use crate::core::server::ServerState;

/// Get the local video server URL
///
/// This command returns the base URL of the local HTTP server that serves video files on Linux.
/// The frontend should use this URL to construct video URLs instead of file:// paths.
///
/// # Returns
/// * `String` - The base server URL (e.g., "http://127.0.0.1:54321")
///
/// # Example
/// ```javascript
/// const serverUrl = await invoke('get_video_server_url');
/// const videoUrl = `${serverUrl}/video?path=${encodeURIComponent(filePath)}`;
/// ```
#[cfg(target_os = "linux")]
#[tauri::command]
pub fn get_video_server_url(state: tauri::State<ServerState>) -> Result<String, String> {
    Ok(format!("http://127.0.0.1:{}", state.port))
}

/// Get the local video server URL (non-Linux stub)
///
/// On non-Linux platforms, this returns an error since the server is not needed.
#[cfg(not(target_os = "linux"))]
#[tauri::command]
pub fn get_video_server_url() -> Result<String, String> {
    Err("Video server is only available on Linux".to_string())
}

/// Construct a video URL for the local server
///
/// This is a convenience command that constructs the full video URL with the file path.
///
/// # Arguments
/// * `file_path` - The absolute path to the video file
///
/// # Returns
/// * `String` - The complete video URL
///
/// # Example
/// ```javascript
/// const videoUrl = await invoke('get_video_url', { filePath: '/path/to/video.mp4' });
/// // Returns: "http://127.0.0.1:54321/video?path=%2Fpath%2Fto%2Fvideo.mp4"
/// ```
#[cfg(target_os = "linux")]
#[tauri::command]
pub fn get_video_url(
    state: tauri::State<ServerState>,
    file_path: String,
) -> Result<String, String> {
    // URL encode the file path
    let encoded_path = urlencoding::encode(&file_path);
    Ok(format!(
        "http://127.0.0.1:{}/video?path={}",
        state.port, encoded_path
    ))
}

/// Construct a video URL (non-Linux stub)
///
/// On non-Linux platforms, this returns an error since the server is not needed.
#[cfg(not(target_os = "linux"))]
#[tauri::command]
pub fn get_video_url(file_path: String) -> Result<String, String> {
    Err("Video server is only available on Linux".to_string())
}
