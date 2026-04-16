import { DashboardSidebar } from "@/2-widgets/dashboard/ui/sidebar/DashboardSidebar";
import { TranslationProgressBar } from "@/3-features/translations/ui/translationProgressBar";
import { StoreHydrator } from "@/5-shared/store/StoreHydrator";
import { db } from "@/5-shared/lib/db/index";
import { tenants } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * DASHBOARD LAYOUT (The Workshop)
 * * This layout manages the internal administration experience.
 * * Includes the persistent Sidebar, the AI Progress Bar, and Store Hydration.
 */
export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // We hydrate the store with a null tenant initially for the global dashboard,
  // or fetch a specific one if the context implies it. 
  // For the Site Builder, hydration usually happens at the page level 
  // or in a more specific nested layout.
  
  return (
    <div className="flex min-h-screen bg-white">
      {/* Global AI Feedback (only visible when useStore(isTranslating) is true) */}
      <TranslationProgressBar />
      
      {/* Persistent "Bentley" Sidebar */}
      <DashboardSidebar />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}