"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useClerk, SignInButton } from "@clerk/nextjs";

function avatarColor(name: string) {
  const colors = [
    "#0969da", "#1a7f37", "#9a6700", "#cf222e",
    "#8250df", "#0550ae", "#bf8700", "#116329",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function AvatarPlaceholder({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const bg = avatarColor(name);

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0 select-none"
      style={{ backgroundColor: bg }}
    >
      {initials}
    </div>
  );
}

export default function NavAccount() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded) return <div className="w-8 h-8 rounded-full bg-[#e5e5e5]" />;

  if (!isSignedIn) {
    return (
      <Link href="/editor" className="text-sm text-black hover:opacity-60 transition-opacity">
        Entrar
      </Link>
    );
  }

  const name = user.fullName ?? user.emailAddresses[0]?.emailAddress ?? "U";
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => openUserProfile()}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        title={name}
      >
        <img
          src={user.hasImage ? user.imageUrl : "/avatar-placeholder.png"}
          alt={name}
          className="w-8 h-8 rounded-full object-cover border border-black/10"
        />
      </button>
      <button
        onClick={() => signOut().then(() => { router.push("/"); router.refresh(); })}
        className="text-xs text-black/40 hover:text-black/70 transition-colors"
      >
        Sair
      </button>
    </div>
  );
}
