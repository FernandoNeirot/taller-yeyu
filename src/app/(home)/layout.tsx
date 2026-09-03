import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <BottomNav />
      <Footer />
    </>
  );
}
