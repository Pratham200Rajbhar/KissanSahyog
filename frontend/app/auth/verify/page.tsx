"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../utils/supabase/client";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const [token, setToken] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const savedPhone = localStorage.getItem("auth_phone");
    if (savedPhone) {
      // Defer state update to avoid cascading render lint error
      if (phone !== savedPhone) {
        queueMicrotask(() => {
          setPhone(savedPhone);
        });
      }
    } else {
      router.push("/auth/login");
    }
  }, [router, phone]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    });
    
    if (error) {
      alert("Error verifying OTP: " + error.message);
      setLoading(false);
    } else {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('farmer_profiles')
        .select('*')
        .eq('id', data.user?.id)
        .single();
        
      if (profile) {
        router.push("/dashboard");
      } else {
        router.push("/auth/onboarding");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleVerify} className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">Verify OTP</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">Sent to {phone}</p>
        <div className="mb-4">
          <label htmlFor="token" className="block text-sm font-medium text-gray-700">6-Digit OTP</label>
          <input
            type="text"
            id="token"
            maxLength={6}
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm border focus:border-green-500 focus:ring-green-500 sm:text-sm"
            placeholder="123456"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify & Login"}
        </button>
      </form>
    </div>
  );
}
