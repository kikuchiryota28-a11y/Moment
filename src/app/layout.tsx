import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MOMENT — Discover something worth doing",
  description: "Discover real-world experiences and turn them into your next Moment.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
