import { TenantPageProps } from "@/5-shared/types";


/**
 * TENANT PAGE (The Public Product)
 * Aesthetic: High-fidelity, Isolated, "Bentley" standard.
 */
export const TenantPage = ({ context }: TenantPageProps) => {
  const { tenant, domain, locale } = context;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-zinc-950 px-6">
      <div className="max-w-5xl w-full text-center space-y-16 py-20 animate-in fade-in zoom-in duration-1000">
        <div className="flex justify-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl shadow-zinc-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
            Verified SoSS Engine • {locale.toUpperCase()}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter text-zinc-900 capitalize leading-none">
            {tenant}
          </h1>
          <p className="text-2xl md:text-3xl text-zinc-400 font-medium italic tracking-tight">
            "Professional Excellence at {domain}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left pt-12">
          <div className="p-10 md:p-14 rounded-[3.5rem] bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-zinc-900 font-bold text-xs">01</span>
            </div>
            <h3 className="font-bold text-2xl mb-4 text-zinc-900">Domain Authority</h3>
            <p className="text-zinc-500 leading-relaxed text-lg">
              Next.js 15 Async Params resolved. Context established for 
              <span className="text-zinc-900 font-mono font-bold ml-1">{domain}</span>.
            </p>
          </div>
          
          <div className="p-10 md:p-14 rounded-[3.5rem] bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-zinc-900 font-bold text-xs">02</span>
            </div>
            <h3 className="font-bold text-2xl mb-4 text-zinc-900">Factory Handshake</h3>
            <p className="text-zinc-500 leading-relaxed text-lg">
              i18n state: <span className="font-bold text-zinc-900 uppercase underline decoration-zinc-200 underline-offset-4">{locale}</span>. 
              Awaiting Supabase polymorphic block hydration.
            </p>
          </div>
        </div>

        <footer className="pt-32 opacity-20 hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-black tracking-[0.8em] uppercase text-zinc-900">
            Engineered by SaaSofSaaSs
          </p>
        </footer>
      </div>
    </main>
  );
};