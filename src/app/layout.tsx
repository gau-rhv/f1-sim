import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RACELINE IQ — F1 Track Intelligence",
  description: "Precision-engineered racing line analysis. 3D track visualization with gradient descent optimized racing lines for Monaco, Silverstone, Spa, and Bahrain circuits.",
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
          href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@300;400;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
