"use client";

import { useStore } from "@/5-shared/store";

/**
 * FEATURE: Translation Progress Bar
 * Provides high-fidelity visual feedback during the Gemini 2.5 AI translation workflow.
 * Uses explicit index resolution to ensure compatibility with Next.js 16.2 Turbopack.
 */
export const TranslationProgressBar = () => {
  const isTranslating = useStore((state) => state.isTranslating);
  const progress = useStore((state) => state.translationProgress);

  if (!isTranslating) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-zinc-100 z-9999">
      {/* Dynamic progress fill with Bentley transition curve */}
      <div
        className="h-full bg-zinc-950 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[0_0_10px_rgba(0,0,0,0.2)]"
        style={{ width: `${progress}%` }}
      />

      {/* Status Badge */}
      <div className="absolute top-6 right-8 flex items-center gap-3 bg-zinc-950 text-white px-4 py-2 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-500">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </div>
        <span className="text-[10px] font-black tracking-[0.2em] uppercase">
          Gemini 2.5: AI Translation {progress}%
        </span>
      </div>
    </div>
  );
};
