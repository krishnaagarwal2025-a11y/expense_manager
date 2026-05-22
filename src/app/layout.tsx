
import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider } from "@/components/ui/sidebar";
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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#181B26" />
      </head>
      <body className="font-body">
        <FirebaseClientProvider>
          <UserProvider>
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                <ClanSidebar />
                <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
                  <div className="mx-auto max-w-5xl space-y-8">
                    {children}
                  </div>
                </main>
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
