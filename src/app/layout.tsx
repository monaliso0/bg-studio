import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://oneback.xyz"),
  title: "OneBack — Fotos de produto profissionais em segundos",
  description:
    "Remova o fundo das suas fotos de produto e padronize todo o catálogo automaticamente. Sem Photoshop, sem agência.",
  openGraph: {
    title: "OneBack — Fotos de produto profissionais em segundos",
    description:
      "Remova o fundo das suas fotos de produto e padronize todo o catálogo automaticamente. Sem Photoshop, sem agência.",
    url: "https://oneback.xyz",
    siteName: "OneBack",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OneBack — Fotos de produto profissionais em segundos",
    description:
      "Remova o fundo das suas fotos de produto e padronize todo o catálogo automaticamente.",
  },
};

const clerkAppearance = {
  variables: {
    colorPrimary: "#111111",
    colorText: "#111111",
    colorTextSecondary: "#999999",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#111111",
    colorNeutral: "#111111",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "0px",
  },
  elements: {
    card: {
      boxShadow: "none",
      border: "1px solid #e5e5e5",
    },
    formButtonPrimary: {
      fontSize: "14px",
      fontWeight: "500",
      letterSpacing: "0",
      textTransform: "none" as const,
      height: "48px",
    },
    socialButtonsBlockButton: {
      borderColor: "#e5e5e5",
      fontSize: "14px",
      height: "48px",
    },
    formFieldInput: {
      borderColor: "#e5e5e5",
      height: "48px",
    },
    footerActionLink: {
      color: "#111111",
      fontWeight: "500",
    },
    identityPreviewEditButton: {
      color: "#111111",
    },
    userPreviewAvatarBox: {
      borderRadius: "100%",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="pt-BR" className={inter.variable}>
        <body className="font-sans antialiased">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-black focus:text-white focus:px-4 focus:py-2 focus:text-sm"
          >
            Pular para o conteúdo
          </a>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
