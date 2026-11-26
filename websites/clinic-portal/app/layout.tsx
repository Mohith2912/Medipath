import type { Metadata, Viewport } from "next";
import "../styles.css";

const description = "Coordinate appointments, patient check-ins, doctor schedules, and clinic payments in one calm, role-based workspace. Explore MediPath's interactive demo.";

export const metadata: Metadata = {
  title: "MediPath",
  description,
  openGraph: {
    title: "MediPath",
    description,
    type: "website",
    siteName: "MediPath",
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
