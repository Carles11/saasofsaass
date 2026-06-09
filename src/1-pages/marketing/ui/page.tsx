import type { FC } from "react";

export const MarketingPage: FC = () => {
  return (
    <main className="min-h-screen bg-zinc-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-16">
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter mb-6 leading-tight">
            Create Professional Websites
            <br />
            <span className="text-zinc-300">For Anyone.</span>
          </h1>
          <p className="text-zinc-500 font-medium text-xl max-w-3xl leading-relaxed">
            You manage the structure, your clients edit the content.
            Launch unlimited multi-tenant sites — no coding required.
          </p>
        </header>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col gap-3">
            <h2 className="text-2xl font-black text-zinc-900 tracking-tighter">Multi-Tenant</h2>
            <p className="text-zinc-500 leading-relaxed">
              Spin up a new site for every client. Each tenant is fully isolated with its own branding, content, and languages.
            </p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col gap-3">
            <h2 className="text-2xl font-black text-zinc-900 tracking-tighter">Role-Based</h2>
            <p className="text-zinc-500 leading-relaxed">
              You control the structure. Invite editors to manage content without touching layout or settings.
            </p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col gap-3">
            <h2 className="text-2xl font-black text-zinc-900 tracking-tighter">AI Translations</h2>
            <p className="text-zinc-500 leading-relaxed">
              One click translates your entire site. Enable any language and let Gemini handle the rest.
            </p>
          </div>
        </section>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-zinc-900 text-white p-8 rounded-[2rem] flex flex-col gap-3">
            <h2 className="text-2xl font-black tracking-tighter">Social Work</h2>
            <p className="text-zinc-400 leading-relaxed">
              NGOs, associations, and social impact organizations. Hero, blog, awards, podcast, contact — tell your story.
            </p>
          </div>
          <div className="bg-zinc-900 text-white p-8 rounded-[2rem] flex flex-col gap-3">
            <h2 className="text-2xl font-black tracking-tighter">Wedding</h2>
            <p className="text-zinc-400 leading-relaxed">
              Wedding planners, photographers, venues. Showcase portfolios, share testimonials, and book clients.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};
