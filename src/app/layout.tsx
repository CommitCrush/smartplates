import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import { ToastProvider } from "@/components/ui/use-toast";

// Import debug tools in development
if (process.env.NODE_ENV === 'development') {
  import('@/utils/spoonacularDebug');
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SmartPlates - Smart Meal Planning & Recipe Management",
  description: "Discover recipes, plan meals, and manage your kitchen with AI-powered suggestions. SmartPlates makes cooking easier and more organized.",
  keywords: "recipes, meal planning, cooking, AI, ingredients, smart kitchen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={`dark ${inter.variable}`} 
      data-scroll-behavior="smooth"
      suppressHydrationWarning={true}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body 
        className="font-sans antialiased" 
        suppressHydrationWarning={true}
        // Add data attributes that browser extensions might add
        data-hydration-safe="true"
      >
        <div id="__next-root" suppressHydrationWarning={true}>
          <ToastProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}
