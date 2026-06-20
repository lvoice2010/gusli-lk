import { Sidebar } from "@/components/Sidebar";
import { MobileNavProvider } from "@/components/MobileNavContext";

export default function LkLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileNavProvider>
      <div className="min-h-screen">
        <Sidebar />
        <div className="lg:pl-64">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </div>
      </div>
    </MobileNavProvider>
  );
}
