import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";

export default function SignupPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    
    if (password !== confirmPassword) {
      return setErr("Passwords do not match.");
    }

    setBusy(true);
    try {
      const { data } = await api.post("/auth/signup", {
        username,
        fullName,
        email,
        password,
        confirmPassword
      });

      if (data.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/"; // Reload application context down to root dashboard path
      } else {
        setErr(data.message || "Registration failed");
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Registration failed. Try checking input values.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative font-sans bg-slate-50 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#95298E]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#d4af37]/10 blur-[120px] pointer-events-none" />

      {/* Left Side - Branding & Banner Asset */}
      <div className="hidden lg:flex flex-col justify-between p-16 relative z-10">
        
        {/* Minimalist Branded Header */}
        <div className="flex items-center gap-3.5">
          <img
            src="/Cbelogo.jpg"
            alt="CBE Logo"
            className="h-11 w-11 object-contain rounded-xl bg-white p-1 shadow-sm border border-slate-200/40"
          />
          <div className="min-w-0">
            <h1 className="font-black text-[#95298E] text-sm tracking-tight uppercase">
              Commercial Bank of Ethiopia
            </h1>
            <p className="text-xs text-[#d4af37] font-bold tracking-wide mt-0.5">
              የኢትዮጵያ ንግድ ባንክ
            </p>
          </div>
        </div>

        {/* Minimized Content Hero Block */}
        <div className="max-w-md my-auto space-y-3">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            House Lottery <br />
            <span className="text-[#95298E]">Admin Portal</span>
          </h2>
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            Centralized platform for secure asset allocation.
          </p>
        </div>

        {/* Premium Graphic Container */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl shadow-slate-200/50 aspect-[16/10] w-full bg-white group transition-all duration-300 hover:shadow-2xl hover:shadow-[#95298E]/5">
          <img
            src="/bgImage.png"
            alt="CBE Corporate Banner"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Compact Footer */}
        <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between border-t border-slate-200/60 pt-4">
          <span>© {new Date().getFullYear()} CBE</span>
          <span className="text-[#d4af37] font-bold tracking-widest">v1.2.0</span>
        </div>
      </div>

      {/* Right Side Form container */}
      <div className="flex items-center justify-center p-6 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md bg-white border border-slate-200/50 rounded-3xl p-10 shadow-[0_20px_50px_rgba(149,41,141,0.05)] backdrop-blur-xl my-8">
          <div className="space-y-2 mb-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sign Up</h3>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Register new supervisor entity profile</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-[#95298E]" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Abebe Bikila" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
              <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-[#95298E]" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="abebe_cbe" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input type="email" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-[#95298E]" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="abebe@cbe.com.et" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <input type="password" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-[#95298E]" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <input type="password" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-[#95298E]" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
            </div>

            {err && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-700 flex items-center gap-2">
                <span>⚠️</span> <span className="font-semibold">{err}</span>
              </div>
            )}

            <button type="submit" className="w-full mt-2 py-3 bg-[#95298E] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#95298E]/10" disabled={busy}>
              {busy ? "Creating Profile..." : "Register & Access"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-4 font-medium">
            Already have an account? <Link to="/login" className="text-[#95298E] font-bold hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}