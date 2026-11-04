import { html } from 'lit';
import type { TemplateResult } from 'lit';

export const FilledBookmarkIcon = (className = 'w-6 h-6 text-primary'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="${className}"
  >
    <path d="M6 2a2 2 0 0 0-2 2v18l8-4 8 4V4a2 2 0 0 0-2-2H6z" />
  </svg>
`;

export const OutlineBookmarkIcon = (
  className = 'w-6 h-6 text-primary opacity-50 hover:opacity-100 transition-opacity duration-200'
): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="${className}"
  >
    <path d="M6 2a2 2 0 0 0-2 2v18l8-4 8 4V4a2 2 0 0 0-2-2H6z" />
  </svg>
`;

export const OutlinePaperPlaneIcon = (className = 'w-6 h-6 text-primary'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="${className}"
  >
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22 11 13 2 9 22 2Z" />
  </svg>
`;

export const FilledCopyIcon = (className = 'w-6 h-6 text-primary'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 16 16"
    class="${className}"
  >
    <path
      fill-rule="evenodd"
      d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z"
    />
    <path
      fill-rule="evenodd"
      d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"
    />
  </svg>
`;

export const OutlineChevronUpIcon = (className = 'w-6 h-6 text-primary'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 16 16"
    class="${className}"
  >
    <path
      fill-rule="evenodd"
      d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"
    />
  </svg>
`;

export const OutlineChevronLeftIcon = (className = 'w-6 h-6 text-primary'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    class="${className}"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
  </svg>
`;

export const OutlineChevronRightIcon = (className = 'w-6 h-6 text-primary'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    class="${className}"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
  </svg>
`;

export const NoImageIcon = (className = 'w-6 h-6 text-primary'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    fill="currentColor"
    class="${className}"
    aria-label="No image"
  >
    <path
      d="M30,3.4141,28.5859,2,2,28.5859,3.4141,30l2-2H26a2.0027,2.0027,0,0,0,2-2V5.4141ZM26,26H7.4141l7.7929-7.793,
      2.3788,2.3787a2,2,0,0,0,2.8284,0L22,19l4,3.9973Zm0-5.8318-2.5858-2.5859a2,2,0,0,0-2.8284,0L19,19.1682l-2.377-2.3771L26,7.4141Z"
    />
    <path
      d="M6,22V19l5-4.9966,1.3733,1.3733,1.4159-1.416-1.375-1.375a2,2,0,0,0-2.8284,0L6,16.1716V6H22V4H6A2.002,2.002,0,0,0,4,6V22Z"
    />
  </svg>
`;

export const TagIcon = (className = 'w-6 h-6 text-primary'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="${className}"
  >
    <path
      d="M20.59 13.41 11 3.83A3 3 0 0 0 8.88 3H5a2 2 0 0 0-2 2v3.88A3 3 0 0 0 3.83 11l9.58 9.59a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83ZM7.5 8A1.5 1.5 0 1 1 9 6.5 1.5 1.5 0 0 1 7.5 8Z"
    />
  </svg>
`;

export const SearchIcon = (
  className = 'w-6 h-6 text-base-content opacity-50 hover:opacity-100'
): TemplateResult => html`
  <svg
    class="${className}"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <g
      stroke-linejoin="round"
      stroke-linecap="round"
      stroke-width="2.5"
      fill="none"
      stroke="currentColor"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.3-4.3"></path>
    </g>
  </svg>
`;

export const CloseIcon = (className = 'w-4 h-4 text-primary'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="${className}"
  >
    <path
      d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
    />
  </svg>
`;

export const InvitationIcon = (className = 'w-6 h-6 text-primary'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="${className}"
  >
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />

    <path d="M18 8v4" />
    <path d="M16 10h4" />
  </svg>
`;

export const OutlineBellIcon = (className = 'w-6 h-6 text-primary'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="${className}"
  >
    <!-- Bell body -->
    <path d="M18 16H6c1.5-1.5 2-2.8 2-5V10a4 4 0 1 1 8 0v1c0 2.2.5 3.5 2 5Z" />

    <!-- Bell clapper -->
    <path d="M10 16a2 2 0 0 0 4 0" />
  </svg>
`;

export const PencilEditIcon = (className = 'w-6 h-6 text-primary'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="${className}"
  >
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
`;

export const PlayIcon = (className = 'w-6 h-6 text-primary'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="${className}"
    aria-label="Play"
  >
    <rect x="2" y="5" width="20" height="14" rx="4" ry="4" fill="currentColor" />
    <polygon points="10 8 16 12 10 16" fill="white" />
  </svg>
`;

export const RetryIcon = (className = 'w-6 h-6 text-primary'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="${className}"
  >
    <path
      d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
    />
  </svg>
`;

export const MenuIcon = (className = 'w-6 h-6 text-base-content'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="${className}"
  >
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </svg>
`;

export const SoloIcon = (className = 'w-6 h-6 text-primary'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="${className}"
  >
    <circle cx="12" cy="7" r="3.2" />
    <path d="M4.5 19c0-3.8 3.4-6.5 7.5-6.5s7.5 2.7 7.5 6.5" />
  </svg>
`;

export const DownloadIcon = (className = 'w-6 h-6 text-primary'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="${className}"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </svg>
`;

export const TrashIcon = (className = 'w-6 h-6 text-primary'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="${className}"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
`;

export const StarIcon = (className = 'w-6 h-6 text-warning'): TemplateResult => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="${className}"
    aria-hidden="true"
  >
    <path
      d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
    />
  </svg>
`;
