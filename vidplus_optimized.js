
// VidPlus.to Sora Module - Optimized Version
// Follows exact patterns from working Sora modules

const TMDB_API_KEY = "d9956abacedb5b43a16cc4864b26d451"; // Replace with your TMDB API key
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// Attempt to load a global extractor library if present locally or installed as a package.
// This is optional: if the user has copied `global_extractor.js` next to this file
// or installed `sora-global-extractor`, we'll use it to turn page/embed URLs into
// direct stream URLs (.m3u8, mp4, etc.). If not available, the module will continue
// to operate without it and fall back to existing behavior.
let globalExtractorLib = null;
try {
    // Prefer a local file named `global_extractor.js` placed in the same folder
    globalExtractorLib = require('./global_extractor');
} catch (e1) {
    try {
        // Fall back to a package named `sora-global-extractor` if installed
        globalExtractorLib = require('sora-global-extractor');
    } catch (e2) {
        globalExtractorLib = null;
    }
}

async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await fetchv2(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodedKeyword}`);
        const data = await responseText.json();

        console.log("Search data:", data);

        const transformedResults = data.results
            .filter(item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
            .slice(0, 15)
            .map(item => {
                const title = item.media_type === 'movie' ? item.title : item.name;
                const imageUrl = item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : '';

                return {
                    title: title,
                    image: imageUrl,
                    href: `vidplus://${item.media_type}/${item.id}`
                };
            });

        console.log("Transformed search results:", transformedResults);
        return JSON.stringify(transformedResults);

    } catch (error) {
        console.log('Search error:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const match = url.match(/vidplus:\/\/(movie|tv)\/(\d+)/);
        if (!match) throw new Error("Invalid URL format");

        const mediaType = match[1];
        const tmdbId = match[2];

        const response = await fetchv2(`${TMDB_BASE_URL}/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}`);
        const data = await response.json();

        console.log("Details data:", data);

        let description = data.overview || 'No description available';
        let aliases, airdate;

        if (mediaType === 'movie') {
            aliases = `Runtime: ${data.runtime || 'Unknown'} minutes`;
            airdate = `Released: ${data.release_date || 'Unknown'}`;
        } else {
            aliases = `Seasons: ${data.number_of_seasons || 'Unknown'}`;
            airdate = `First Air Date: ${data.first_air_date || 'Unknown'}`;
        }

        const transformedResults = [{
            description: description,
            aliases: aliases,
            airdate: airdate
        }];

        console.log("Transformed details:", transformedResults);
        return JSON.stringify(transformedResults);

    } catch (error) {
        console.log('Details error:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Unknown',
            airdate: 'Unknown'
        }]);
    }
}

async function extractEpisodes(url) {
    try {
        const match = url.match(/vidplus:\/\/(movie|tv)\/(\d+)/);
        if (!match) throw new Error("Invalid URL format");

        const mediaType = match[1];
        const tmdbId = match[2];

        if (mediaType === 'movie') {
            // For movies, return a single entry
            const episodes = [{
                href: `https://player.vidplus.to/embed/movie/${tmdbId}`,
                number: "1"
            }];
            console.log("Movie episodes:", episodes);
            return JSON.stringify(episodes);
        }

        // For TV shows, get season and episode information
        const showResponse = await fetchv2(`${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}`);
        const showData = await showResponse.json();

        console.log("TV Show data:", showData);

        const episodes = [];
        const numSeasons = Math.min(showData.number_of_seasons || 1, 10); // Limit to 10 seasons for performance

        for (let season = 1; season <= numSeasons; season++) {
            try {
                const seasonResponse = await fetchv2(`${TMDB_BASE_URL}/tv/${tmdbId}/season/${season}?api_key=${TMDB_API_KEY}`);
                const seasonData = await seasonResponse.json();

                if (seasonData.episodes && seasonData.episodes.length > 0) {
                    seasonData.episodes.forEach(episode => {
                        episodes.push({
                            href: `https://player.vidplus.to/embed/tv/${tmdbId}/${season}/${episode.episode_number}`,
                            number: season.toString()
                        });
                    });
                }
            } catch (seasonError) {
                console.log(`Season ${season} error:`, seasonError);
                // Fallback: assume 20 episodes per season
                for (let ep = 1; ep <= 20; ep++) {
                    episodes.push({
                        href: `https://player.vidplus.to/embed/tv/${tmdbId}/${season}/${ep}`,
                        number: season.toString()
                    });
                }
                break; // Don't continue if we hit an error
            }
        }

        console.log("TV episodes found:", episodes.length);
        return JSON.stringify(episodes);

    } catch (error) {
        console.log('Episodes error:', error);
        return JSON.stringify([]);
    }
}

async function extractStreamUrl(url) {
    try {
        console.log("Extracting stream from:", url);

        if (!url) return null;

        // Only enforce for VidPlus embed links hosted on player.vidplus.to
        // Examples we support:
        //  - https://player.vidplus.to/embed/movie/{tmdbId}
        //  - https://player.vidplus.to/embed/tv/{tmdbId}/{season}/{episode}
        const embedHost = 'player.vidplus.to/embed/';
        if (url.includes(embedHost)) {
            try {
                // Use the URL API to safely manipulate query params
                const parsed = new URL(url);
                // Ensure server=1 is present (adds or replaces existing value)
                parsed.searchParams.set('server', '1');
                return parsed.toString();
            } catch (e) {
                // Fallback for environments where URL might fail or for malformed URLs
                if (url.indexOf('?') === -1) {
                    return url + '?server=1';
                }

                // If a server param exists, replace its value with 1, otherwise append &server=1
                if (/([?&])server=[^&]*/.test(url)) {
                    return url.replace(/([?&])server=[^&]*/, '$1server=1');
                }

                return url + '&server=1';
            }
        }

        // If a global extractor library is available, try to extract a direct stream URL.
        if (globalExtractorLib) {
            try {
                const extractorFn = globalExtractorLib.multiExtractor || globalExtractorLib.globalExtractor || globalExtractorLib.extract || null;
                if (typeof extractorFn === 'function') {
                    // The extractor functions are generally async
                    const extractionResult = await extractorFn(url);

                    // extractionResult can be many shapes. Try to find a direct URL (m3u8, mp4, etc.).
                    const candidate = (function findStream(obj) {
                        if (!obj) return null;
                        if (typeof obj === 'string') {
                            if (/\.m3u8($|\?|#)|\.mp4($|\?|#)/i.test(obj)) return obj;
                            return null;
                        }
                        if (Array.isArray(obj)) {
                            for (const item of obj) {
                                const found = findStream(item);
                                if (found) return found;
                            }
                            return null;
                        }
                        if (typeof obj === 'object') {
                            // common keys
                            const keys = [ 'url', 'file', 'src', 'stream', 'link' ];
                            for (const k of keys) {
                                if (obj[k]) {
                                    const found = findStream(obj[k]);
                                    if (found) return found;
                                }
                            }
                            // deep search
                            for (const k in obj) {
                                if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
                                const found = findStream(obj[k]);
                                if (found) return found;
                            }
                        }
                        return null;
                    })(extractionResult);

                    if (candidate) {
                        // Return the direct media URL for Sora playback
                        return candidate;
                    }
                }
            } catch (extractErr) {
                console.log('Global extractor error:', extractErr);
                // fall through and return the original URL as a last resort
            }
        }

        // Non-VidPlus URLs are returned unchanged (or original when extractor not available)
        return url;

    } catch (error) {
        console.log('Stream extraction error:', error);
        return null;
    }
}
