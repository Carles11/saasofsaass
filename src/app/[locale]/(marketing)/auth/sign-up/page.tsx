import type { Metadata } from "next";
import { WaitlistForm } from "../_components/WaitlistForm";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm flex flex-col gap-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Coming Late 2026</h1>
          <p className="text-sm text-muted-foreground">
            SaaSofSaaSs is still in development. Leave your email and we'll notify you the moment we launch.
          </p>
        </div>
        <WaitlistForm />
      </div>
    </div>
  );
}
