import type { Metadata, Viewport } from "next";
import "@fontsource/unbounded/400.css";
import "@fontsource/unbounded/700.css";
import "@fontsource/unbounded/900.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "./globals.css";
import "./features.css";
import { Nav, Toast } from "@/components/ui/Chrome";
import { AppProvider } from "@/components/providers/AppProvider";

export const metadata: Metadata = {
  title: "Keep It Sorted — Premium UI Kits, Website & App Templates",
  description:
    "An immersive 3D & VR storytelling marketplace for premium UI kits, coded website templates, app templates, icons, fonts and 3D assets.",
};

export const viewport: Viewport = {
  themeColor: "#07060B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Nav />
          {children}
          <Toast />
        </AppProvider>
      </body>
    </html>
  );
}
