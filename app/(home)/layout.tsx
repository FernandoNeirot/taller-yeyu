import { BottomNav } from "./_components/bottom-nav";
import { Footer } from "./_components/footer";
import { Header } from "./_components/header";

export default function HomeLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="pb-24 md:pb-0 pt-20 md:pt-24">
      <Header />
      {children}
      <BottomNav />
      <Footer />
    </div>
  );
}
