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
    description,
    duration: 4000,
    position: "top-right",
    // ariaLive is not a valid property for sonner toasts
  });
}
