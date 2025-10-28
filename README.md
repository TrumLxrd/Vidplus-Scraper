### Overview

The VidPlus.to Sora module integrates **The Movie Database (TMDB) API** for searching and metadata, and the VidPlus.to streaming platform for playback of movies/TV shows. The code exposes functions to search for content, extract metadata and episode lists, and resolve stream URLs. It is designed for JavaScript-compatible environments, following Sora module conventions and supporting both movies and TV series.

---

### Installation and Configuration

- **TMDB API Key**: The script requires a TMDB API key. Get your own key from https://www.themoviedb.org/settings/api.
- **Script Hosting**: Host the JavaScript file (`vidplus.js` or the optimized version) on a web server. Update the `scriptUrl` in your JSON config to point to the hosted location.
- **JSON Metadata**: Use a JSON descriptor (`vidplus.json`) for platform integration, providing source identity, icons, endpoints, stream type, video quality, and subtitles support.

---

### Main Components

#### External Dependencies

- **TMDB API**: For search, details lookup, and episode data.
- **VidPlus.to**: For embedding stream URLs using TMDB IDs.
- **Optional Global Extractor**: The optimized version can load a global extractor module for advanced stream URL resolution (e.g., transforming embed pages to direct `.m3u8`/`.mp4` links).

#### Core Constants

- `TMDBAPIKEY`: The Movie Database API key.
- `TMDBBASEURL`: Base TMDB API endpoint (`https://api.themoviedb.org/3`).
- `TMDBIMAGEBASE`: Image CDN prefix (`https://image.tmdb.org/t/p/w500`).
- `VIDPLUSBASEURL`: VidPlus embed root (`https://player.vidplus.to/embed`).

#### Main Functions

| Function             | Description                                                                                                               |
|----------------------|---------------------------------------------------------------------------------------------------------------------------|
| `searchResults()`    | Searches TMDB for movies/TV with a keyword; returns up to 15–20 results, including title, poster, and VidPlus href.      |
| `extractDetails()`   | Gets full metadata (overview, release, runtime/season info) from TMDB based on a VidPlus-formatted URL.                   |
| `extractEpisodes()`  | For movies: returns a single video entry. For TV: Lists all seasons & episodes, fetching details from TMDB and constructing VidPlus embed URLs. |
| `extractStreamUrl()` | Validates and possibly re-formats VidPlus embed URLs for direct playback. If a global extractor is enabled, attempts advanced stream extraction. |

---

### Usage Flow

1. **Search**: User enters a keyword → `searchResults` queries TMDB → returns formatted list with VidPlus link per result.
2. **Show Details**: Selecting a result triggers `extractDetails` for metadata (title, description, runtime, release year, etc.).
3. **Episodes**: For TV shows, `extractEpisodes` lists all episodes with dynamically composed VidPlus embed URLs; for movies, a single entry is returned.
4. **Streaming**: Sora (or compatible player) uses `extractStreamUrl` to resolve the direct streaming URL or handle embedding.

---

### Notable Design Points

- **Fallbacks**: Optimized code tries different approaches (optional extractor module, local/package loading) and degrades gracefully if TMDB or any season/episode fetch fails.
- **Error Handling**: Most async actions are wrapped in try/catch blocks, returning structured error results if requests fail.
- **Performance Limits**: TV show episode extraction is capped (e.g., up to 10 seasons, 20 episodes if fetch fails).
- **Extensibility**: Core logic is modular and can be adapted for direct use or by other "Sora" compatible extractors.

---

### Configuration Reference (`vidplus.json`)

| Field            | Value (Example)                                 | Description                                                  |
|------------------|-------------------------------------------------|--------------------------------------------------------------|
| `sourceName`     | VidPlus.to                                      | Display name of the source                                   |
| `iconUrl`        | https://vidplus.to/favicon.ico                  | Small logo/icon                                              |
| `author`         | Assistant                                       | Module creator                                               |
| `version`        | 1.0.0                                           | Module version                                               |
| `language`       | English                                         | Default language                                             |
| `streamType`     | HLS                                             | Video stream protocol                                        |
| `quality`        | 1080p                                           | Default video quality                                        |
| `baseUrl`        | https://player.vidplus.to                       | Base embedding endpoint                                      |
| `searchBaseUrl`  | https://api.themoviedb.org/...                  | Search API endpoint with TMDB key                            |
| `scriptUrl`      | https://.../vidplus.js                          | Location of the JavaScript extractor module                  |
| `asyncJS`        | true                                            | JS loads asynchronously                                      |
| `type`           | movies                                          | Supported media types                                        |
| `softsub`        | true                                            | Supports soft subtitles                                      |
