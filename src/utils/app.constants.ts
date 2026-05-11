import { unsafeCSS } from 'lit';
import globalStyles from '../index.css?inline';
import type { Movie } from '@models/models';

export const tailwindStyles = unsafeCSS(globalStyles);

export const MOCK_MOVIES: Movie[] = [
  {
    adult: false,
    softcore: false,
    backdrop_path: '/oiwc338EoBgS4sEI2ixAny4KQKg.jpg',
    genre_ids: [12, 14, 28],
    id: 120,
    original_language: 'en',
    original_title: 'The Lord of the Rings: The Fellowship of the Ring',
    overview:
      'Young hobbit Frodo Baggins, after inheriting a mysterious ring from his uncle Bilbo, must leave his home in order to keep it from falling into the hands of its evil creator. Along the way, a fellowship is formed to protect the ringbearer and make sure that the ring arrives at its final destination: Mt. Doom, the only place where it can be destroyed.',
    popularity: 20.3077,
    poster_path: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
    release_date: '2001-12-18',
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    video: false,
    vote_average: 8.4,
    vote_count: 26980,
    percentage_popularity: 81,
  },
];
