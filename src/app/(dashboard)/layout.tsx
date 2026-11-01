import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minha aplicação",
  description: "Minha aplicação Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}