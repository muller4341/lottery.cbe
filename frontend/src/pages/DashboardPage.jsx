import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    houses: 0,
    applicants: 0,
    lotteries: 0,
    sites: 3,
  });
  const [sites, setSites] = useState([]);
  const [houseGroups, setHouseGroups] = useState([]);
  const [applicantGroups, setApplicantGroups] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, st, hg, ag, lr] = await Promise.all([
          api.get("/sites"),
          api.get("/lottery/stats"),
          api.get("/houses/summary"),
          api.get("/applicants/summary"),
          api.get("/lottery/lotteries"),
        ]);
        setSites(s.data.sites || []);
        setStats(st.data.stats || {});
        setHouseGroups(hg.data.groups || []);
        setApplicantGroups(ag.data.groups || []);
        setRecent((lr.data.lotteries || []).slice(0, 5));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  // Build comparison table: per (site, bedType, totalArea)
  const merged = mergeGroups(houseGroups, applicantGroups);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Overview of inventory, applicants, and recent draws.
          </p>
        </div>
        <div className="flex gap-2">
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
                          <span className="badge-blue">{row.bedType}</span>
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
              {recent.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800 truncate">
                      {l.site.name} · {l.bedType} · {l.totalArea}m²
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(l.drawnAt).toLocaleString()}
                    </div>
                  </div>
                  <Link
                    to={`/results/${l.id}`}
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
    </div>
  );
}

function mergeGroups(a, b) {
  const map = new Map();
  for (const g of a) {
    const key = `${g.siteId}|${g.bedType}|${g.totalArea}`;
    map.set(key, {
      key,
      site: g.siteName,
      bedType: g.bedType,
      area: g.totalArea,
      houses: g.count,
      applicants: 0,
    });
  }
  for (const g of b) {
    const key = `${g.siteId}|${g.bedType}|${g.totalArea}`;
    const existing = map.get(key);
    if (existing) existing.applicants = g.count;
    else
      map.set(key, {
        key,
        site: g.siteName,
        bedType: g.bedType,
        area: g.totalArea,
        houses: 0,
        applicants: g.count,
      });
  }
  return [...map.values()].sort((x, y) => {
    if (x.site !== y.site) return x.site.localeCompare(y.site);
    if (x.bedType !== y.bedType) return x.bedType.localeCompare(y.bedType);
    return x.area - y.area;
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
