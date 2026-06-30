import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";

export default function ForgotPasswordPage() {
  const nav = useNavigate();
  const [step, setStep] = useState(1); // 1: Email Input | 2: Verification Code & New Password
  const [email, setEmail] = useState("");
  const [recoveryToken, setRecoveryToken] = useState(""); // Captures the user-inputted code from email
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Step 1: Submit email to fire code
  async function handleTokenRequest(e) {
    e.preventDefault();
    setErr("");
    setMessage("");
    setBusy(true);

    try {
      const { data } = await api.post("/auth/forgot-password/request", { email });
      if (data.ok) {
        setMessage(data.message);
        setTimeout(() => {
          setMessage("");
          setStep(2); // Move to password entry step
        }, 2000);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to locate email configuration rules.");
    } finally {
      setBusy(false);
    }
  }

  // Step 2: Submit code along with the new password configuration fields
  async function handlePasswordReset(e) {
    e.preventDefault();
    setErr("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      return setErr("Passwords do not match.");
    }

    setBusy(true);
    try {
      const { data } = await api.post("/auth/forgot-password/reset", {
        token: recoveryToken.trim(), // Send user's code to backend for cross-verification
        newPassword,
        confirmPassword
      });

      if (data.ok) {
        setMessage(data.message);
        setTimeout(() => nav("/login"), 2500);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative font-sans bg-slate-50 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#95298E]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#d4af37]/10 blur-[120px] pointer-events-none" />

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

      <div className="flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-white border border-slate-200/50 rounded-3xl p-10 shadow-[0_20px_50px_rgba(149,41,141,0.05)] backdrop-blur-xl py-20">
          
          <div className="space-y-2 mb-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {step === 1 ? "Reset Password" : "Verify Reset Code"}
            </h3>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {step === 1 ? "Step 1: Request Email Code" : "Step 2: Complete Identity Verification"}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleTokenRequest} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none text-xs">✉️</span>
                  <input type="email" className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#95298E]" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="supervisor@cbe.com.et" required />
                </div>
              </div>

              {err && <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs text-red-700 flex items-center gap-2"><span>⚠️</span> <span className="font-semibold">{err}</span></div>}
{message && <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 text-xs text-emerald-700 flex items-center gap-2"><span>✅</span> <span className="font-semibold">{message}</span></div>}

              <button type="submit" className="w-full py-3.5 px-4 bg-[#95298E] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#95298E]/20" disabled={busy}>
                {busy ? "Sending Verification Code..." : "Send Verification Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">6-Digit Verification Code</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none text-xs">🔢</span>
                  <input type="text" className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#95298E] tracking-widest font-mono text-center" value={recoveryToken} onChange={(e) => setRecoveryToken(e.target.value)} placeholder="000000" maxLength={6} required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none text-xs">🔑</span>
                  <input type="password" className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#95298E]" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none text-xs">🔑</span>
                  <input type="password" className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#95298E]" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
                </div>
              </div>

              {err && <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs text-red-700 flex items-center gap-2"><span>⚠️</span> <span className="font-semibold">{err}</span></div>}
              {message && <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 text-xs text-emerald-700 flex items-center gap-2"><span>✅</span> <span className="font-semibold">{message}</span></div>}

              <button type="submit" className="w-full py-3.5 px-4 bg-[#95298E] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#95298E]/20" disabled={busy}>
                {busy ? "Resetting Password..." : "Reset Account Password"}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-500 mt-6 font-medium">
            Remembered your password? <Link to="/login" className="text-[#95298E] font-bold hover:underline">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}