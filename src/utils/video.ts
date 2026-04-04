import { invoke } from '@tauri-apps/api/core'

import { getPlatform } from './fs'

/**
 * Cache for the video server URL to avoid repeated Tauri invocations
 */
let cachedServerUrl: string | null = null

/**
 * Get the video server URL (Linux only)
 * On other platforms, this returns null
 */
async function getVideoServerUrl(): Promise<string | null> {
  const platform = getPlatform()

  // Only use the server on Linux
  if (!platform.isLinux) {
    return null
  }

  // Return cached URL if available
  if (cachedServerUrl) {
    return cachedServerUrl
  }

  try {
    // Call the Tauri command to get the server URL
    const serverUrl = await invoke<string>('get_video_server_url')
    cachedServerUrl = serverUrl
    return serverUrl
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: <>
    console.error('Failed to get video server URL:', error)
    return null
  }
}

/**
 * Converts a file path to a video URL that works on the current platform
 *
 * On Linux: Returns HTTP server URL (http://127.0.0.1:PORT/video?path=...)
 * On macOS/Windows: Returns the path as-is (or converts to file:// if needed)
 *
 * @param filePath - The absolute path to the video file
 * @returns Promise resolving to the video URL
 */
export async function getVideoUrl(filePath: string): Promise<string> {
  const platform = getPlatform()

  if (platform.isLinux) {
    // Use the local HTTP server on Linux
    const serverUrl = await getVideoServerUrl()

    if (!serverUrl) {
      // Fallback: if server isn't available, try using the path directly
      // This won't work due to the WebKit bug, but it's better than nothing
      // biome-ignore lint/suspicious/noConsole: <>
      console.warn('Video server not available, file may not play on Linux')
      return filePath
    }

    // Use the Tauri command to get the complete video URL
    try {
      return await invoke<string>('get_video_url', { filePath })
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: <>
      console.error('Failed to generate video URL:', error)
      // Fallback to constructing the URL manually
      const encodedPath = encodeURIComponent(filePath)
      return `${serverUrl}/video?path=${encodedPath}`
    }
  }

  // On macOS and Windows, return the path as-is
  // ReactPlayer and the browser will handle it correctly
  return filePath
}

/**
 * Clears the cached server URL
 * Call this if the server restarts
 */
export function clearVideoServerCache(): void {
  cachedServerUrl = null
}
