import type { FC } from "react";

export const DashboardPage: FC = () => {
  return (
    <main className="min-h-screen bg-zinc-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Workshop</h1>
            <p className="text-zinc-500 font-medium">Monitoring your Bentley tenant fleet.</p>
          </div>
          <div className="flex items-center space-x-4 bg-white p-2 pr-6 rounded-full border border-zinc-200 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
            <span className="text-xs font-bold text-zinc-900 uppercase tracking-tight">Admin Central</span>
          </div>
        </header>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Active Tenants", "Platform Revenue", "System Health"].map((label) => (
            <div key={label} className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">{label}</p>
              <p className="text-4xl font-black text-zinc-900">--</p>
            </div>
          ))}
        </section>
        <section className="mt-8 bg-white p-20 rounded-[3rem] border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center text-center">
          <h3 className="text-xl font-bold text-zinc-900 mb-2">No Tenants Found</h3>
          <p className="text-zinc-400 max-w-sm mx-auto italic font-medium">
            Your workshop is initialized. Awaiting the first deployment.
          </p>
        </section>
      </div>
    </main>
  );
};
