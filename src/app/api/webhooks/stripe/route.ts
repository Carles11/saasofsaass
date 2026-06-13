import { NextRequest, NextResponse } from "next/server";
import { stripeWebhook } from "@/3-features/manage-billing/actions/billingActions";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 },
      );
    }

    const result = await stripeWebhook(rawBody, signature);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[stripe-webhook] error:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }
}
