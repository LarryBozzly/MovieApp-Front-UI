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
  vote_average: number;
  vote_count: number;
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
