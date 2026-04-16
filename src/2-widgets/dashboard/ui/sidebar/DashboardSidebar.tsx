"use client";

import { useStore } from "@/5-shared/store/index";
import { motion } from "framer-motion";

/**
 * WIDGET: Dashboard Sidebar
 * Demonstrates consuming and modifying the Global UI Slice.
 * * Uses explicit index import to ensure resolution across all build environments.
 */
export const DashboardSidebar = () => {
  // Select only the needed state to prevent unnecessary re-renders
  const isOpen = useStore((state) => state.isSidebarOpen);
  const toggle = useStore((state) => state.toggleSidebar);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isOpen ? 280 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-screen bg-zinc-950 text-white p-4 border-r border-white/10 flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between mb-8 px-2">
        {isOpen && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-black tracking-tighter text-xl"
          >
            SoSs
          </motion.span>
        )}
        <button 
          onClick={toggle}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {/* Navigation items - placeholders for the Bentley Factory */}
        {[
          { icon: "⊞", label: "Dashboard" },
          { icon: "◎", label: "Sites" },
          { icon: "✦", label: "AI Tools" },
          { icon: "⚙", label: "Settings" }
        ].map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group"
          >
            <span className="text-xl w-6 flex justify-center group-hover:scale-110 transition-transform font-mono">
              {item.icon}
            </span>
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-medium tracking-tight"
              >
                {item.label}
              </motion.span>
            )}
          </button>
        ))}
      </nav>

      {isOpen && (
        <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-1">
            Active Engine
          </p>
          <p className="text-xs font-mono text-emerald-400">v16.2.0-turbo</p>
        </div>
      )}
    </motion.aside>
  );
};