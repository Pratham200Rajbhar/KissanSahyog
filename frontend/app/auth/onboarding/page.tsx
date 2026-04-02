"use client";

import { useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    district: "",
    crop: "",
    farm_size: ""
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { error } = await supabase
      .from('farmer_profiles')
      .insert([
        {
          id: user.id,
          phone: user.phone,
          name: formData.name,
          state: formData.state,
          district: formData.district,
          crop: formData.crop,
          farm_size: parseFloat(formData.farm_size) || null
        }
      ]);

    if (error) {
      alert("Error saving profile: " + error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">Complete Your Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" required onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input type="text" required onChange={e => setFormData({...formData, state: e.target.value})} className="mt-1 block w-full border rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">District</label>
            <input type="text" required onChange={e => setFormData({...formData, district: e.target.value})} className="mt-1 block w-full border rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Primary Crop</label>
            <input type="text" required onChange={e => setFormData({...formData, crop: e.target.value})} className="mt-1 block w-full border rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Farm Size (Acres)</label>
            <input type="number" step="0.1" required onChange={e => setFormData({...formData, farm_size: e.target.value})} className="mt-1 block w-full border rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Profile & Continue"}
        </button>
      </form>
    </div>
  );
}
