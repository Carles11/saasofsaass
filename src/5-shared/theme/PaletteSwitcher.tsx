"use client";

import { useEffect, useState } from "react";

type Palette = "ocean" | "sunset";

const STORAGE_KEY = "soos-palette";

function getInitialPalette(): Palette {
  if (typeof window === "undefined") return "ocean";
  return (localStorage.getItem(STORAGE_KEY) as Palette) ?? "ocean";
}

function applyPalette(p: Palette) {
  document.documentElement.classList.remove("theme-ocean", "theme-sunset");
  document.documentElement.classList.add(`theme-${p}`);
  localStorage.setItem(STORAGE_KEY, p);
}

export function PaletteSwitcher() {
  const [palette, setPalette] = useState<Palette>("ocean");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const p = getInitialPalette();
    applyPalette(p);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPalette(p);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Palette = palette === "ocean" ? "sunset" : "ocean";
    setPalette(next);
    applyPalette(next);
  }

  if (!mounted) return <div className="h-9 w-9" />;

  return (
    <button
      onClick={toggle}
      className="h-9 w-9 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
      aria-label={`Switch to ${palette === "ocean" ? "sunset" : "ocean"} palette`}
      title={`Palette: ${palette}`}
    >
      {palette === "ocean" ? (
        <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 12h20M12 2v20M8 6l8 12M16 6l-8 12" />
        </svg>
      ) : (
        <svg className="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      )}
    </button>
  );
}
