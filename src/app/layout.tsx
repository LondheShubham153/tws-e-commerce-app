import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddedCart from "@/components/AddedCart";
import StoreProvider from "@/app/StoreProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import MobileBottomMenu from "@/components/MobileBottomMenu";
import { Toaster } from "@/components/ui/toaster";
import ScrollToTopBtn from "@/components/ScrollToTopBtn";
import { AuthProvider } from "@/components/providers/AuthProvider";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "EasyShop - Your One-Stop Shopping Destination",
  description: "Shop the latest trends in fashion, electronics, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <StoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <header>
                  <Navbar />
                </header>
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
                <AddedCart />
                <MobileBottomMenu />
                <ScrollToTopBtn />
                <Toaster />
              </div>
            </AuthProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
