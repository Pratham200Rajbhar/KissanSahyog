"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { LogOut, X, Shield, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function SettingsModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isOpen = searchParams?.get("settings") === "true";
  const { data: session } = useSession();

  const [notifications, setNotifications] = useState(true);

  if (!isOpen) return null;

  const close = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("settings");
    const newSearch = params.toString();
    router.replace(`${pathname}${newSearch ? `?${newSearch}` : ""}`);
  };

  const userName = session?.user?.name || "Farmer";
  const userEmail = session?.user?.email || "farmer@kissansahyog.com";
  const userImage = session?.user?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAhkX2dBHRRRgS3sO2D2j7AqZRW5uiW24OUcDS5kYZMqAhzzpebWOVzzCVNyIRAz5Rmz9tRQoYC_nOMwhkfaTjmj5D1RyRQXIHHeRMeaxCuCipVmnaJcS0T9tES4odHW1VERPb9tiOncncbFjGsNt-x5rg45WkrLyjH7v97dCyjDTQ_0L6rRGzCmNwlIFK2T50BOGQfve0wXzmyqdPkqKAERb6Tol5EWshdPPfwefjxl1w6sPPAogCTvKBJj1LtCISR1yDCM_oaT3AD";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="absolute inset-0 bg-[#0b1326]/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-sm bg-surface-container-low rounded-[2rem] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 relative bg-gradient-to-br from-primary/10 to-transparent">
            <div>
              <h2 className="font-headline text-xl font-bold text-white">Profile</h2>
            </div>
            <button 
              onClick={close}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 flex flex-col items-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full border-2 border-surface p-1 relative shadow-lg mb-4">
              <Image
                alt="User Profile"
                className="w-full h-full rounded-full object-cover"
                src={userImage}
                width={96}
                height={96}
                unoptimized
              />
            </div>

            <h3 className="font-headline text-lg font-bold text-white leading-tight">{userName}</h3>
            <p className="text-slate-400 text-xs mb-6">{userEmail}</p>

            <div className="w-full space-y-3 mb-6">
              <div className="bg-surface-container py-3 px-4 rounded-xl border border-white/5 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Account Tier</span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-wider">
                  <Shield className="w-3 h-3" />
                  Standard
                </span>
              </div>
              
              <div className="bg-surface-container py-3 px-4 rounded-xl border border-white/5 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5" />
                  Notifications
                </span>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-1 ${notifications ? 'bg-primary' : 'bg-surface-container-high border border-white/10'}`}
                >
                  <span className={`w-3 h-3 rounded-full bg-white transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-bold border border-red-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
