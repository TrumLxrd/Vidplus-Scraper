
// VidPlus.to Sora Module
// This module integrates TMDB API for content discovery with VidPlus.to for streaming
// Note: You'll need to get your own TMDB API key from https://www.themoviedb.org/settings/api

const TMDB_API_KEY = "d9956abacedb5b43a16cc4864b26d451"; // Replace with your actual TMDB API key
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const VIDPLUS_BASE_URL = "https://player.vidplus.to/embed";

async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetchv2(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodedKeyword}`);
        const data = await response.json();

        console.log("TMDB Search results:", data);

        if (!data.results || data.results.length === 0) {
            return JSON.stringify([]);
        }

        const transformedResults = data.results
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .map(item => {
                const title = item.media_type === 'movie' ? item.title : item.name;
                const posterPath = item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : '';

                return {
                    title: title,
                    image: posterPath,
                    href: `vidplus://${item.media_type}/${item.id}` // Custom href format
                };
            })
            .slice(0, 20); // Limit to 20 results

        console.log("Transformed results:", transformedResults);
        return JSON.stringify(transformedResults);

    } catch (error) {
        console.log('Search error:', error);
        return JSON.stringify([{ title: 'Search Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        // Parse our custom URL format: vidplus://movie/12345 or vidplus://tv/67890
        const match = url.match(/vidplus:\/\/(movie|tv)\/(\d+)/);
        if (!match) {
            throw new Error("Invalid URL format");
        }

        const mediaType = match[1];
        const tmdbId = match[2];

        const response = await fetchv2(`${TMDB_BASE_URL}/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}`);
        const data = await response.json();

        console.log("TMDB Details:", data);

        let description = data.overview || 'No description available';
        let aliases = mediaType === 'movie' ? 
            `Runtime: ${data.runtime || 'Unknown'} minutes` : 
            `Seasons: ${data.number_of_seasons || 'Unknown'}`;
        let airdate = mediaType === 'movie' ? 
            `Released: ${data.release_date || 'Unknown'}` : 
            `First Air Date: ${data.first_air_date || 'Unknown'}`;

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
        if (!match) {
            throw new Error("Invalid URL format");
        }

        const mediaType = match[1];
        const tmdbId = match[2];

        if (mediaType === 'movie') {
            // For movies, return a single "episode"
            return JSON.stringify([{
                href: `${VIDPLUS_BASE_URL}/movie/${tmdbId}`,
                number: "Movie"
            }]);
        }

        // For TV shows, get all seasons and episodes
        const showResponse = await fetchv2(`${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}`);
        const showData = await showResponse.json();

        const episodes = [];
        let episodeCounter = 1;

        // Iterate through each season
        for (let seasonNum = 1; seasonNum <= (showData.number_of_seasons || 1); seasonNum++) {
            try {
                const seasonResponse = await fetchv2(`${TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNum}?api_key=${TMDB_API_KEY}`);
                const seasonData = await seasonResponse.json();

                if (seasonData.episodes && seasonData.episodes.length > 0) {
                    seasonData.episodes.forEach((episode, index) => {
                        episodes.push({
                            href: `${VIDPLUS_BASE_URL}/tv/${tmdbId}/${seasonNum}/${episode.episode_number}`,
                            number: `S${seasonNum}E${episode.episode_number}`
                        });
                    });
                }
            } catch (seasonError) {
                console.log(`Error fetching season ${seasonNum}:`, seasonError);
                // If we can't get specific episodes, create generic ones
                for (let ep = 1; ep <= 20; ep++) { // Assume max 20 episodes per season
                    episodes.push({
                        href: `${VIDPLUS_BASE_URL}/tv/${tmdbId}/${seasonNum}/${ep}`,
                        number: `S${seasonNum}E${ep}`
                    });
                }
            }
        }

        console.log("Episodes found:", episodes.length);
        return JSON.stringify(episodes);

    } catch (error) {
        console.log('Episodes error:', error);
        return JSON.stringify([]);
    }
}

async function extractStreamUrl(url) {
    try {
        // The URL should already be a VidPlus.to embed URL at this point
        console.log("Stream URL requested:", url);

        // VidPlus.to URLs are direct embed URLs, so we just return them
        // The Sora app will handle the embedding
        return url;

    } catch (error) {
        console.log('Stream extraction error:', error);
        return null;
    }
}

// Note for implementation:
// 1. Replace YOUR_TMDB_API_KEY with an actual TMDB API key
// 2. Host this JavaScript file on a publicly accessible URL
// 3. Update the scriptUrl in the JSON configuration to point to your hosted file
// 4. The module uses TMDB for content discovery and VidPlus.to for streaming
// 5. VidPlus.to requires TMDB IDs for movies and TV shows, which this module provides
