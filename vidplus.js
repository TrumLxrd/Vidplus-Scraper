const TMDB_API_KEY = ""; // Replace with your actual TMDB API key
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
                    href: `vidplus://${item.media_type}/${item.id}` 
                };
            })
            .slice(0, 20);

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
            // For movies return a single "episode"
            return JSON.stringify([{
                href: `${VIDPLUS_BASE_URL}/movie/${tmdbId}`,
                number: "Movie"
            }]);
        }

        // For TV shows get all seasons and episodes
        const showResponse = await fetchv2(`${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}`);
        const showData = await showResponse.json();

        const episodes = [];
        let episodeCounter = 1;

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
                for (let ep = 1; ep <= 20; ep++) { 
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
        console.log("Stream URL requested:", url);

        return url;

    } catch (error) {
        console.log('Stream extraction error:', error);
        return null;
    }
}
