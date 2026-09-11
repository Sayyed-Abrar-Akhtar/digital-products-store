import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://acme-app.store.com"),
  title: {
    template: "%s | Acme Developer Guide",
    default: "Acme SaaS Platform — Next.js 16 Reference App",
  },
  description: "Fictional reference application for Practical Next.js 16 Developer Guide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-50 antialiased min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md"
        >
          Skip to main content
        </a>

        <header className="border-b border-slate-800 px-6 py-4 bg-slate-900/50 backdrop-blur">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 font-bold text-white flex items-center justify-center">
                A
              </div>
              <span className="font-bold text-lg text-white">Acme Platform</span>
            </div>
            <span className="text-xs font-mono px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300">
              Target Next.js 16.3.4
            </span>
          </div>
        </header>

        <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
