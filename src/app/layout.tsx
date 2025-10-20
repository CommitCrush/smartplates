import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import { ThemeProvider } from "@/context/themeContext";
import { ToastProvider } from "@/components/ui/use-toast";
import { themeScript } from "@/lib/theme-script";
import { Toaster } from 'react-hot-toast';

// Import debug tools in development
if (process.env.NODE_ENV === 'development') {
  import('@/utils/spoonacularDebug');
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SmartPlates",
  icons: {
    icon: [
      {
        url: '/Icon.png',
        sizes: '128x128',  // Maximale empfohlene Größe
        type: 'image/png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Cloudinary Upload Widget Script */}
        <script
          src="https://upload-widget.cloudinary.com/latest/global/all.js"
          type="text/javascript"
        ></script>
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <div id="__next-root">
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                {children}
                <Toaster position="top-center" reverseOrder={false} />
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
