import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login, admin } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (admin) {
    nav("/", { replace: true });
    return null;
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const data = await login(username.trim(), password);
      if (!data.ok) setErr(data.message || "Login failed");
      else nav("/", { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative font-sans bg-slate-50 overflow-hidden">
      
      {/* Dynamic Background Glows shared across the page view */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#95298E]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#d4af37]/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[45%] w-[300px] h-[300px] rounded-full bg-[#95298E]/5 blur-[90px] pointer-events-none" />

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

      {/* Right Side - Clean Centered Form */}
      <div className="flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-white border border-slate-200/50 rounded-3xl p-10 shadow-[0_20px_50px_rgba(149,41,141,0.05)] backdrop-blur-xl   py-32">
          
          {/* Mobile Identity Header */}
          <div className="lg:hidden flex items-center gap-3 mb-8 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
            <img
              src="/Cbelogo.jpg"
              alt="CBE Logo"
              className="h-9 w-9 object-contain rounded-lg bg-white p-0.5"
            />
            <div className="min-w-0">
              <div className="font-bold text-slate-800 text-xs tracking-tight">CBE Admin</div>
              <div className="text-[10px] text-[#95298E] font-bold">የኢትዮጵያ ንግድ ባንክ</div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign In
            </h3>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Enter secure credentials below
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none text-xs">
                  👤
                </span>
                <input
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#95298E] focus:ring-4 focus:ring-[#95298E]/5 transition-all duration-200"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin_username"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none text-xs">
                  🔑
                </span>
                <input
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#95298E] focus:ring-4 focus:ring-[#95298E]/5 transition-all duration-200"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {err && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs text-red-700 flex items-start gap-2">
                <span>⚠️</span>
                <span className="font-semibold">{err}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-4 bg-[#95298E] hover:bg-[#83237c] text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-lg shadow-[#95298E]/20 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
              disabled={busy}
            >
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                "Access Dashboard"
              )}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}