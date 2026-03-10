import api from "../config/api.js"
import { WatchmodeClient } from '@watchmode/api-client';

const client = new WatchmodeClient({
    apiKey: "MKQPavNHsF71psVbyivpHx4tonyXPSVXznuchhSy"
});

export const searchMovies = async (query, page = 1) => {
    const { data } = await api.get("/search/movie", {
        params: { query, page },
    })
    return data
}

export const getPopularMovies = async (page = 1) => {
    const { data } = await api.get("/movie/popular", {
        params: { page },
    })
    return data
}

export const getMovieDetails = async (movie_id) => {
    const { data } = await api.get(`/movie/${movie_id}`)
    return data
}

export const searchMulti = async (query, page = 1) => {

    const { data } = await api.get("/search/multi", {
        params: {
            query,
            include_adult: false,
            language: "en-US",
        },
    })

    return data.results
        .filter(item => item.poster_path)
        .map(item => ({
            id: item.id,
            title: item.title || item.name,
            overview: item.overview,
            poster: getImageUrl(item.poster_path),
            backdrop: getImageUrl(item.backdrop_path, "original"),
            media_type: item.media_type,
            release_date: item.release_date || item.first_air_date,
            rating_percentage: Math.round(item.vote_average * 10) + "%",
            vote_count: item.vote_count,
        }))
}

export const fetchTrending = async (type = "all", time = "week") => {

    const { data } = await api.get(`/trending/${type}/${time}`)

    return data?.results?.map(item => ({
        id: item.id,
        title: item.title || item.name,
        poster: getImageUrl(item.poster_path),
        media_type: item.media_type,
    }))

}

export const fetchDetails = async (id, media_type) => {
    if (!id || !media_type) {
        throw new Error("id and media_type are required")
    }

    const [data, videos] = await Promise.all([
        api.get(`/${media_type}/${id}`),
        api.get(`/${media_type}/${id}/videos`)
    ]);

    const trailer =
        videos?.data?.results?.find(
            (video) =>
                video.site === "YouTube" &&
                video.type === "Trailer" &&
                video.official === true
        ) ||
        videos?.data?.results?.find(
            (video) =>
                video.site === "YouTube" &&
                video.type === "Trailer"
        );

    const { data: checking } = await client.title.getDetails(`${media_type}-${id}`);

    const { data: sources } = await client.title.getSources(checking?.id, {
        regions: "US"
    });

    const { data: all_sources } = await client.sources.list();
    const logo = Object.fromEntries(all_sources.map((s) => [s.id, s.logo_100px]));

    const watchmode_providers = Array.from(
        new Map(
            sources?.map((p) => [
                p.source_id,
                {
                    source_id: p.source_id,
                    name: p.name,
                    type: p.type,
                    region: p.region,
                    ios_url: p.ios_url,
                    android_url: p.android_url,
                    web_url: p.web_url,
                    formats: [p.format],
                    price: p.price,
                    seasons: p.seasons,
                    episodes: p.episodes,
                    logo_url: logo[p.source_id] || null
                }
            ]) || []
        ).values()
    )

    return {
        id: data?.data?.id,
        media_type,
        title: data?.data?.title || data?.data?.name,
        overview: data?.data?.overview,
        poster: getImageUrl(data?.data?.poster_path, "w500"),
        backdrop: getImageUrl(data?.data?.backdrop_path, "w780"),
        release_date: (data?.data?.release_date || data?.data?.first_air_date || "").split("-")[0],
        rating_percentage: `${Math.ceil(data?.data?.vote_average * 10)}%`,
        genres: data?.data?.genres?.map((g) => g.name) || [],
        runtime: data?.data?.runtime || data?.data?.episode_run_time?.[0] || null,
        number_of_seasons: data?.data?.number_of_seasons || null,
        trailer_key: trailer?.key || null,
        trailer_url: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
        providers: watchmode_providers
    };
}

export const getImageUrl = (path, size = "w500") => {
    return path
        ? `https://image.tmdb.org/t/p/${size}${path}`
        : null
}