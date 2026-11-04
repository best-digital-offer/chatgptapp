import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://app.samewindow.com"),
  title: {
    default: "SameWindow for ChatGPT",
    template: "%s | SameWindow",
  },
  description:
    "Save, organize, and find the ChatGPT conversations you choose to keep.",
  applicationName: "SameWindow for ChatGPT",
  openGraph: {
    type: "website",
    url: "https://app.samewindow.com",
    siteName: "SameWindow for ChatGPT",
    title: "SameWindow for ChatGPT",
    description:
      "A private, searchable home for the ChatGPT conversations you choose to save.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
