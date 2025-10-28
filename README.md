# 🍿 VidPlus.to Module Documentation 🎬

---

## 🚀 Overview

The **VidPlus.to Sora module** integrates TMDB (The Movie Database) API 🔎 for discovering movie/TV info and the VidPlus.to streaming platform for fast playback. It exposes handy functions to:
- Search content 🔍
- Extract metadata 📝
- List episodes 📺
- Resolve streaming URLs 🎥

Designed for JavaScript apps (like Sora modules), it supports both movies and TV shows seamlessly!

---

## ⚙️ Quick Setup

- **TMDB API Key**: Replace the built-in key with your own from [TMDB Settings](https://www.themoviedb.org/settings/api) 🔑
- **Script Hosting**: Upload your script (`vidplus.js` or optimized) to a web server/cloud ☁️, and set the `scriptUrl` in your config JSON.
- **JSON Descriptor**: Use `vidplus.json` to declare name, icons, API URLs, HLS/1080p support, subtitles, and async JS usage:

---

## 🔗 External APIs & Files

- **TMDB API**: For movie/series info, images, and episode data 🎦
- **VidPlus.to**: For streaming embeds using TMDB IDs 🍿
- **Global Extractor (optional)**: Enables advanced `.m3u8`/`.mp4` extraction (optimized only) 🧰

---

## 🧑‍💻 Core Constants

| Constant          | Value/Use Example                   |
|-------------------|-------------------------------------|
| `TMDBAPIKEY`      | e.g. `d9956abacedb5b43a16cc4864b26d451`  |
| `TMDBBASEURL`     | `https://api.themoviedb.org/3`      |
| `TMDBIMAGEBASE`   | `https://image.tmdb.org/t/p/w500`   |
| `VIDPLUSBASEURL`  | `https://player.vidplus.to/embed`   |

---

## 🏗️ Main Functions

| Function                | Purpose/Description                                                                                                                                   |
|-------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `searchResults()`       | TMDB search by keyword – gets up to 15–20 results (title, image, VidPlus URL) 🔍                                                                      |
| `extractDetails()`      | Loads full metadata like synopsis, release date, runtime, or season info 📝                                                                            |
| `extractEpisodes()`     | Lists all episodes for TV, or a single entry for movies; builds VidPlus embed URLs for each episode 🎞                                               |
| `extractStreamUrl()`    | Validates and (if needed) rewrites VidPlus embed links for playback; uses extractor lib for raw streams when available ⚡                             |

---

## 🛣️ Usage Flow

1. **Search**: User provides keyword → TMDB search → gets VidPlus links 🚦
2. **Details**: Selecting a title loads summary, year, poster, runtime, etc. 📖
3. **Episodes**: For TV, all seasons & episodes are listed; for movies, just one video 🎬
4. **Stream!**: Final streaming URL is passed to the Sora app or player 🔗

---

## 🏆 Key Features & Design

- **Graceful Fallbacks**: Tries local/package extractors, auto-degrades if external lookup (TMDB/season) fails 🤞
- **Robust Error Handling**: All network actions use try/catch; friendly fallback messages returned if needed 🛡️
- **Performance Guardrails**: TV extraction capped at 10 seasons/20 episodes if API fails to limit overload 🚦
- **Modular & Hackable**: Functions are pluggable for Sora modules or custom extractors 🧩

---

## 📝 Example JSON Config (`vidplus.json`)

| Field           | Example Value                        | Description                        |
|-----------------|--------------------------------------|------------------------------------|
| `sourceName`    | VidPlus.to                           | Display name                       |
| `iconUrl`       | https://vidplus.to/favicon.ico       | Logo/icon                          |
| `author`        | Assistant                            | Module creator                     |
| `version`       | 1.0.0                                | Module version                     |
| `language`      | English                              | Default language                   |
| `streamType`    | HLS                                  | Video protocol                     |
| `quality`       | 1080p                                | Max default quality                |
| `baseUrl`       | https://player.vidplus.to            | Embed endpoint                     |
| `searchBaseUrl` | https://api.themoviedb.org/...       | Search API with TMDB key           |
| `scriptUrl`     | https://.../vidplus.js               | Loader for the JS extractor        |
| `asyncJS`       | true                                 | JS loads async                     |
| `type`          | movies                               | Supported media types              |
| `softsub`       | true                                 | Soft subtitle support              |

---

## 🌟 Summary

This enhanced module connects TMDB discovery and streaming via VidPlus.to (using Sora integration), with snappy search, episode metadata, error resilience, and streaming extraction. Adapt, extend, and enjoy seamless streaming! 🎥🍿✨
