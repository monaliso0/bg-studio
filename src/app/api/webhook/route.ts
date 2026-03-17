import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    console.error("Missing Stripe env vars");
    return NextResponse.json({ error: "misconfigured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2022-11-15" });
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret.trim());
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const clerk = await clerkClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.clerkUserId;
    if (userId) {
      await clerk.users.updateUserMetadata(userId, {
        privateMetadata: {
          subscriptionStatus: "active",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        },
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.clerkUserId;
    if (userId) {
      await clerk.users.updateUserMetadata(userId, {
        privateMetadata: { subscriptionStatus: "canceled" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
