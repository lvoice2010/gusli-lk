import { Sidebar } from "@/components/Sidebar";

export default function LkLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="pl-64">
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </div>
    </div>
  );
}
