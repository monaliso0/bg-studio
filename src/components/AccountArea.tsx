"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface DownloadInfo {
  count: number;
  limit: number | null;
  remaining: number | null;
  subscribed: boolean;
}

interface Props {
  refreshSignal?: number;
}

export default function AccountArea({ refreshSignal }: Props) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const router = useRouter();
  const [info, setInfo] = useState<DownloadInfo | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) router.push(data.url);
    } finally {
      setPortalLoading(false);
    }
  }

  useEffect(() => {
    if (!isSignedIn) { setInfo(null); return; }
    fetch("/api/check-download")
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => null);
  }, [isSignedIn, refreshSignal]);

  if (!isLoaded) {
    return <div className="bg-black h-[80px] shrink-0" />;
  }

  // Logged out — black button
  if (!isSignedIn) {
    return (
      <div className="h-[80px] shrink-0">
        <SignInButton mode="modal">
          <button className="w-full h-full bg-black text-white text-sm hover:bg-gray-900 transition-colors">
            Login / Cadastro
          </button>
        </SignInButton>
      </div>
    );
  }

  // Logged in — black panel
  const name = user.fullName ?? user.emailAddresses[0]?.emailAddress ?? "User";
  const infoLoading = info === null;
  const downloadsLabel = info?.subscribed
    ? null
    : info
    ? `${info.remaining} downloads restantes`
    : null;

  return (
    <div className="bg-black shrink-0 group">
      <button
        onClick={() => openUserProfile()}
        className="h-[80px] flex items-center gap-3 px-6 w-full text-left hover:bg-gray-900 transition-colors"
      >
        <img
          src={user.hasImage ? user.imageUrl : "/avatar-placeholder.png"}
          alt={name}
          className="w-10 h-10 rounded-full shrink-0 object-cover border border-white/20"
        />
        <div className="min-w-0 flex flex-col gap-0.5">
          <p className="text-sm text-white leading-tight truncate">{name}</p>
          {infoLoading ? (
            <div className="h-3 w-16 bg-white/10 animate-pulse rounded-sm mt-0.5" />
          ) : info?.subscribed ? (
            <span className="inline-flex items-center gap-1 self-start bg-[#262626] px-1 py-0.5">
              <img src="/star-pro-plan.svg" alt="" aria-hidden="true" width={10} height={10} />
              <span className="text-[10px] font-medium tracking-[-0.3px] leading-none bg-gradient-to-r from-white to-[#999] bg-clip-text text-transparent">
                Pro Plan
              </span>
            </span>
          ) : (
            <p className="text-xs text-white/50 leading-tight">
              Free
              {downloadsLabel && (
                <>
                  <span className="inline-block w-[2px] h-[2px] bg-white/50 rounded-full mx-1.5 align-middle" />
                  {downloadsLabel}
                </>
              )}
            </p>
          )}
        </div>
      </button>
      {info?.subscribed && (
        <button
          onClick={handleManageSubscription}
          disabled={portalLoading}
          className="hidden group-hover:block group-focus-within:block w-full text-xs text-white/50 hover:text-white/80 transition-colors py-2 text-center border-t border-white/10 disabled:opacity-40"
        >
          {portalLoading ? "Aguarde..." : "Gerenciar assinatura"}
        </button>
      )}
      <button
        onClick={() => signOut({ redirectUrl: "/" })}
        className="hidden group-hover:block group-focus-within:block w-full text-xs text-white/50 hover:text-white/80 transition-colors py-2 text-center border-t border-white/10"
      >
        Sair
      </button>
    </div>
  );
}
