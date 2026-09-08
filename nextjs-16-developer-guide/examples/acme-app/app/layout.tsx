import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acme SaaS Dashboard",
  description: "Fictional reference application for Practical Next.js 16 Developer Guide"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
          <h2>Acme SaaS Platform</h2>
        </header>
        <main style={{ padding: "1rem" }}>{children}</main>
      </body>
    </html>
  );
}
