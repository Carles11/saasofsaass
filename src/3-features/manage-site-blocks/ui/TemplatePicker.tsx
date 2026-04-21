"use client";
import { TEMPLATES, TenantTemplateId } from "@/5-shared/config/templates";
import { useStore } from "@/5-shared/store";
import { Badge } from "@/components/ui/badge";
import { useState, useTransition } from "react";
import { updateTenantTemplate } from "../actions/tenantActions";

const TEMPLATE_LABELS: Record<TenantTemplateId, string> = {
  default: "Default",
  modern: "Modern",
  classic: "Classic",
};

export function TemplatePicker({
  previewTemplateId,
  setPreviewTemplateId,
}: {
  previewTemplateId: TenantTemplateId;
  setPreviewTemplateId: (id: TenantTemplateId) => void;
}) {
  const tenant = useStore((state) => state.activeTenant);
  const setTenant = useStore((state) => state.setTenant);
  const [isPending, startTransition] = useTransition();
  if (!tenant) return null;

  const current = tenant.templateId as TenantTemplateId;

  // UX: Show an 'Apply Template' button if previewing a non-active template
  const [applyLoading, setApplyLoading] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-6 flex-wrap">
        {Object.keys(TEMPLATES).map((id) => {
          const templateId = id as TenantTemplateId;
          const isActive = current === templateId;
          const isPreview = previewTemplateId === templateId;
          return (
            <div
              key={templateId}
              className={`relative group rounded-2xl border-2 transition-all duration-200 p-6 min-w-[220px] max-w-xs flex-1 cursor-pointer ${
                isPreview
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-zinc-200 hover:border-primary/60 bg-white"
              }`}
              onClick={() => {
                setPreviewTemplateId(templateId);
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold tracking-tight">
                  {TEMPLATE_LABELS[templateId]}
                </span>
                {isActive && (
                  <Badge className="ml-2" variant="default">
                    Active
                  </Badge>
                )}
                {isPreview && !isActive && (
                  <Badge className="ml-2" variant="outline">
                    Previewing
                  </Badge>
                )}
              </div>
              <div
                className={`rounded-xl h-28 w-full mb-2 overflow-hidden flex items-stretch justify-stretch ${TEMPLATES[templateId].themeClass}`}
                style={{ border: "1px dashed #e5e7eb", background: "var(--background)" }}
              >
                {/* Visually distinct hero preview for each template */}
                {templateId === "default" && (
                  <div className="flex flex-col items-center justify-center w-full h-full p-2">
                    <div className="w-full h-2 rounded bg-primary/30 mb-2" />
                    <div className="font-sans text-base font-bold text-zinc-800">Hero Title</div>
                    <div className="font-sans text-xs text-zinc-500">Subtitle goes here</div>
                    <button className="mt-2 px-2 py-1 rounded bg-primary text-white text-xs">
                      CTA
                    </button>
                  </div>
                )}
                {templateId === "modern" && (
                  <div className="flex flex-row items-center justify-between w-full h-full p-2 gap-2">
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="font-mono text-sm font-bold text-primary">Hero Title</div>
                      <div className="font-mono text-[11px] text-zinc-500">Subtitle goes here</div>
                      <button className="mt-1 px-2 py-1 rounded bg-primary/80 text-white text-xs tracking-tighter">
                        CTA
                      </button>
                    </div>
                    <div className="flex-1 h-full flex items-center justify-center">
                      <div className="w-12 h-12 rounded-lg bg-linear-to-tr from-primary/40 to-zinc-200 flex items-center justify-center">
                        <span className="text-[10px] text-zinc-400">IMG</span>
                      </div>
                    </div>
                  </div>
                )}
                {templateId === "classic" && (
                  <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-zinc-100 to-zinc-50">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80')] bg-cover bg-center opacity-30 rounded-xl" />
                    <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-2">
                      <div className="font-serif text-base font-bold text-zinc-700 drop-shadow">
                        Hero Title
                      </div>
                      <div className="font-serif text-xs text-zinc-500 drop-shadow">
                        Subtitle goes here
                      </div>
                      <button className="mt-2 px-2 py-1 rounded bg-primary/80 text-white text-xs border border-zinc-300">
                        CTA
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-xs text-zinc-500">
                {TEMPLATES[templateId].containerClass.replace(/mx-auto|px-\d+/g, "").trim()}
              </div>
            </div>
          );
        })}
      </div>
      {/* Apply button UX */}
      {previewTemplateId !== current && (
        <button
          className="self-start px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 transition disabled:opacity-60 disabled:pointer-events-none"
          disabled={isPending || applyLoading}
          onClick={async () => {
            setApplyLoading(true);
            await updateTenantTemplate(tenant.id, previewTemplateId);
            setTenant({ ...tenant, templateId: previewTemplateId });
            setApplyLoading(false);
          }}
        >
          {applyLoading ? "Applying..." : `Apply this template`}
        </button>
      )}
      {previewTemplateId === current && (
        <div className="text-xs text-zinc-500 mt-1">This template is currently active.</div>
      )}
    </div>
  );
}
