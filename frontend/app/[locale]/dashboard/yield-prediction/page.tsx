"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Calculator, CloudSun, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useLocation } from "../../../components/LocationContext";
import { LocationDetector } from "../../../components/LocationDetector";
import { GpsIndicator } from "../../../components/GpsIndicator";
import { useTranslations } from "next-intl";
import { AIExplanationCard } from "../../../components/AIExplanationCard";

const CROPS = ['chickpea', 'cotton', 'maize', 'rice'];
const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Orissa', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const DISTRICTS_BY_STATE: Record<string, string[]> = {
  'Andhra Pradesh': ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 'Kurnool', 'Prakasam', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'Kadapa', 'Nellore'],
  'Assam': ['Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong', 'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar', 'Tinsukia', 'Udalguri', 'West Karbi Anglong'],
  'Bihar': ['Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar', 'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur', 'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur', 'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali', 'West Champaran'],
  'Chhattisgarh': ['Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur', 'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg', 'Gariaband', 'Janjgir-Champa', 'Jashpur', 'Kabirdham', 'Kanker', 'Kondagaon', 'Korba', 'Koriya', 'Mahasamund', 'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Sukma', 'Surajpur', 'Surguja'],
  'Gujarat': ['Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udepur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'],
  'Haryana': ['Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'],
  'Himachal Pradesh': ['Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'],
  'Jharkhand': ['Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Garhwa', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar', 'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahibganj', 'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'],
  'Karnataka': ['Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'],
  'Kerala': ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'],
  'Madhya Pradesh': ['Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad', 'Indore', 'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Mandla', 'Mandsaur', 'Morena', 'Narsinghpur', 'Neemuch', 'Panna', 'Raisen', 'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'],
  'Maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'],
  'Orissa': ['Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghapur', 'Jajpur', 'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha', 'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Sonepur', 'Sundargarh'],
  'Punjab': ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar', 'Sahibzada Ajit Singh Nagar', 'Sangrur', 'Shahid Bhagat Singh Nagar', 'Sri Muktsar Sahib', 'Tarn Taran'],
  'Rajasthan': ['Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Hanumangarh', 'Jaipur', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Kota', 'Nagaur', 'Pali', 'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'],
  'Tamil Nadu': ['Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'],
  'Telangana': ['Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Kumuram Bheem Asifabad', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Rangareddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal Rural', 'Warangal Urban', 'Yadadri Bhuvanagiri'],
  'Uttar Pradesh': ['Agra', 'Aligarh', 'Allahabad', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Faizabad', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kheri', 'Kushinagar', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'],
  'Uttarakhand': ['Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'],
  'West Bengal': ['Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur']
};

interface YieldResult {
  predicted_yield: number;
  unit: string;
  shap_values: Record<string, number>;
  ai_explanation?: string;
}

interface YieldFormData {
  crop: string;
  state_name: string;
  dist_name: string;
  area_ha: number | "";
  temperature_c: number | "";
  humidity_percentage: number | "";
  rainfall_mm: number | "";
  wind_speed_m_s: number | "";
  solar_radiation_mj_m2_day: number | "";
  n_req_kg_per_ha: number | "";
  p_req_kg_per_ha: number | "";
  k_req_kg_per_ha: number | "";
}

export default function YieldPrediction() {
  const { location } = useLocation();
  const t = useTranslations();
  const [formData, setFormData] = useState<YieldFormData>({
    crop: 'rice',
    state_name: 'Gujarat',
    dist_name: '',
    area_ha: "",
    temperature_c: "",
    humidity_percentage: "",
    rainfall_mm: "",
    wind_speed_m_s: "",
    solar_radiation_mj_m2_day: "",
    n_req_kg_per_ha: "",
    p_req_kg_per_ha: "",
    k_req_kg_per_ha: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<YieldResult | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Auto-fill from location
  useEffect(() => {
    if (location.lastUpdated) {
      setFormData((prev: YieldFormData) => ({
        ...prev,
        state_name: location.state || prev.state_name,
        dist_name: location.district || prev.dist_name,
        temperature_c: location.temperature ?? prev.temperature_c,
        humidity_percentage: location.humidity ?? prev.humidity_percentage,
        rainfall_mm: location.rainfall ?? prev.rainfall_mm,
        wind_speed_m_s: location.wind_speed ?? prev.wind_speed_m_s,
        solar_radiation_mj_m2_day: location.solar_radiation ?? prev.solar_radiation_mj_m2_day,
      }));
    }
  }, [location.lastUpdated, location.state, location.district, location.temperature, location.humidity, location.rainfall, location.wind_speed, location.solar_radiation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev: YieldFormData) => {
      const newData = {
        ...prev,
        [name]: type === 'number' ? (value === "" ? "" : parseFloat(value)) : value
      };

      // Auto-update district if state changes
      if (name === 'state_name' && DISTRICTS_BY_STATE[value]) {
        newData.dist_name = DISTRICTS_BY_STATE[value][0];
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setAiExplanation("");

    try {
      const apiUrl = "/api";
      
      const submissionData = Object.entries(formData).reduce((acc, [key, value]) => {
        acc[key] = value === "" ? 0 : value;
        return acc;
      }, {} as Record<string, string | number>);

      const response = await fetch(`${apiUrl}/predict/yield`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prediction");
      }

      const data: YieldResult = await response.json();
      setResult(data);
      if (data.ai_explanation) setAiExplanation(data.ai_explanation);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during prediction";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 sm:mt-4 animate-fade-in pb-10">
      <div className="mb-8 sm:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
            {t("dashboard.intelligence")}
          </span>
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{t("yield.simulation_title")}</h2>
        </div>
        <LocationDetector />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-7">
        <div className="xl:col-span-8 glass-panel p-5 sm:p-7 rounded-2xl border border-outline-variant/10 shadow-2xl">
          <h3 className="font-headline text-xl font-bold mb-8 flex items-center gap-3 text-white">
            <Calculator className="w-6 h-6 text-primary" />
            {t("yield.field_parameters")}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-8">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold ml-1">{t("yield.crop_variety")}</label>
                  <select 
                    name="crop"
                    value={formData.crop}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border border-outline/10 rounded-xl p-4 text-sm font-label focus:ring-2 focus:ring-primary/40 text-slate-200 outline-none transition-all"
                  >
                    {CROPS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold ml-1 flex items-center">
                    {t("yield.state_registry")}
                    <GpsIndicator isVisible={!!location.state && formData.state_name === location.state} />
                  </label>
                  <select 
                    name="state_name"
                    value={formData.state_name}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border border-outline/10 rounded-xl p-4 text-sm font-label focus:ring-2 focus:ring-primary/40 text-slate-200 outline-none transition-all"
                  >
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold ml-1 flex items-center">
                    {t("yield.district_focus")}
                    <GpsIndicator isVisible={!!location.district && formData.dist_name === location.district} />
                  </label>
                  <select 
                    name="dist_name"
                    value={formData.dist_name}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border border-outline/10 rounded-xl p-4 text-sm font-label focus:ring-2 focus:ring-primary/40 text-slate-200 outline-none transition-all"
                  >
                    {(DISTRICTS_BY_STATE[formData.state_name] || []).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {[
                  { name: "area_ha", label: t("yield.area_ha"), step: "0.01", placeholder: "e.g. 5.5" },
                  { name: "temperature_c", label: t("yield.temp"), placeholder: "e.g. 28.5" },
                  { name: "humidity_percentage", label: t("yield.humidity"), placeholder: "e.g. 60.0" },
                  { name: "rainfall_mm", label: t("yield.rainfall"), placeholder: "e.g. 100.0" },
                  { name: "wind_speed_m_s", label: t("yield.wind"), placeholder: "e.g. 15.0" },
                  { name: "solar_radiation_mj_m2_day", label: t("yield.solar"), placeholder: "e.g. 20.0" },
                  { name: "n_req_kg_per_ha", label: t("yield.n_cap"), placeholder: "e.g. 120" },
                  { name: "p_req_kg_per_ha", label: t("yield.p_cap"), placeholder: "e.g. 60" },
                  { name: "k_req_kg_per_ha", label: t("yield.k_cap"), placeholder: "e.g. 40" },
                ].map(field => (
                  <div key={field.name} className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold ml-1">{field.label}</label>
                    <input 
                      type="number" 
                      step={field.step || "1"}
                      name={field.name}
                      value={formData[field.name as keyof YieldFormData]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      className="w-full bg-surface-container-low border border-outline/10 rounded-xl p-4 text-sm font-label focus:ring-2 focus:ring-primary/40 text-slate-200 outline-none transition-all" 
                    />
                  </div>
                ))}
            </div>

            <button 
              disabled={loading}
              className={`w-full py-4 rounded-2xl liquid-pill text-surface font-label font-bold text-base sm:text-lg shadow-2xl shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {t("yield.processing_vectors")}
                </>
              ) : (
                t("yield.execute_modeling")
              )}
            </button>
          </form>
        </div>

        <div className="xl:col-span-4 space-y-5 sm:space-y-7">
          <div className="glass-panel p-5 sm:p-7 rounded-2xl border border-outline-variant/10 shadow-xl overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-all duration-700"></div>
             <div className="flex items-center gap-4 mb-6 relative">
               <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                 <TrendingUp className="w-8 h-8" />
               </div>
               <div>
                  <h4 className="font-bold text-lg font-headline text-white">{t("yield.predicted_output")}</h4>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">{t("yield.quantum_sim")}</p>
               </div>
             </div>
             
             {result ? (
               <div className="space-y-6 relative">
                 <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white tracking-tighter">{result.predicted_yield.toLocaleString()}</span>
                    <span className="text-xl font-bold text-primary">{result.unit}</span>
                 </div>
                 
                 <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-sm font-semibold text-primary">{t("yield.stable_estimation")}</span>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                    <div className="flex justify-between text-xs font-bold uppercase text-slate-400">
                      <span>{t("yield.feature_impact")}</span>
                      <span>{t("yield.weight")}</span>
                    </div>
                    {Object.entries(result.shap_values).map(([key, val]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-label">
                          <span className="text-slate-300">{key}</span>
                          <span className="text-primary font-bold">{Math.round((val as number) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${(val as number) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
             ) : error ? (
               <div className="flex flex-col items-center justify-center py-12 text-center">
                 <AlertCircle className="w-12 h-12 text-error mb-4 opacity-50" />
                 <p className="text-error font-medium">{error}</p>
                 <button onClick={() => setError(null)} className="mt-4 text-xs underline text-slate-400">Clear Error</button>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                 <div className="w-16 h-16 rounded-full border-2 border-dashed border-outline-variant/30 animate-spin-slow"></div>
                 <p className="text-sm font-label text-slate-500 leading-relaxed max-w-[200px]">
                   Awaiting operational parameters for yield derivation
                 </p>
               </div>
             )}
          </div>
          
          <AIExplanationCard explanation={aiExplanation} />

          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-outline-variant/10 flex items-start gap-4 shadow-lg group hover:border-tertiary/30 transition-all">
             <div className="w-12 h-12 rounded-xl bg-tertiary/20 flex items-center justify-center text-tertiary border border-tertiary/20">
               <CloudSun className="w-6 h-6" />
             </div>
             <div>
                <h4 className="font-bold text-sm tracking-tight mb-1 text-white">{t("weather.sync_title")}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t("weather.sync_desc")} {formData.state_name}.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
