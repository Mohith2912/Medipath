import type { Metadata, Viewport } from "next";
import "../styles.css";

const description = "Patient care portal to view your upcoming visits, doctor consultations, care plans, and medical receipts.";

export const metadata: Metadata = {
  title: "MediPath Patient Portal",
  description,
  openGraph: {
    title: "MediPath Patient Portal",
    description,
    type: "website",
    siteName: "MediPath Patient",
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
