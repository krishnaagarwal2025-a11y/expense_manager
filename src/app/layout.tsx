import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ClanSidebar } from "@/components/layout/clan-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/context/user-context";
import { FirebaseClientProvider } from "@/firebase";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";

export const metadata: Metadata = {
  title: 'ClanSplit | Nested Expense Management',
  description: 'Intelligent family expense allocation for groups and clans.',
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
              <div className="flex min-h-screen w-full bg-background">
                <ClanSidebar />
                <div className="flex flex-col flex-1 w-full">
                  {/* Mobile Header */}
                  <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 md:hidden shadow-sm">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">
                        C
                      </div>
                      <span className="font-headline font-bold text-secondary text-lg">ClanSplit</span>
                    </div>
                  </header>
                  <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="mx-auto max-w-5xl space-y-8">
                      {children}
                    </div>
                  </main>
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
