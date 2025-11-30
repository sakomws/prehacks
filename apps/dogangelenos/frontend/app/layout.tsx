import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ContentProvider } from "./context/ContentContext";
import { ThemeProvider } from "./context/ThemeContext";

export const metadata: Metadata = {
  title: "Dog Training Los Angeles | Professional Dog Trainers in LA | Dog Angelenos",
  description: "Premier dog training in Los Angeles. Expert certified trainers offering puppy training, obedience classes, and behavioral training. Serving West Hollywood, Santa Monica, Downtown LA. Book online today!",
  keywords: "dog training los angeles, LA dog trainers, puppy training LA, dog obedience classes, professional dog training, West Hollywood dog training, Santa Monica dog training, certified dog trainers LA",
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any' },
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/logo.png',
  },
  openGraph: {
    title: "Dog Training Los Angeles | Dog Angelenos",
    description: "LA's top-rated dog training service. Expert trainers, proven results, convenient locations.",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <ContentProvider>{children}</ContentProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
