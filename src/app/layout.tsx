import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ClanSidebar } from "@/components/layout/clan-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/context/user-context";
import { FirebaseClientProvider } from "@/firebase";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import type { Viewport } from "next";

export const metadata: Metadata = {
  title: 'Muneem Sahab | Nested Expense Management',
  description: 'Intelligent family expense allocation for groups and clans.',
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Muneem Sahab",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#D35400",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#D35400" />
      </head>
      <body className="font-body">
        <FirebaseClientProvider>
          <UserProvider>
            <SidebarProvider>
              <div className="flex min-h-svh w-full bg-background">
                <div className="hidden md:block">
                  <ClanSidebar />
                </div>
                <div className="flex flex-col flex-1 w-full min-w-0">
                  {/* Mobile Header */}
                  <header className="sticky top-0 z-40 flex h-[calc(4rem+env(safe-area-inset-top))] items-end gap-3 border-b bg-white/95 px-4 pb-3 pt-[env(safe-area-inset-top)] md:hidden shadow-sm backdrop-blur">
                    <div className="flex items-center gap-2">
                      <img src="/logo.png" alt="Muneem Sahab" className="h-9 w-9 rounded-lg object-cover shadow-sm" />
                      <div className="leading-tight">
                        <span className="block font-headline font-bold text-secondary text-lg">Muneem Sahab</span>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Family Trip</span>
                      </div>
                    </div>
                  </header>
                  <main className="flex-1 overflow-y-auto px-3 pb-28 pt-4 sm:px-4 md:p-8">
                    <div className="mx-auto max-w-5xl space-y-5 md:space-y-8">
                      {children}
                    </div>
                  </main>
                  <MobileBottomNav />
                </div>
              </div>
            </SidebarProvider>
            <Toaster />
            <FirebaseErrorListener />
          </UserProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
