import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 500 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const customerId = (user.privateMetadata as { stripeCustomerId?: string }).stripeCustomerId;

  if (!customerId) {
    return NextResponse.json({ error: "no_subscription" }, { status: 400 });
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin).replace(/\/$/, "");

  const body = new URLSearchParams({
    customer: customerId,
    return_url: `${appUrl}/editor`,
  });

  const res = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  const session = await res.json();

  if (!res.ok) {
    console.error("Stripe portal error:", session);
    return NextResponse.json({ error: "portal_failed" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
