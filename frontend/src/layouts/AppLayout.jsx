import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV = [
  { to: "/", label: "Dashboard", icon: HomeIcon, end: true },
  { to: "/houses", label: "Houses", icon: BuildingIcon },
  { to: "/applicants", label: "Applicants", icon: UsersIcon },
  { to: "/lottery", label: "Lottery Draw", icon: SparklesIcon },
  { to: "/results", label: "Results", icon: TrophyIcon },
];

export default function AppLayout() {
  const { admin, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-full flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-slate-200 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img
              src="/Cbelogo.jpg"
              alt="CBE Logo"
              className="h-10 w-10 object-contain rounded-xl"
            />
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-xs tracking-tight leading-tight whitespace-nowrap">
                Commercial Bank of Ethiopia
              </div>
              <div className="text-[10px] text-gold-600 font-bold tracking-wide mt-0.5 whitespace-nowrap text-center">
                የ ኢትዮጵያ ንግድ ባንክ
              </div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <n.icon className="h-5 w-5" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 px-4 py-3">
          <div className="text-xs text-slate-500 mb-1">Signed in as</div>
          <div className="text-sm font-medium text-slate-800 truncate">
            {admin?.fullName || admin?.username}
          </div>
          <button
            onClick={() => {
              logout();
              nav("/login");
            }}
            className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 bg-fuchsia-800 border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="text-sm font-semibold text-white">
            CBE Apartment Lottery System
          </div>
          <div className="text-sm font-medium text-slate-200">
            {admin?.username}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* Tiny inline icons */
function HomeIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}
function BuildingIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" />
    </svg>
  );
}
function UsersIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function SparklesIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3l1.9 5.7L19.6 10l-5.7 1.9L12 17.6l-1.9-5.7L4.4 10l5.7-1.3z" />
      <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
    </svg>
  );
}
function TrophyIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M17 4h3v3a3 3 0 0 1-3 3M7 4H4v3a3 3 0 0 0 3 3" />
    </svg>
  );
}
