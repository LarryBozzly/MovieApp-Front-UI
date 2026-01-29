interface Dates {
  maximum: string;
  minimum: string;
}

export interface VersionResponse {
  version: string;
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
  videos?: MovieVideo[];
}
export const BroadcastChannelType = {
  AUTH_CHANNEL: 'auth_channel',
} as const;
export type BroadcastChannelType = (typeof BroadcastChannelType)[keyof typeof BroadcastChannelType];

export const AuthChannelEvent = {
  LOGIN: 'login',
  LOGOUT: 'logout',
} as const;
export type AuthChannelEvent = (typeof AuthChannelEvent)[keyof typeof AuthChannelEvent];

export const VideoSite = {
  YouTube: 'YouTube',
  Vimeo: 'Vimeo',
} as const;
export type VideoSite = (typeof VideoSite)[keyof typeof VideoSite];

export const VideoType = {
  Trailer: 'Trailer',
  Teaser: 'Teaser',
  Clip: 'Clip',
  Featurette: 'Featurette',
  Unknown: 'Unknown',
} as const;
export type VideoType = (typeof VideoType)[keyof typeof VideoType];

export interface MovieVideo {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: VideoSite;
  size: number;
  type: VideoType;
  official: boolean;
  published_at: string;
}

export interface MovieVideosResponse {
  id: number;
  results: MovieVideo[];
}

export const MovieGenre = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  SciFi: 878,
  TVMovie: 10770,
  Thriller: 53,
  War: 10752,
  Western: 37,
} as const;
export type MovieGenre = (typeof MovieGenre)[keyof typeof MovieGenre];
export const MovieGenreMap: Map<number, string> = new Map(
  Object.entries(MovieGenre).map(([key, value]) => [value, key])
);

export const WebSocketStatus = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
} as const;
export type WebSocketStatus = (typeof WebSocketStatus)[keyof typeof WebSocketStatus];

export const MovieMatchDirection = {
  Like: 'like',
  Dislike: 'dislike',
} as const;
export type MovieMatchDirection = (typeof MovieMatchDirection)[keyof typeof MovieMatchDirection];

export const NotificationType = {
  INVITATION: 'invitation',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

// app
export interface LoginRequest {
  email: string;
  password: string;
  remember: boolean;
}

export interface UpdateTagResponse {
  data: UserProfile;
  message: string;
}

export interface LoginResponse {
  data: UserProfile;
  message: string;
}
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse extends LoginResponse {}

export interface VerifyResponse {
  message: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface CheckLoginResponse {
  message: string;
}

export interface WatchlistMoviesResponse {
  success: boolean;
  status_code: number;
  status_message: string;
  list_id: number;
  errors?: string[];
}

export interface WatchlistMoviesIdsResponse {
  mediaIds: number[];
}

export interface WatchlistState {
  isWatchlist: boolean;
  isLoading: boolean;
}

export const MovieCategory = {
  TRENDING: 'trending',
  WATCHLIST: 'watchlist',
  TOP_RATED: 'top-rated',
} as const;
export type MovieCategory = (typeof MovieCategory)[keyof typeof MovieCategory];

export const MovieCategoryMap: Record<MovieCategory, string> = {
  [MovieCategory.TRENDING]: 'Trending',
  [MovieCategory.TOP_RATED]: 'Top Rated',
  [MovieCategory.WATCHLIST]: 'Watchlist',
};

export const ERROR_NAMES = {
  ABORT: 'AbortError' as const,
  TIMEOUT: 'TimeoutError' as const,
};
export type ErrorName = (typeof ERROR_NAMES)[keyof typeof ERROR_NAMES];

export interface MovieListResponse {
  created_by?: string;
  description?: string;
  watchlist_count: number;
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

export interface UserProfile {
  id: number;
  email: string;
  tag: string;
  createdAt: string;
}
