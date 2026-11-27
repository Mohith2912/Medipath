import type { Metadata, Viewport } from "next";
import "../styles.css";

const description = "Hospital and clinic administration workspace for managing permissions, schedules, billing, and health system operations.";

export const metadata: Metadata = {
  title: "MediPath Admin Portal",
  description,
  openGraph: {
    title: "MediPath Admin Portal",
    description,
    type: "website",
    siteName: "MediPath Admin",
  },
  icons: {
    icon: "/medipath-logo.png",
    apple: "/medipath-logo.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EDF5FF" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1624" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
