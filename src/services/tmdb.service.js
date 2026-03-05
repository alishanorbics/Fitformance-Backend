import api from "../config/api.js"

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

    const [data, videos, providers] = await Promise.all([
        api.get(`/${media_type}/${id}`),
        api.get(`/${media_type}/${id}/videos`),
        api.get(`/${media_type}/${id}/watch/providers`)
    ])

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
        )

    console.log("providers", providers?.data?.results?.US)

    const us_providers = providers?.data?.results?.US || {}

    const all_providers = [
        ...(us_providers?.flatrate || []),
        ...(us_providers?.rent || []),
        ...(us_providers?.buy || [])
    ]

    const unique_providers = Array.from(
        new Map(all_providers.map(p => [p.provider_id, p])).values()
    ).sort((a, b) => a.display_priority - b.display_priority).map(p => ({
        ...p,
        logo_url: getImageUrl(p.logo_path, "w200")
    }))

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
        runtime:
            data?.data?.runtime || data?.data?.episode_run_time?.[0] || null,
        number_of_seasons: data?.data?.number_of_seasons || null,

        trailer_key: trailer?.key || null,
        trailer_url: trailer
            ? `https://www.youtube.com/watch?v=${trailer.key}`
            : null,
        tmdb_watch_link: us_providers?.link || null,
        providers: unique_providers
    }
}

export const getImageUrl = (path, size = "w500") => {
    return path
        ? `https://image.tmdb.org/t/p/${size}${path}`
        : null
}