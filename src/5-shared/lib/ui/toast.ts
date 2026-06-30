import { toast as sonnerToast } from "sonner";

export function toast({
  title,
  description,
  status = "info",
}: {
  title: string;
  description?: string;
  status?: "info" | "success" | "error";
}) {
  sonnerToast[status](title, {
    // Deterministic id collapses duplicate toasts fired in quick succession
    // (e.g. a handler re-invoked under React Strict Mode in dev) into one.
    id: `${status}:${title}`,
    description,
    duration: 4000,
    position: "top-right",
  });
}
