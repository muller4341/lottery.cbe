


// import { useEffect, useMemo, useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/client';
// import SpinningCardAnimation from '../components/SpinningCardAnimation';

// export default function LotteryPage() {
//   const nav = useNavigate();
//   const [sites, setSites] = useState([]);
//   const [houseGroups, setHouseGroups] = useState([]);
//   const [applicantGroups, setApplicantGroups] = useState([]);
//   const [lotteries, setLotteries] = useState([]);

//   const [siteId, setSiteId] = useState('');
//   const [bedType, setBedType] = useState('');
//   const [totalArea, setTotalArea] = useState('');

//   const [drawing, setDrawing] = useState(false);
//   const [err, setErr] = useState('');
//   const [summary, setSummary] = useState(null);
//   const [confirmOpen, setConfirmOpen] = useState(false);

//   // Spinning card animation state variables for sharing data
//   const [drawApplicants, setDrawApplicants] = useState([]);
//   const [drawWinners, setDrawWinners] = useState([]);
//   const [drawResults, setDrawResults] = useState([]);
//   const [drawSummary, setDrawSummary] = useState(null);

//   useEffect(() => {
//     (async () => {
//       const [s, hg, ag, lr] = await Promise.all([
//         api.get('/sites'),
//         api.get('/houses/summary'),
//         api.get('/applicants/summary'),
//         api.get('/lottery/lotteries'),
//       ]);
//       setSites(s.data.sites || []);
//       setHouseGroups(hg.data.groups || []);
//       setApplicantGroups(ag.data.groups || []);
//       setLotteries(lr.data.lotteries || []);
//     })();
//   }, []);

//   // 1. DYNAMIC FILTER: Only show sites that have available houses
//   const availableSites = useMemo(() => {
//     // Extract site IDs from groups that have houses
//     const activeSiteIds = new Set(
//       houseGroups.filter((g) => g.count > 0).map((g) => g.siteId)
//     );
//     // Filter master sites array to only include those active IDs
//     return sites.filter((s) => activeSiteIds.has(s.id));
//   }, [sites, houseGroups]);

//   // 2. DYNAMIC FILTER: Only show bed types available for the chosen siteId
//   const availableBedTypes = useMemo(() => {
//     if (!siteId) return [];
//     const filtered = houseGroups.filter(
//       (g) => g.siteId === Number(siteId) && g.count > 0
//     );
//     return [...new Set(filtered.map((g) => g.bedType))];
//   }, [siteId, houseGroups]);

//   // 3. DYNAMIC FILTER: Only show total areas available for the chosen (siteId, bedType)
//   const availableAreas = useMemo(() => {
//     if (!siteId || !bedType) return [];
//     const key = (g) => g.siteId === Number(siteId) && g.bedType === bedType && g.count > 0;
    
//     // Only mapping from house groups to match property inventory availability
//     const fromH = houseGroups.filter(key).map((g) => g.totalArea);
//     return [...new Set(fromH)].sort((a, b) => a - b);
//   }, [siteId, bedType, houseGroups]);

//   // Live preview of the draw scope
//   const preview = useMemo(() => {
//     const sid = Number(siteId);
//     const area = Number(totalArea);
//     if (!sid || !bedType || Number.isNaN(area)) return null;
//     const houses = houseGroups.find(
//       (g) => g.siteId === sid && g.bedType === bedType && Number(g.totalArea) === area
//     );
//     const applicants = applicantGroups.find(
//       (g) => g.siteId === sid && g.bedType === bedType && Number(g.totalArea) === area
//     );
//     const houseCount = houses?.count || 0;
//     const appCount = applicants?.count || 0;
//     const winners = Math.min(houseCount, appCount);
//     const waitlist = Math.max(0, appCount - houseCount);
//     return { houseCount, appCount, winners, waitlist };
//   }, [siteId, bedType, totalArea, houseGroups, applicantGroups]);

//   // Already-drawn combinations
//   const drawnKeys = useMemo(() => {
//     return new Set(lotteries.map((l) => `${l.siteId}|${l.bedType}|${l.totalArea}`));
//   }, [lotteries]);

//   const isAlreadyDrawn = useMemo(() => {
//     if (!siteId || !bedType || !totalArea) return false;
//     return drawnKeys.has(`${siteId}|${bedType}|${totalArea}`);
//   }, [siteId, bedType, totalArea, drawnKeys]);

//   async function runDraw() {
//     setErr('');
//     setSummary(null);
//     setDrawing(true);
//     setDrawSummary(null);
//     setDrawWinners([]);
//     setDrawApplicants([]);
//     setDrawResults([]);

//     try {
//       const applicantsRes = await api.get('/applicants', {
//         params: {
//           siteId: Number(siteId),
//           bedType,
//           totalArea: Number(totalArea),
//         },
//       });
//       const allApplicants = applicantsRes.data.applicants || [];
//       setDrawApplicants(allApplicants);

//       const { data } = await api.post('/lottery/draw', {
//         siteId: Number(siteId),
//         bedType,
//         totalArea: Number(totalArea),
//       });

//       if (!data.ok) {
//         setErr(data.message || 'Draw failed');
//         setDrawing(false);
//         setConfirmOpen(false);
//         return;
//       }

//       const resultsRes = await api.get(`/lottery/lotteries/${data.lotteryId}`);
//       const results = resultsRes.data.results || [];
//       const winners = results.filter((r) => r.status === 'WINNER');

//       setDrawResults(results);
//       setDrawWinners(winners);
//       setDrawSummary(data);
//       setSummary(data);

//       api.get('/lottery/lotteries').then((lr) => {
//         setLotteries(lr.data.lotteries || []);
//       });
//     } catch (e) {
//       console.error(e);
//       const msg = e?.response?.data?.message || e.message;
//       setErr(msg || 'Draw failed');
//       setDrawing(false);
//     } finally {
//       setConfirmOpen(false);
//     }
//   }

//   return (
//     <div className="space-y-6 relative">
//       {drawing && (
//         <SpinningCardAnimation
//           siteName={sites.find((s) => s.id === Number(siteId))?.name}
//           bedType={bedType}
//           totalArea={totalArea}
//           applicants={drawApplicants}
//           winners={drawWinners}
//           results={drawResults}
//           summary={drawSummary}
//           onComplete={() => setDrawing(false)}
//         />
//       )}

//       <div>
//         <h1 className="text-2xl font-bold text-slate-900">Lottery Draw</h1>
//         <p className="text-sm text-slate-500">
//           Pick a single (site, bed type, area) combination and draw the lottery. Each
//           combination can only be drawn once.
//         </p>
//       </div>

//       <div className="grid lg:grid-cols-3 gap-6">
//         <div className="card p-5 lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm">
//           <h2 className="font-semibold text-slate-900 mb-4">Filter & Draw</h2>
//           <div className="grid sm:grid-cols-3 gap-4">
//             <div>
//               <label className="label">Site name</label>
//               <select
//                 className="input"
//                 value={siteId}
//                 onChange={(e) => { setSiteId(e.target.value); setBedType(''); setTotalArea(''); }}
//               >
//                 <option value="">— select site —</option>
//                 {availableSites.map((s) => (
//                   <option key={s.id} value={s.id}>{s.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="label">Bed type</label>
//               <select
//                 className="input"
//                 value={bedType}
//                 onChange={(e) => { setBedType(e.target.value); setTotalArea(''); }}
//                 disabled={!siteId}
//               >
//                 <option value="">— select bed —</option>
//                 {availableBedTypes.map((type) => (
//                   <option key={type} value={type}>{type}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="label">Total area (m²)</label>
//               <select
//                 className="input"
//                 value={totalArea}
//                 onChange={(e) => setTotalArea(e.target.value)}
//                 disabled={!siteId || !bedType}
//               >
//                 <option value="">— select area —</option>
//                 {availableAreas.map((a) => (
//                   <option key={a} value={a}>{a}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
//             <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Live scope</h3>
//             {!preview ? (
//               <div className="mt-2 text-sm text-slate-500">
//                 Choose site, bed type, and area to preview the draw.
//               </div>
//             ) : (
//               <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
//                 <Stat label="Houses" value={preview.houseCount} tone="brand" />
//                 <Stat label="Applicants" value={preview.appCount} tone="slate" />
//                 <Stat label="Expected winners" value={preview.winners} tone="emerald" />
//                 <Stat label="Expected waitlist" value={preview.waitlist} tone={preview.waitlist > 0 ? 'amber' : 'slate'} />
//               </div>
//             )}
//           </div>

//           {isAlreadyDrawn && (
//             <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
//               ⚠️ A lottery has <strong>already been drawn</strong> for this combination.
//             </div>
//           )}

//           {err && (
//             <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
//               {err}
//             </div>
//           )}

//           {summary && (
//             <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
//               <div className="font-semibold">Lottery drawn successfully!</div>
//               <div className="mt-1">
//                 {summary.summary.siteName} · {summary.summary.bedType} · {summary.summary.totalArea}m² —{' '}
//                 {summary.summary.winnersCount} winners, {summary.summary.waitlistCount} waitlist.
//               </div>
//               <div className="mt-3 flex gap-2">
//                 <button className="btn-primary" onClick={() => nav(`/results/${summary.lotteryId}`)}>
//                   View results
//                 </button>
//                 <button
//                   className="btn-secondary"
//                   onClick={() => {
//                     setSiteId(''); setBedType(''); setTotalArea(''); setSummary(null);
//                   }}
//                 >
//                   Draw another combination
//                 </button>
//               </div>
//             </div>
//           )}

//           <div className="mt-6 flex gap-2">
//             <button
//               className="btn-primary"
//               disabled={
//                 drawing || !siteId || !bedType || !totalArea || isAlreadyDrawn || !preview || preview.houseCount === 0 || preview.appCount === 0
//               }
//               onClick={() => setConfirmOpen(true)}
//             >
//               Start lottery
//             </button>
//             <button
//               type="button"
//               className="btn-secondary"
//               onClick={() => { setSiteId(''); setBedType(''); setTotalArea(''); setSummary(null); setErr(''); }}
//             >
//               Reset
//             </button>
//           </div>
//         </div>

//         <div className="card p-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
//           <h2 className="font-semibold text-slate-900 mb-3">Drawn lotteries</h2>
//           {lotteries.length === 0 ? (
//             <div className="py-8 text-center text-sm text-slate-500">No lotteries drawn yet.</div>
//           ) : (
//             <ul className="space-y-3">
//               {lotteries.map((l) => (
//                 <li key={l.id} className="flex items-center justify-between gap-3">
//                   <div className="min-w-0">
//                     <div className="font-medium text-slate-800 truncate">
//                       {l.site.name} · {l.bedType} · {l.totalArea}m²
//                     </div>
//                     <div className="text-xs text-slate-500">
//                       {new Date(l.drawnAt).toLocaleString()} · {l.winnersCount} W / {l.waitlistCount} WL
//                     </div>
//                   </div>
//                   <button className="btn-secondary text-xs" onClick={() => nav(`/results/${l.id}`)}>
//                     View
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       </div>

//       {confirmOpen && (
//         <ConfirmDialog
//           preview={preview}
//           siteName={sites.find((s) => s.id === Number(siteId))?.name}
//           bedType={bedType}
//           area={totalArea}
//           onCancel={() => setConfirmOpen(false)}
//           onConfirm={runDraw}
//           busy={drawing}
//         />
//       )}
//     </div>
//   );
// }

// function Stat({ label, value, tone = 'slate' }) {
//   const configs = {
//     slate: { borderColor: '#6366f1', bgLight: 'bg-indigo-50/50', textClass: 'text-indigo-700', bgGradient: 'to-indigo-50/20', icon: UsersIconMini },
//     brand: { borderColor: '#95298E', bgLight: 'bg-brand-50/50', textClass: 'text-brand-700', bgGradient: 'to-brand-50/20', icon: BuildingIconMini },
//     emerald: { borderColor: '#10b981', bgLight: 'bg-emerald-50/50', textClass: 'text-emerald-700', bgGradient: 'to-emerald-50/25', icon: AwardIconMini },
//     amber: { borderColor: '#B38D32', bgLight: 'bg-gold-50/50', textClass: 'text-gold-700', bgGradient: 'to-gold-50/20', icon: WaitlistIconMini },
//   };
//   const c = configs[tone] || configs.slate;
//   return (
//     <div className={`rounded-xl border border-slate-200 border-l-4 p-4 flex items-center justify-between bg-gradient-to-br from-white ${c.bgGradient} shadow-sm`} style={{ borderLeftColor: c.borderColor }}>
//       <div className="space-y-0.5">
//         <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{label}</div>
//         <div className="text-2xl font-black text-slate-900 tabular-nums">{value}</div>
//       </div>
//       <div className={`p-2 rounded-lg ${c.bgLight} ${c.textClass} border border-black/5`}><c.icon className="w-4.5 h-4.5" /></div>
//     </div>
//   );
// }

// function UsersIconMini(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>; }
// function BuildingIconMini(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 9h6M9 13h6M9 17h6" /></svg>; }
// function AwardIconMini(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87(1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>; }
// function WaitlistIconMini(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>; }

// function ConfirmDialog({ preview, siteName, bedType, area, onCancel, onConfirm, busy }) {
//   if (!preview) return null;
//   return (
//     <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
//       <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl">
//         <h3 className="text-lg font-semibold text-slate-900">Confirm lottery draw</h3>
//         <dl className="mt-4 space-y-2 text-sm">
//           <Row k="Site" v={siteName} />
//           <Row k="Bed type" v={bedType} />
//           <Row k="Area" v={`${area} m²`} />
//           <Row k="Houses" v={preview.houseCount} />
//           <Row k="Applicants" v={preview.appCount} />
//         </dl>
//         <div className="mt-6 flex justify-end gap-2">
//           <button className="btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
//           <button className="btn-primary" onClick={onConfirm} disabled={busy}>{busy ? 'Drawing…' : 'Confirm & draw'}</button>
//         </div>
//       </div>
//     </div>
//   );
// }
// function Row({ k, v }) { return <div className="flex items-center justify-between border-b border-slate-100 pb-1"><dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-800">{v}</dd></div>; }import { useEffect, useMemo, useState, useRef } from 'react';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import SpinningCardAnimation from '../components/SpinningCardAnimation';

export default function LotteryPage() {
  const nav = useNavigate();
  const [sites, setSites] = useState([]);
  const [houseGroups, setHouseGroups] = useState([]);
  const [applicantGroups, setApplicantGroups] = useState([]);
  const [lotteries, setLotteries] = useState([]);

  const [siteId, setSiteId] = useState('');
  const [bedType, setBedType] = useState('');
  const [totalArea, setTotalArea] = useState('');

  const [drawing, setDrawing] = useState(false);
  const [err, setErr] = useState('');
  const [summary, setSummary] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [drawApplicants, setDrawApplicants] = useState([]);
  const [drawWinners, setDrawWinners] = useState([]);
  const [drawResults, setDrawResults] = useState([]);
  const [drawSummary, setDrawSummary] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, hg, ag, lr] = await Promise.all([
          api.get('/houses/sites'),
          api.get('/houses/summary'),
          api.get('/applicants/summary'),
          api.get('/lottery/lotteries'),
        ]);
        setSites(s.data.sites || []);
        setHouseGroups(hg.data.groups || []);
        setApplicantGroups(ag.data.groups || []);
        setLotteries(lr.data.lotteries || []);
      } catch (e) {
        console.error("Failed to load initial metrics scope", e);
      }
    })();
  }, []);

  const availableSites = useMemo(() => {
    const activeSites = new Set(houseGroups.filter((g) => g.count > 0).map((g) => g.site));
    return sites.filter((s) => activeSites.has(s));
  }, [sites, houseGroups]);

  const availableBedTypes = useMemo(() => {
    if (!siteId) return [];
    const filtered = houseGroups.filter((g) => g.site === siteId && g.count > 0);
    return [...new Set(filtered.map((g) => String(g.bedroom)))];
  }, [siteId, houseGroups]);

  const availableAreas = useMemo(() => {
    if (!siteId || !bedType) return [];
    const fromH = houseGroups
      .filter((g) => g.site === siteId && String(g.bedroom) === bedType && g.count > 0)
      .map((g) => g.area);
    return [...new Set(fromH)].sort((a, b) => parseFloat(a) - parseFloat(b));
  }, [siteId, bedType, houseGroups]);

  const preview = useMemo(() => {
    if (!siteId || !bedType || !totalArea) return null;
    const houses = houseGroups.find(
      (g) => g.site === siteId && String(g.bedroom) === bedType && g.area === totalArea
    );
    const applicants = applicantGroups.find(
      (g) => g.site === siteId && String(g.bedroom) === bedType && g.area === totalArea
    );
    const houseCount = houses?.count || 0;
    const appCount = applicants?.count || 0;
    const winners = Math.min(houseCount, appCount);
    const waitlist = Math.max(0, appCount - houseCount);
    return { houseCount, appCount, winners, waitlist };
  }, [siteId, bedType, totalArea, houseGroups, applicantGroups]);

  const drawnKeys = useMemo(() => {
    return new Set(lotteries.map((l) => `${l.site}|${l.bedroom}|${l.area}`));
  }, [lotteries]);

  const isAlreadyDrawn = useMemo(() => {
    if (!siteId || !bedType || !totalArea) return false;
    return drawnKeys.has(`${siteId}|${bedType}|${totalArea}`);
  }, [siteId, bedType, totalArea, drawnKeys]);

  async function runDraw() {
    setErr(''); setSummary(null); setDrawing(true);
    setDrawSummary(null); setDrawWinners([]); setDrawApplicants([]); setDrawResults([]);

    const uniqueRunId = `RUN-${Date.now()}`;

    try {
      const applicantsRes = await api.get('/applicants', {
        params: { site: siteId, bedroom: Number(bedType), area: totalArea },
      });
      const allApplicants = applicantsRes.data.applicants || [];
      setDrawApplicants(allApplicants);

      const { data } = await api.post('/lottery/draw', {
        site: siteId,
        bedroom: Number(bedType),
        area: totalArea,
        lotteryRunId: uniqueRunId,
      });

      if (!data.ok) {
        setErr(data.message || 'Draw failed');
        setDrawing(false); setConfirmOpen(false);
        return;
      }

      const resultsRes = await api.get(`/lottery/lotteries/${uniqueRunId}`);
      const results = resultsRes.data.results || [];
      const winners = results.filter((r) => r.status === 'WINNER');

      setDrawResults(results);
      setDrawWinners(winners);
      setDrawSummary(data);
      setSummary(data);

      api.get('/lottery/lotteries').then((lr) => {
        setLotteries(lr.data.lotteries || []);
      });
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e.message || 'Draw failed');
      setDrawing(false);
    } finally {
      setConfirmOpen(false);
    }
  }

  return (
    <div className="space-y-6 relative">
      {drawing && (
        <SpinningCardAnimation
          siteName={siteId}
          bedType={bedType}
          totalArea={totalArea}
          applicants={drawApplicants}
          winners={drawWinners}
          results={drawResults}
          summary={drawSummary}
          onComplete={() => setDrawing(false)}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lottery Draw</h1>
        <p className="text-sm text-slate-500">
          Pick a single (site, bed type, area) combination and draw the lottery. Each
          combination can only be drawn once.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Filter & Draw</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Site name</label>
              <select
                className="input"
                value={siteId}
                onChange={(e) => { setSiteId(e.target.value); setBedType(''); setTotalArea(''); }}
              >
                <option value="">— select site —</option>
                {availableSites.map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Bed type</label>
              <select
                className="input"
                value={bedType}
                onChange={(e) => { setBedType(e.target.value); setTotalArea(''); }}
                disabled={!siteId}
              >
                <option value="">— select bed —</option>
                {availableBedTypes.map((type, i) => (
                  <option key={i} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Total area (m²)</label>
              <select
                className="input"
                value={totalArea}
                onChange={(e) => setTotalArea(e.target.value)}
                disabled={!siteId || !bedType}
              >
                <option value="">— select area —</option>
                {availableAreas.map((a, i) => (
                  <option key={i} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Live scope</h3>
            {!preview ? (
              <div className="mt-2 text-sm text-slate-500">
                Choose site, bed type, and area to preview the draw.
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat label="Houses" value={preview.houseCount} tone="brand" />
                <Stat label="Applicants" value={preview.appCount} tone="slate" />
                <Stat label="Expected winners" value={preview.winners} tone="emerald" />
                <Stat label="Expected waitlist" value={preview.waitlist} tone={preview.waitlist > 0 ? 'amber' : 'slate'} />
              </div>
            )}
          </div>

          {isAlreadyDrawn && (
            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
              ⚠️ A lottery has <strong>already been drawn</strong> for this combination.
            </div>
          )}

          {err && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          {summary && (
            <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
              <div className="font-semibold">Lottery drawn successfully!</div>
              <div className="mt-1">
                {summary.summary.siteName} · {summary.summary.bedType} · {summary.summary.totalArea}m² —{' '}
                {summary.summary.winnersCount} winners, {summary.summary.waitlistCount} waitlist.
              </div>
              <div className="mt-3 flex gap-2">
                <button className="btn-primary" onClick={() => nav(`/results/${summary.lotteryId}`)}>
                  View results
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setSiteId(''); setBedType(''); setTotalArea(''); setSummary(null);
                  }}
                >
                  Draw another combination
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <button
              className="btn-primary"
              disabled={
                drawing || !siteId || !bedType || !totalArea || isAlreadyDrawn || !preview || preview.houseCount === 0 || preview.appCount === 0
              }
              onClick={() => setConfirmOpen(true)}
            >
              Start lottery
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setSiteId(''); setBedType(''); setTotalArea(''); setSummary(null); setErr(''); }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="card p-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-3">Drawn lotteries</h2>
          {lotteries.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">No lotteries drawn yet.</div>
          ) : (
            <ul className="space-y-3">
              {lotteries.map((l, idx) => (
                <li key={l.id || idx} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800 truncate">
                      {l.site} · {l.bedroom} Bed · {l.area}m²
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(l.drawDate).toLocaleString()} · {l.status || 'Drawn'}
                    </div>
                  </div>
                  <button className="btn-secondary text-xs" onClick={() => nav(`/results/${l.lotteryRunId}`)}>
                    View
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {confirmOpen && (
        <ConfirmDialog
          preview={preview}
          siteName={siteId}
          bedType={bedType}
          area={totalArea}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={runDraw}
          busy={drawing}
        />
      )}
    </div>
  );
}

function Stat({ label, value, tone = 'slate' }) {
  const configs = {
    slate: { borderColor: '#6366f1', bgLight: 'bg-indigo-50/50', textClass: 'text-indigo-700', bgGradient: 'to-indigo-50/20', icon: UsersIconMini },
    brand: { borderColor: '#95298E', bgLight: 'bg-brand-50/50', textClass: 'text-brand-700', bgGradient: 'to-brand-50/20', icon: BuildingIconMini },
    emerald: { borderColor: '#10b981', bgLight: 'bg-emerald-50/50', textClass: 'text-emerald-700', bgGradient: 'to-emerald-50/25', icon: AwardIconMini },
    amber: { borderColor: '#B38D32', bgLight: 'bg-gold-50/50', textClass: 'text-gold-700', bgGradient: 'to-gold-50/20', icon: WaitlistIconMini },
  };
  const c = configs[tone] || configs.slate;
  return (
    <div className={`rounded-xl border border-slate-200 border-l-4 p-4 flex items-center justify-between bg-gradient-to-br from-white ${c.bgGradient} shadow-sm`} style={{ borderLeftColor: c.borderColor }}>
      <div className="space-y-0.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{label}</div>
        <div className="text-2xl font-black text-slate-900 tabular-nums">{value}</div>
      </div>
      <div className={`p-2 rounded-lg ${c.bgLight} ${c.textClass} border border-black/5`}><c.icon className="w-4.5 h-4.5" /></div>
    </div>
  );
}

function UsersIconMini(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>; }
function BuildingIconMini(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 9h6M9 13h6M9 17h6" /></svg>; }
function AwardIconMini(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87l1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>; }
function WaitlistIconMini(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>; }

function ConfirmDialog({ preview, siteName, bedType, area, onCancel, onConfirm, busy }) {
  if (!preview) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900">Confirm lottery draw</h3>
        <dl className="mt-4 space-y-2 text-sm">
          <Row k="Site" v={siteName} />
          <Row k="Bed type" v={`${bedType} Bed`} />
          <Row k="Area" v={`${area} m²`} />
          <Row k="Houses" v={preview.houseCount} />
          <Row k="Applicants" v={preview.appCount} />
        </dl>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="btn-primary" onClick={onConfirm} disabled={busy}>{busy ? 'Drawing…' : 'Confirm & draw'}</button>
        </div>
      </div>
    </div>
  );
}
function Row({ k, v }) { return <div className="flex items-center justify-between border-b border-slate-100 pb-1"><dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-800">{v}</dd></div>; }