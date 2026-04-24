import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulseMap SG | 🇸🇬 Neighbourhood Intelligence Engine",
  description: "Next-generation discovery dashboard mapping urban vibes to real-time GrabMaps intelligence. Built for the GrabMaps API Hackathon 2026.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://unpkg.com/maplibre-gl@4.1.2/dist/maplibre-gl.css" rel="stylesheet" />
      </head>
      <body className="bg-[#050505] antialiased">
        {children}
      </body>
    </html>
  );
}
