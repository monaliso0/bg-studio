import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { DISPOSABLE_DOMAINS } from "@/lib/disposableDomains";

const MONTHLY_LIMIT = 10;
const DOWNLOAD_COOLDOWN_MS = 3000; // 3s entre downloads — previne race condition

type DownloadMeta = {
  downloadCount?: number;
  downloadMonth?: string;
  lastDownloadAt?: number;
  subscriptionStatus?: string;
};

function currentMonth() {
  return new Date().toISOString().slice(0, 7); // "2026-03"
}

// GET — return current count (used to display remaining in the UI)
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ count: 0, limit: MONTHLY_LIMIT, remaining: MONTHLY_LIMIT });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = (user.privateMetadata ?? {}) as DownloadMeta;

  // If it's a subscriber, unlimited
  if (meta.subscriptionStatus === "active") {
    return NextResponse.json({ count: 0, limit: null, remaining: null, subscribed: true });
  }

  const month = currentMonth();
  const count = meta.downloadMonth === month ? (meta.downloadCount ?? 0) : 0;

  return NextResponse.json({
    count,
    limit: MONTHLY_LIMIT,
    remaining: MONTHLY_LIMIT - count,
    subscribed: false,
  });
}

// POST — check limit and increment if allowed
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = (user.privateMetadata ?? {}) as DownloadMeta;

  // ── Bloqueio de email descartável ─────────────────────────────
  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const domain = email.split("@")[1]?.toLowerCase();
  if (domain && DISPOSABLE_DOMAINS.has(domain)) {
    return NextResponse.json({ error: "disposable_email" }, { status: 403 });
  }

  // ── Subscribers bypass tudo ────────────────────────────────────
  if (meta.subscriptionStatus === "active") {
    return NextResponse.json({ ok: true, subscribed: true });
  }

  // ── Cooldown anti-race condition ───────────────────────────────
  const now = Date.now();
  if (now - (meta.lastDownloadAt ?? 0) < DOWNLOAD_COOLDOWN_MS) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  // ── Verificação do limite mensal ───────────────────────────────
  const month = currentMonth();
  const count = meta.downloadMonth === month ? (meta.downloadCount ?? 0) : 0;

  if (count >= MONTHLY_LIMIT) {
    return NextResponse.json(
      { error: "limit_reached", count, limit: MONTHLY_LIMIT },
      { status: 403 }
    );
  }

  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: {
      downloadCount: count + 1,
      downloadMonth: month,
      lastDownloadAt: now,
    },
  });

  return NextResponse.json({
    ok: true,
    count: count + 1,
    limit: MONTHLY_LIMIT,
    remaining: MONTHLY_LIMIT - count - 1,
  });
}
