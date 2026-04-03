import DashboardSidebar from "../../components/DashboardSidebar";
import DashboardTopNav from "../../components/DashboardTopNav";
import { LocationProvider } from "../../components/LocationContext";
import SettingsModal from "../../components/SettingsModal";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LocationProvider>
      <div className="relative min-h-screen bg-background text-on-surface">
        <DashboardSidebar />
        <main className="ml-[22rem] min-h-screen pt-20 px-8 pb-12">
          <DashboardTopNav />
          {children}
        </main>
        <Suspense fallback={null}>
          <SettingsModal />
        </Suspense>
      </div>
    </LocationProvider>
  );
}
