import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Smart Life - Organize Your Day, Manage Your Life",
  description: "A modern personal life management app for daily household, academic, and personal organization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#faf8f5" />
      </head>
      <body className="antialiased">
        <ErrorReporter />
        <Toaster position="top-center" richColors />
        {children}
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
