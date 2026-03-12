import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: "OPTTRAX IQ — F1 Track Intelligence",
  description: "Precision-engineered racing line analysis. 3D track visualization with gradient descent optimized racing lines for Monza, Silverstone, Spa, and Bahrain circuits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Notable&family=Rajdhani:wght@500;700&family=Sora:wght@300;400;600;700&family=Titillium+Web:wght@300;400;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
