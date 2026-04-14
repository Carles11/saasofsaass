import type { FC } from "react";

export const MarketingPage: FC = () => {
  return (
    <main className="min-h-screen bg-zinc-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black text-zinc-900 tracking-tighter mb-4">Welcome to SoSS Engine</h1>
          <p className="text-zinc-500 font-medium text-xl max-w-2xl">The Bentley-standard SaaS platform for managing tenants, marketing, and growth—all in one place.</p>
        </header>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col gap-2">
            <h2 className="text-2xl font-black text-zinc-900 tracking-tighter mb-2">Multi-Tenant Ready</h2>
            <p className="text-zinc-500">Easily manage multiple tenants with robust isolation and security.</p>
          </div>
          <div className="bg-white p-10 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col gap-2">
            <h2 className="text-2xl font-black text-zinc-900 tracking-tighter mb-2">Marketing Automation</h2>
            <p className="text-zinc-500">Automate your outreach and track performance with built-in analytics.</p>
          </div>
        </section>
        <section className="mt-12 bg-white p-16 rounded-[3rem] border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center text-center">
          <h3 className="text-xl font-bold text-zinc-900 mb-2">Get Started</h3>
          <p className="text-zinc-400 max-w-sm mx-auto italic font-medium">
            Deploy your first tenant and unlock the power of SoSS Engine.
          </p>
        </section>
      </div>
    </main>
  );
};
