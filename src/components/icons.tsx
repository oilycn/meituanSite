import type { SVGProps } from "react";

export function MeituanIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      {...props}
    >
      <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4" />
      <path
        d="M25 65C25 65 35 50 50 50C65 50 75 65 75 65"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M35 45C35 45 40 40 50 40C60 40 65 45 65 45"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
