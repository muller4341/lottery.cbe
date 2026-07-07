// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import api from "../api/client";

// export default function DashboardPage() {
//   const [stats, setStats] = useState({
//     houses: 0,
//     applicants: 0,
//     lotteries: 0,
//     sites: 0,
//   });
//   const [sites, setSites] = useState([]);
//   const [houseGroups, setHouseGroups] = useState([]);
//   const [applicantGroups, setApplicantGroups] = useState([]);
//   const [recent, setRecent] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const [s, st, hg, ag, lr] = await Promise.all([
//           api.get('/houses/sites'),
//           api.get("/lottery/stats"),
//           api.get("/houses/summary"),
//           api.get("/applicants/summary"),
//           api.get("/lottery/lotteries"),
//         ]);
//         const uniqueSites = s.data.sites || [];
//         setSites(uniqueSites);

//         // Ensure total unique site length metric updates correctly
//         const baseStats = st.data.stats || {};
//         setStats({
//           ...baseStats,
//           sites: uniqueSites.length,
//         });

//         setHouseGroups(hg.data.groups || []);
//         setApplicantGroups(ag.data.groups || []);
//         setRecent((lr.data.lotteries || []).slice(0, 5));
//       } catch (err) {
//         console.error("Dashboard metrics fetch failure", err);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const cards = [
//     {
//       label: "Sites",
//       value: stats.sites,
//       borderColor: "#95298E", // CBE Purple
//       bgLight: "bg-brand-50",
//       textClass: "text-brand-700",
//       bgGradient: "to-brand-50/25",
//       icon: GlobeIcon,
//       to: null,
//     },
//     {
//       label: "Houses (total)",
//       value: stats.houses,
//       borderColor: "#10b981", // Emerald
//       bgLight: "bg-emerald-50",
//       textClass: "text-emerald-700",
//       bgGradient: "to-emerald-50/30",
//       icon: HomeIcon,
//       to: "/houses",
//     },
//     {
//       label: "Applicants",
//       value: stats.applicants,
//       borderColor: "#f59e0b", // Amber
//       bgLight: "bg-amber-50",
//       textClass: "text-amber-700",
//       bgGradient: "to-amber-50/30",
//       icon: UsersIcon,
//       to: "/applicants",
//     },
//     {
//       label: "Lotteries drawn",
//       value: stats.lotteries,
//       borderColor: "#B38D32", // CBE Gold
//       bgLight: "bg-gold-50",
//       textClass: "text-gold-700",
//       bgGradient: "to-gold-50/25",
//       icon: AwardIcon,
//       to: "/results",
//     },
//   ];

//   // Safely aggregate table summaries matching your raw data payload
//   const merged = mergeGroups(houseGroups, applicantGroups);

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
//           <p className="text-sm text-slate-500">
//             Overview of inventory, applicants, and recent draws.
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Link to="/houses" className="btn-secondary">
//             Manage Houses
//           </Link>
//           <Link to="/applicants" className="btn-secondary">
//             Manage Applicants
//           </Link>
//           <Link to="/lottery" className="btn-primary">
//             Start a Lottery
//           </Link>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {cards.map((c) => {
//           const CardContent = (
//             <>
//               <div className="space-y-1 pr-2">
//                 <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
//                   {c.label}
//                 </span>
//                 <div className="text-3xl font-black text-slate-900 tracking-tight leading-none">
//                   {loading ? "—" : c.value}
//                 </div>
//               </div>
//               <div
//                 className={`p-2.5 rounded-xl ${c.bgLight} ${c.textClass} shadow-sm border border-black/5`}
//               >
//                 <c.icon className="h-5 w-5" />
//               </div>
//             </>
//           );

//           if (c.to) {
//             return (
//               <Link
//                 key={c.label}
//                 to={c.to}
//                 className={`card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-l-4 flex items-center justify-between cursor-pointer bg-gradient-to-br from-white ${c.bgGradient}`}
//                 style={{ borderLeftColor: c.borderColor }}
//               >
//                 {CardContent}
//               </Link>
//             );
//           }

//           return (
//             <div
//               key={c.label}
//               className={`card p-5 border-l-4 flex items-center justify-between bg-gradient-to-br from-white ${c.bgGradient}`}
//               style={{ borderLeftColor: c.borderColor }}
//             >
//               {CardContent}
//             </div>
//           );
//         })}
//       </div>

//       <div className="grid lg:grid-cols-3 gap-6">
//         <div className="card p-5 lg:col-span-2">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="font-semibold text-slate-900">
//               Houses vs applicants information
//             </h2>
//             <span className="text-xs text-slate-500">
//               Per (site, bed type, area)
//             </span>
//           </div>
//           {merged.length === 0 ? (
//             <div className="py-12 text-center text-sm text-slate-500">
//               No data yet. Upload houses and applicants to see the breakdown.
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="text-left text-slate-500 border-b">
//                     <th className="py-2 pr-4">Site</th>
//                     <th className="py-2 pr-4">Bed Type</th>
//                     <th className="py-2 pr-4">Area (m²)</th>
//                     <th className="py-2 pr-4 text-right">Houses</th>
//                     <th className="py-2 pr-4 text-right">Applicants</th>
//                     <th className="py-2 pr-4 text-right">Demand</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {merged.map((row) => {
//                     const oversub = row.applicants > row.houses;
//                     return (
//                       <tr
//                         key={row.key}
//                         className="border-b last:border-0 hover:bg-slate-50"
//                       >
//                         <td className="py-2 pr-4 font-medium text-slate-800">
//                           {row.site}
//                         </td>
//                         <td className="py-2 pr-4">
//                           <span className="badge-blue">{row.bedType} Bed</span>
//                         </td>
//                         <td className="py-2 pr-4">{row.area}</td>
//                         <td className="py-2 pr-4 text-right tabular-nums">
//                           {row.houses}
//                         </td>
//                         <td className="py-2 pr-4 text-right tabular-nums">
//                           {row.applicants}
//                         </td>
//                         <td className="py-2 pr-4 text-right">
//                           {oversub ? (
//                             <span className="badge-red">Oversubscribed</span>
//                           ) : (
//                             <span className="badge-green">Sufficient</span>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         <div className="card p-5">
//           <h2 className="font-semibold text-slate-900 mb-4">
//             Recent lottery draws
//           </h2>
//           {recent.length === 0 ? (
//             <div className="py-12 text-center text-sm text-slate-500">
//               No lotteries yet.{" "}
//               <Link to="/lottery" className="text-brand-600 hover:underline">
//                 Start one
//               </Link>
//               .
//             </div>
//           ) : (
//             <ul className="space-y-3">
//               {recent.map((l, idx) => (
//                 <li
//                   key={l.id || idx}
//                   className="flex items-center justify-between gap-3"
//                 >
//                   <div className="min-w-0">
//                     <div className="font-medium text-slate-800 truncate">
//                       {l.site} · {l.bedroom} Bed · {l.area}m²
//                     </div>
//                     <div className="text-xs text-slate-500">
//                       {new Date(l.drawDate).toLocaleString()}
//                     </div>
//                   </div>
//                   <Link
//                     to={`/results/${l.lotteryRunId}`}
//                     className="btn-secondary text-xs"
//                   >
//                     View
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function mergeGroups(houseGroups, applicantGroups) {
//   const map = new Map();

//   for (const g of houseGroups) {
//     const key = `${g.site}|${g.bedroom}|${g.area}`;
//     map.set(key, {
//       key,
//       site: g.site,
//       bedType: String(g.bedroom),
//       area: g.area,
//       houses: g.count,
//       applicants: 0,
//     });
//   }

//   for (const g of applicantGroups) {
//     const key = `${g.site}|${g.bedroom}|${g.area}`;
//     const existing = map.get(key);
//     if (existing) {
//       existing.applicants = g.count;
//     } else {
//       map.set(key, {
//         key,
//         site: g.site,
//         bedType: String(g.bedroom),
//         area: g.area,
//         houses: 0,
//         applicants: g.count,
//       });
//     }
//   }

//   return [...map.values()].sort((x, y) => {
//     if (x.site !== y.site) return x.site.localeCompare(y.site);
//     if (x.bedType !== y.bedType) return x.bedType.localeCompare(y.bedType);
//     return parseFloat(x.area) - parseFloat(y.area);
//   });
// }

// /* Icons for dashboard cards */
// function GlobeIcon(props) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2.5"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       {...props}
//     >
//       <circle cx="12" cy="12" r="10" />
//       <line x1="2" y1="12" x2="22" y2="12" />
//       <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
//     </svg>
//   );
// }
// function HomeIcon(props) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2.5"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       {...props}
//     >
//       <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" />
//     </svg>
//   );
// }
// function UsersIcon(props) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2.5"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       {...props}
//     >
//       <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
//       <circle cx="9" cy="7" r="4" />
//       <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
//       <path d="M16 3.13a4 4 0 0 1 0 7.75" />
//     </svg>
//   );
// }
// function AwardIcon(props) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2.5"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       {...props}
//     >
//       <circle cx="12" cy="8" r="7" />
//       <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
//     </svg>
//   );
// }

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    houses: 0,
    applicants: 0,
    lotteries: 0,
    sites: 0,
  });
  const [sites, setSites] = useState([]);
  const [houseGroups, setHouseGroups] = useState([]);
  const [applicantGroups, setApplicantGroups] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  // Custom interactive popup modal open toggle state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  async function loadMetrics() {
    setLoading(true);
    try {
      const [s, st, hg, ag, lr] = await Promise.all([
        api.get("/houses/sites"),
        api.get("/lottery/stats"),
        api.get("/houses/summary"),
        api.get("/applicants/summary"),
        api.get("/lottery/lotteries"),
      ]);
      const uniqueSites = s.data.sites || [];
      setSites(uniqueSites);

      const baseStats = st.data.stats || {};
      setStats({
        ...baseStats,
        sites: uniqueSites.length,
      });

      setHouseGroups(hg.data.groups || []);
      setApplicantGroups(ag.data.groups || []);
      setRecent((lr.data.lotteries || []).slice(0, 5));
    } catch (err) {
      console.error("Dashboard metrics fetch failure", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMetrics();
  }, []);

  // System Truncation Database API Handler
  async function executeDatabaseWipe() {
    setClearing(true);
    try {
      const { data } = await api.post("/lottery/clear-database");
      if (data.ok) {
        setShowConfirmModal(false); // Close modal cleanly
        alert("Database cleared successfully!");
        await loadMetrics();
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to wipe tables.");
    } finally {
      setClearing(false);
    }
  }

  const cards = [
    {
      label: "Sites",
      value: stats.sites,
      borderColor: "#95298E", // CBE Purple
      bgLight: "bg-brand-50",
      textClass: "text-brand-700",
      bgGradient: "to-brand-50/25",
      icon: GlobeIcon,
      to: null,
    },
    {
      label: "Houses (total)",
      value: stats.houses,
      borderColor: "#10b981", // Emerald
      bgLight: "bg-emerald-50",
      textClass: "text-emerald-700",
      bgGradient: "to-emerald-50/30",
      icon: HomeIcon,
      to: "/houses",
    },
    {
      label: "Applicants",
      value: stats.applicants,
      borderColor: "#f59e0b", // Amber
      bgLight: "bg-amber-50",
      textClass: "text-amber-700",
      bgGradient: "to-amber-50/30",
      icon: UsersIcon,
      to: "/applicants",
    },
    {
      label: "Lotteries drawn",
      value: stats.lotteries,
      borderColor: "#B38D32", // CBE Gold
      bgLight: "bg-gold-50",
      textClass: "text-gold-700",
      bgGradient: "to-gold-50/25",
      icon: AwardIcon,
      to: "/results",
    },
  ];

  const merged = mergeGroups(houseGroups, applicantGroups);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Overview of houses, applicants, and recent draws.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {/* Replaced raw window alert with beautiful custom state prompt setter */}
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 font-semibold rounded-lg text-sm transition-colors"
          >
            Clear Data 📂
          </button>

          <Link to="/houses" className="btn-secondary">
            Manage Houses
          </Link>
          <Link to="/applicants" className="btn-secondary">
            Manage Applicants
          </Link>
          <Link to="/lottery" className="btn-primary">
            Start a Lottery
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const CardContent = (
            <>
              <div className="space-y-1 pr-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {c.label}
                </span>
                <div className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                  {loading ? "—" : c.value}
                </div>
              </div>
              <div
                className={`p-2.5 rounded-xl ${c.bgLight} ${c.textClass} shadow-sm border border-black/5`}
              >
                <c.icon className="h-5 w-5" />
              </div>
            </>
          );

          if (c.to) {
            return (
              <Link
                key={c.label}
                to={c.to}
                className={`card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-l-4 flex items-center justify-between cursor-pointer bg-gradient-to-br from-white ${c.bgGradient}`}
                style={{ borderLeftColor: c.borderColor }}
              >
                {CardContent}
              </Link>
            );
          }

          return (
            <div
              key={c.label}
              className={`card p-5 border-l-4 flex items-center justify-between bg-gradient-to-br from-white ${c.bgGradient}`}
              style={{ borderLeftColor: c.borderColor }}
            >
              {CardContent}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">
              Houses vs applicants information
            </h2>
            <span className="text-xs text-slate-500">
              Per (site, bed type, area)
            </span>
          </div>
          {merged.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No data yet. Upload houses and applicants to see the breakdown.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-4">Site</th>
                    <th className="py-2 pr-4">Bed Type</th>
                    <th className="py-2 pr-4">Area (m²)</th>
                    <th className="py-2 pr-4 text-right">Houses</th>
                    <th className="py-2 pr-4 text-right">Applicants</th>
                    <th className="py-2 pr-4 text-right">Demand</th>
                  </tr>
                </thead>
                <tbody>
                  {merged.map((row) => {
                    const oversub = row.applicants > row.houses;
                    return (
                      <tr
                        key={row.key}
                        className="border-b last:border-0 hover:bg-slate-50"
                      >
                        <td className="py-2 pr-4 font-medium text-slate-800">
                          {row.site}
                        </td>
                        <td className="py-2 pr-4">
                          <span className="badge-blue">{row.bedType} Bed</span>
                        </td>
                        <td className="py-2 pr-4">{row.area}</td>
                        <td className="py-2 pr-4 text-right tabular-nums">
                          {row.houses}
                        </td>
                        <td className="py-2 pr-4 text-right tabular-nums">
                          {row.applicants}
                        </td>
                        <td className="py-2 pr-4 text-right">
                          {oversub ? (
                            <span className="badge-red">Oversubscribed</span>
                          ) : (
                            <span className="badge-green">Sufficient</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">
            Recent lottery draws
          </h2>
          {recent.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No lotteries yet.{" "}
              <Link to="/lottery" className="text-brand-600 hover:underline">
                Start one
              </Link>
              .
            </div>
          ) : (
            <ul className="space-y-3">
              {recent.map((l, idx) => (
                <li
                  key={l.id || idx}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800 truncate">
                      {l.site} · {l.bedroom} Bed · {l.area}m²
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(l.drawDate).toLocaleString()}
                    </div>
                  </div>
                  <Link
                    to={`/results/${l.lotteryRunId}`}
                    className="btn-secondary text-xs"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* CUSTOM PREMIUM GLASSMORPHISM SYSTEM RESET DIALOG CARD MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[99999] flex items-center justify-center p-4 transition-all duration-300 animate-modal-fade">
          <div
            className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-100 shadow-2xl relative overflow-hidden animate-card-zoom"
            style={{ boxShadow: "0 30px 70px -10px rgba(239,68,68,0.18)" }}
          >
            {/* Ambient Background Glow Accent */}
            <div className="absolute top-[-20%] right-[-20%] w-40 h-40 rounded-full bg-red-500/10 blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center font-black text-2xl shadow-sm border border-red-100/50">
                ⚠️
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Wipe System Database?
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  This action cannot be undone
                </p>
              </div>

              <p className="text-sm text-slate-500 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-inner">
                Are you completely sure you want to delete all loaded{" "}
                <strong className="text-slate-800">Houses</strong>,{" "}
                <strong className="text-slate-800">Applicants</strong>, and
                historical{" "}
                <strong className="text-slate-800">Lottery Results</strong>? All
                values will reset back to zero.
              </p>

              <div className="w-full flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={clearing}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-200/40"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDatabaseWipe}
                  disabled={clearing}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-[0.99]"
                >
                  {clearing ? "Wiping Data..." : "Confirm & Wipe"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animation Interpolators */}
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cardZoomIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-modal-fade {
          animation: modalFadeIn 0.2s ease-out forwards;
        }
        .animate-card-zoom {
          animation: cardZoomIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}

function mergeGroups(houseGroups, applicantGroups) {
  const map = new Map();

  for (const g of houseGroups) {
    const key = `${g.site}|${g.bedroom}|${g.area}`;
    map.set(key, {
      key,
      site: g.site,
      bedType: String(g.bedroom),
      area: g.area,
      houses: g.count,
      applicants: 0,
    });
  }

  for (const g of applicantGroups) {
    const key = `${g.site}|${g.bedroom}|${g.area}`;
    const existing = map.get(key);
    if (existing) {
      existing.applicants = g.count;
    } else {
      map.set(key, {
        key,
        site: g.site,
        bedType: String(g.bedroom),
        area: g.area,
        houses: 0,
        applicants: g.count,
      });
    }
  }

  return [...map.values()].sort((x, y) => {
    if (x.site !== y.site) return x.site.localeCompare(y.site);
    if (x.bedType !== y.bedType) return x.bedType.localeCompare(y.bedType);
    return parseFloat(x.area) - parseFloat(y.area);
  });
}

/* Icons for dashboard cards */
function GlobeIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function HomeIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}
function UsersIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
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
function AwardIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="8" r="7" />
      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
    </svg>
  );
}
