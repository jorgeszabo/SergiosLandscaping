/* Line-icon set — 24×24, currentColor stroke, matching the company Design
   System's icon style. Replaces emoji across the app for a professional look. */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconHome = (p: P) => (
  <Svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></Svg>
);
export const IconClipboard = (p: P) => (
  <Svg {...p}><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9z" /><path d="M9 11h6M9 15h4" /></Svg>
);
export const IconInbox = (p: P) => (
  <Svg {...p}><path d="M3 12h5l1.5 3h5L16 12h5" /><path d="M4 12 6 5h12l2 7v7H4z" /></Svg>
);
export const IconGrid = (p: P) => (
  <Svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.4" /><rect x="14" y="3" width="7" height="7" rx="1.4" /><rect x="14" y="14" width="7" height="7" rx="1.4" /><rect x="3" y="14" width="7" height="7" rx="1.4" /></Svg>
);
export const IconUsers = (p: P) => (
  <Svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="3.5" /><path d="M21 21v-2a4 4 0 0 0-3-3.87M16 3.5a3.5 3.5 0 0 1 0 7" /></Svg>
);
export const IconBriefcase = (p: P) => (
  <Svg {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" /></Svg>
);
export const IconPlus = (p: P) => (<Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>);
export const IconMenu = (p: P) => (<Svg {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Svg>);
export const IconChevronLeft = (p: P) => (<Svg {...p}><path d="m15 5-7 7 7 7" /></Svg>);
export const IconChevronRight = (p: P) => (<Svg {...p}><path d="m9 5 7 7-7 7" /></Svg>);
export const IconSearch = (p: P) => (<Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" /></Svg>);
export const IconHelp = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M9.2 9.3a2.8 2.8 0 0 1 5.4 1c0 1.9-2.6 2-2.6 3.5" /><path d="M12 17.2h.01" /></Svg>
);
export const IconCamera = (p: P) => (
  <Svg {...p}><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.2" /></Svg>
);
export const IconPen = (p: P) => (
  <Svg {...p}><path d="M14 5.5 18.5 10 8 20.5 3.5 21l.5-4.5z" /><path d="m13 6.5 4.5 4.5" /></Svg>
);
export const IconCheck = (p: P) => (<Svg {...p}><path d="m5 12.5 4.5 4.5L19 7" /></Svg>);
export const IconDrop = (p: P) => (
  <Svg {...p}><path d="M12 3c-3.5 4.6-5.5 7.5-5.5 10.2a5.5 5.5 0 0 0 11 0C17.5 10.5 15.5 7.6 12 3z" /></Svg>
);
export const IconLogout = (p: P) => (
  <Svg {...p}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 12H3m0 0 3.5-3.5M3 12l3.5 3.5" /></Svg>
);
export const IconTrash = (p: P) => (
  <Svg {...p}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13" /></Svg>
);
export const IconClose = (p: P) => (<Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>);
export const IconGlobe = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" /></Svg>
);
export const IconPin = (p: P) => (
  <Svg {...p}><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></Svg>
);
export const IconChart = (p: P) => (
  <Svg {...p}><path d="M4 20V4M4 20h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></Svg>
);
export const IconBook = (p: P) => (
  <Svg {...p}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19a2 2 0 0 1 2-2h13" /></Svg>
);
