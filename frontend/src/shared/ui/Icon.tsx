import type { SVGProps } from 'react';
const paths = {
  home: 'M3 10 12 3l9 7v11H3z M9 21v-8h6v8',
  analysis: 'M4 4h16v16H4z M4 15l5-5 4 4 3-3 4 4',
  experiments: 'M9 3h6 M10 3v7l-6 10h16l-6-10V3',
  history: 'M3 12a9 9 0 1 0 3-7 M3 4v8h8 M12 7v5l4 2',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M4 21v-2a8 8 0 0 1 16 0v2',
  settings: 'M4 7h16 M4 17h16 M8 4v6 M16 14v6',
  upload: 'M12 16V3 M6 9l6-6 6 6 M4 16v5h16v-5',
} as const;
export type IconName = keyof typeof paths;
export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
