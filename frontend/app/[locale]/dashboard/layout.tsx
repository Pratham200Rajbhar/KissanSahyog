import DashboardSidebar from "../../components/DashboardSidebar";
import DashboardTopNav from "../../components/DashboardTopNav";
import { LocationProvider } from "../../components/LocationContext";
import SettingsModal from "../../components/SettingsModal";
import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { ChatBot } from "../../components/ChatBot";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  return (
    <LocationProvider>
      <div className="relative min-h-screen bg-background text-on-surface muted-grid-bg">
        <DashboardSidebar />
        <main className="min-h-screen lg:ml-[20.5rem]">
          <div className="dashboard-content dashboard-shell">
            <DashboardTopNav />
            <div className="pt-4 sm:pt-5">{children}</div>
          </div>
        </main>
        <Suspense fallback={null}>
          <SettingsModal />
        </Suspense>
        <ChatBot />
      </div>
    </LocationProvider>
  );
}
