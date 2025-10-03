interface Dates {
  maximum: string;
  minimum: string;
}

export interface MoviesResponse {
  dates: Dates;
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Movie {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number | null;
  vote_count: number;
  percentage_popularity: number;
}

export const WebSocketStatus = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
} as const;
export type WebSocketStatus = typeof WebSocketStatus[keyof typeof WebSocketStatus];

export const MovieMatchDirection = {
  Like: 'like',
  Dislike: 'dislike',
} as const;
export type MovieMatchDirection = typeof MovieMatchDirection[keyof typeof MovieMatchDirection];

// app
export interface LoginRequest {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginResponse {
  data: {
    id: number;
    email: string;
    tag: string;
  };
  message: string;
}

export interface CheckLoginResponse {
  message: string;
}

export interface FavoriteMoviesResponse {
  success: boolean;
  status_code: number;
  status_message: string;
  list_id: number;
  errors?: string[];
}

export interface FavoriteMoviesIdsResponse {
  mediaIds: number[];
}

export interface FavoriteState {
  isFavorite: boolean;
  isLoading: boolean;
}

export const MovieCategory = {
  TRENDING: 'trending',
  FAVORITES: 'favorites',
  TOP_RATED: 'top-rated'
} as const;
export type MovieCategory = typeof MovieCategory[keyof typeof MovieCategory];

export const MovieCategoryMap: Record<MovieCategory, string> = {
  [MovieCategory.TRENDING]: 'Trending',
  [MovieCategory.TOP_RATED]: 'Top Rated',
  [MovieCategory.FAVORITES]: 'Favorites',
};

export const ERROR_NAMES = {
  ABORT: 'AbortError' as const,
  TIMEOUT: 'TimeoutError' as const,
};
export type ErrorName = typeof ERROR_NAMES[keyof typeof ERROR_NAMES];

export interface MovieListResponse {
  created_by?: string;
  description?: string;
  favorite_count: number;
  id: number;
  iso_639_1: string;
  item_count: number;
  items: Movie[];
  name: string;
  page: number;
  poster_path: string | null;
  total_pages: number;
  total_results: number;
}