"use client";

import { ForgotPasswordForm } from "@/3-features/auth/forgot-password-form";
import { ResetPasswordForm } from "@/3-features/auth/reset-password-form";
import { SignInForm } from "@/3-features/auth/sign-in-form";
import { SignUpForm } from "@/3-features/auth/sign-up-form";

export function AuthViewClient({ pathname }: { pathname: string }) {
  if (pathname === "sign-in") {
    return <SignInForm />;
  }

  if (pathname === "reset-password") {
    return <ResetPasswordForm />;
  }

  if (pathname === "sign-up") {
    return <SignUpForm />;
  }

  if (pathname === "forgot-password") {
    return <ForgotPasswordForm />;
  }

  return null;
}
