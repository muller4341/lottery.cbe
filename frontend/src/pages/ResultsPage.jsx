// import { useEffect, useMemo, useState } from 'react';
// import { Link, useParams } from 'react-router-dom';
// import api from '../api/client';

// export default function ResultsPage() {
//   const { id } = useParams();
//   const [lotteries, setLotteries] = useState([]);
//   const [active, setActive] = useState(null); // array of results
//   const [tab, setTab] = useState('winners');

//   useEffect(() => {
//     (async () => {
//       try {
//         const { data } = await api.get('/lottery/lotteries');
//         setLotteries(data.lotteries || []);
//       } catch (err) {
//         console.error('Failed to load drawn runs list:', err);
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     if (!id) return;
//     (async () => {
//       try {
//         const { data } = await api.get(`/lottery/lotteries/${id}`);
//         setActive(data.results || []);
//         setTab('winners');
//       } catch (err) {
//         console.error('Failed to load active run details:', err);
//       }
//     })();
//   }, [id]);

//   const winners = useMemo(
//     () => (active || []).filter((r) => r.status === 'WINNER'),
//     [active]
//   );
//   const waitlist = useMemo(
//     () => (active || []).filter((r) => r.status === 'WAITLIST'),
//     [active]
//   );

//   // Extract common info from results payload for summary card rendering
//   const activeSummary = useMemo(() => {
//     if (!active || active.length === 0) return null;
//     const metadata = active[0];
//     const wCount = active.filter(r => r.status === 'WINNER').length;
//     const wlCount = active.filter(r => r.status === 'WAITLIST').length;
    
//     const houseCount = wCount; 

//     return {
//       siteName: metadata.site,
//       bedType: `${metadata.bedroom} Bed`,
//       totalArea: metadata.area,
//       drawnAt: metadata.drawDate,
//       totalHouses: houseCount,
//       totalApplicants: wCount + wlCount,
//       winnersCount: wCount,
//       waitlistCount: wlCount,
//     };
//   }, [active]);

//   if (!id) {
//     return (
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-slate-900">Results</h1>
//             <p className="text-sm text-slate-500">All previously drawn lotteries.</p>
//           </div>
//           <Link to="/lottery" className="btn text-white px-5 py-2.5 rounded-lg font-semibold" style={{ background: 'linear-gradient(135deg, #95298D 0%, #7D1E76 100%)', boxShadow: '0 4px 14px rgba(149,41,142,0.4)' }}>Start a new draw</Link>
//         </div>
//         <div className="card p-5">
//           {lotteries.length === 0 ? (
//             <div className="py-12 text-center text-sm text-slate-500">
//               No lotteries have been drawn yet.
//             </div>
//           ) : (
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="text-left text-slate-500 border-b">
//                   <th className="py-2 pr-3">Site</th>
//                   <th className="py-2 pr-3">Bed Type</th>
//                   <th className="py-2 pr-3">Area (m²)</th>
//                   <th className="py-2 pr-3">Drawn At</th>
//                   <th className="py-2 pr-3"></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {lotteries.map((l, idx) => (
//                   <tr key={l.id || idx} className="border-b last:border-0 hover:bg-slate-50">
//                     <td className="py-2 pr-3">{l.site}</td>
//                     <td className="py-2 pr-3"><span className="badge-blue">{l.bedroom} Bed</span></td>
//                     <td className="py-2 pr-3">{l.area}</td>
//                     <td className="py-2 pr-3 text-slate-500">{new Date(l.drawDate).toLocaleString()}</td>
//                     <td className="py-2 pr-3">
//                       <div className="flex gap-2 justify-end">
//                         <Link
//                           to={`/results/${l.lotteryRunId}`}
//                           className="btn text-white text-xs px-3 py-1.5 rounded-md"
//                           style={{ background: 'linear-gradient(135deg, #95298D 0%, #7D1E76 100%)', boxShadow: '0 2px 4px rgba(149,41,142,0.2)' }}
//                         >
//                           View
//                         </Link>
//                         <a
//                           className="btn text-white text-xs px-3 py-1.5 rounded-md"
//                           style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', boxShadow: '0 2px 4px rgba(16,185,129,0.2)' }}
//                           href={`/api/lottery/download/${l.lotteryRunId}`} // Fixed route matching backend
//                           target="_blank"
//                           rel="noreferrer"
//                           onClick={(e) => attachToken(e)}
//                         >
//                           Download
//                         </a>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     );
//   }

//   if (!activeSummary) {
//     return <div className="text-sm text-slate-500">Loading…</div>;
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-start justify-between">
//         <div>
//           <Link to="/results" className="text-sm text-brand-600 hover:underline">← All results</Link>
//           <h1 className="mt-1 text-2xl font-bold text-slate-900">
//             {activeSummary.siteName} · {activeSummary.bedType} · {activeSummary.totalArea} m²
//           </h1>
//           <p className="text-sm text-slate-500">
//             Drawn {new Date(activeSummary.drawnAt).toLocaleString()}
//           </p>
//         </div>
//         <a
//           className="btn text-white px-5 py-2.5 rounded-lg font-semibold"
//           style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16,185,129,0.4)' }}
//           href={`/api/lottery/download/${id}`} // Fixed route matching backend
//           target="_blank"
//           rel="noreferrer"
//           onClick={attachToken}
//         >
//           Download Excel
//         </a>
//       </div>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <KPI label="Total Houses" value={activeSummary.totalHouses} />
//         <KPI label="Total Applicants" value={activeSummary.totalApplicants} />
//         <KPI label="Winners" value={activeSummary.winnersCount} tone="emerald" />
//         <KPI label="Waitlist" value={activeSummary.waitlistCount} tone={activeSummary.waitlistCount > 0 ? 'amber' : 'slate'} />
//       </div>

//       <div className="card p-5">
//         <div className="flex border-b border-slate-200 mb-4">
//           <TabButton active={tab === 'winners'} onClick={() => setTab('winners')}>
//             Winners ({winners.length})
//           </TabButton>
//           <TabButton active={tab === 'waitlist'} onClick={() => setTab('waitlist')}>
//             Waitlist ({waitlist.length})
//           </TabButton>
//         </div>

//         {tab === 'winners' && (
//           <ResultsTable
//             rows={winners}
//             showHouse
//             emptyMessage="No winners for this lottery."
//           />
//         )}
//         {tab === 'waitlist' && (
//           <ResultsTable
//             rows={waitlist}
//             showHouse={false}
//             emptyMessage="No waitlist — all applicants got a house!"
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// function KPI({ label, value, tone = 'slate' }) {
//   const cls = {
//     slate: 'text-slate-900',
//     emerald: 'text-emerald-700',
//     amber: 'text-amber-700',
//   }[tone];
//   return (
//     <div className="card p-4">
//       <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
//       <div className={`mt-1 text-3xl font-bold tabular-nums ${cls}`}>{value}</div>
//     </div>
//   );
// }

// function TabButton({ active, onClick, children }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
//         active
//           ? 'border-brand-600 text-brand-700'
//           : 'border-transparent text-slate-500 hover:text-slate-800'
//       }`}
//     >
//       {children}
//     </button>
//   );
// }

// function ResultsTable({ rows, showHouse, emptyMessage }) {
//   if (rows.length === 0) {
//     return <div className="py-12 text-center text-sm text-slate-500">{emptyMessage}</div>;
//   }
//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full text-sm">
//         <thead>
//           <tr className="text-left text-slate-500 border-b">
//             <th className="py-2 pr-3 w-12">#</th>
//             <th className="py-2 pr-3">Applicant ID</th>
//             <th className="py-2 pr-3">Bed Type</th>
//             <th className="py-2 pr-3">Area (m²)</th>
//             <th className="py-2 pr-3">Block</th>
//             <th className="py-2 pr-3">Site</th>
//             {showHouse && (
//               <>
//                 <th className="py-2 pr-3">House Number</th>
//                 <th className="py-2 pr-3">Floor</th>
//               </>
//             )}
//           </tr>
//         </thead>
//         <tbody>
//           {rows.map((r, i) => (
//             <tr key={r.id || i} className="border-b last:border-0 hover:bg-slate-50">
//               <td className="py-2 pr-3 text-slate-500">{i + 1}</td>
//               <td className="py-2 pr-3 font-mono">{r.applicant?.idCode || '—'}</td>
//               <td className="py-2 pr-3">{r.bedroom || '—'} Bed</td>
//               <td className="py-2 pr-3">{r.area || '—'}</td>
//               <td className="py-2 pr-3">{r.block || '—'}</td>
//               <td className="py-2 pr-3">{r.site || '—'}</td>
//               {showHouse && (
//                 <>
//                   <td className="py-2 pr-3">{r.houseNumber || '—'}</td>
//                   <td className="py-2 pr-3">{r.floor ?? '—'}</td>
//                 </>
//               )}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// function attachToken(e) {
//   e.preventDefault();
//   let href = e.currentTarget.getAttribute('href');
  
//   // Force the fetch call to talk directly to your backend server port (5000)
//   if (href.startsWith('/api')) {
//     href = `http://localhost:5000${href}`;
//   }

//   const token = localStorage.getItem('token');
//   fetch(href, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
//     .then(async (r) => {
//       if (!r.ok) throw new Error('Download failed');
//       const blob = await r.blob();
//       const dispo = r.headers.get('Content-Disposition') || '';
//       const m = /filename="([^"]+)"/.exec(dispo);
//       const filename = m ? m[1] : 'lottery_result.xlsx';
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url; a.download = filename; a.click();
//       URL.revokeObjectURL(url);
//     })
//     .catch((err) => alert(err.message));
// }

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';

export default function ResultsPage() {
  const { id } = useParams();
  const [lotteries, setLotteries] = useState([]);
  const [active, setActive] = useState(null); 
  const [tab, setTab] = useState('winners');
  
  const [trueHouseCountPool, setTrueHouseCountPool] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/lottery/lotteries');
        setLotteries(data.lotteries || []);
      } catch (err) {
        console.error('Failed to load drawn runs list:', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [resultsRes, summaryRes] = await Promise.all([
          api.get(`/lottery/lotteries/${id}`),
          api.get('/houses/summary') // This already contains the absolute total pool count
        ]);

        const currentRunResults = resultsRes.data.results || [];
        setActive(currentRunResults);
        setTab('winners');

        if (currentRunResults.length > 0) {
          const sample = currentRunResults[0];
          const matchTargetBed = sample.bedroom;
          const matchTargetSite = sample.site;
          
          // Use 'area' consistently across configurations
          const matchTargetArea = String(sample.area || '').trim();

          const inventoryGroups = summaryRes.data.groups || [];
          const matchedCategory = inventoryGroups.find(
            (g) =>
              String(g.site).trim() === String(matchTargetSite).trim() &&
              Number(g.bedroom) === Number(matchTargetBed) &&
              String(g.area).trim() === matchTargetArea
          );

          const activeWinnersCount = currentRunResults.filter((r) => r.status === 'WINNER').length;

          if (matchedCategory) {
            // FIXED MATH: Since /houses/summary returns the full count, use it directly!
            setTrueHouseCountPool(matchedCategory.count);
          } else {
            setTrueHouseCountPool(activeWinnersCount);
          }
        }
      } catch (err) {
        console.error('Failed to load active run details:', err);
      }
    })();
  }, [id]);

  const winners = useMemo(
    () => (active || []).filter((r) => r.status === 'WINNER'),
    [active]
  );
  const waitlist = useMemo(
    () => (active || []).filter((r) => r.status === 'WAITLIST'),
    [active]
  );

  const activeSummary = useMemo(() => {
    if (!active || active.length === 0) return null;
    const metadata = active[0];
    const wCount = winners.length;
    const wlCount = waitlist.length;

    const poolHouses = trueHouseCountPool !== null ? trueHouseCountPool : wCount;
    const allocatedHouses = wCount;
    const remainingHouses = Math.max(0, poolHouses - wCount);

    return {
      siteName: metadata.site,
      subcity: metadata.subcity || '—', 
      bedType: `${metadata.bedroom} Bed`,
      totalArea: metadata.area, 
      drawnAt: metadata.drawDate,
      totalHouses: poolHouses,
      allocatedHouses: allocatedHouses,
      availableHouses: remainingHouses,
      totalApplicants: wCount + wlCount,
      winnersCount: wCount,
      waitlistCount: wlCount,
    };
  }, [active, trueHouseCountPool, winners, waitlist]);

  if (!id) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Results</h1>
            <p className="text-sm text-slate-500">All previously drawn lotteries.</p>
          </div>
          <Link to="/lottery" className="btn text-white px-5 py-2.5 rounded-lg font-semibold" style={{ background: 'linear-gradient(135deg, #95298D 0%, #7D1E76 100%)', boxShadow: '0 4px 14px rgba(149,41,142,0.4)' }}>Start a new draw</Link>
        </div>
        <div className="card p-5">
          {lotteries.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">No lotteries have been drawn yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2 pr-3">Site</th>
                  <th className="py-2 pr-3">Bed Type</th>
                  <th className="py-2 pr-3">Area (m²)</th>
                  <th className="py-2 pr-3">Drawn At</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {lotteries.map((l, idx) => (
                  <tr key={l.id || idx} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="py-2 pr-3 font-semibold text-slate-800">{l.site}</td>
                    <td className="py-2 pr-3"><span className="badge-blue">{l.bedroom} Bed</span></td>
                    <td className="py-2 pr-3 font-mono text-xs">{l.area}</td>
                    <td className="py-2 pr-3 text-slate-500">{new Date(l.drawDate).toLocaleString()}</td>
                    <td className="py-2 pr-3">
                      <div className="flex gap-2 justify-end">
                        <Link to={`/results/${l.lotteryRunId}`} className="btn text-white text-xs px-3 py-1.5 rounded-md" style={{ background: 'linear-gradient(135deg, #95298D 0%, #7D1E76 100%)', boxShadow: '0 2px 4px rgba(149,41,142,0.2)' }}>View</Link>
                        <button className="btn text-white text-xs px-3 py-1.5 rounded-md" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', boxShadow: '0 2px 4px rgba(16,185,129,0.2)' }} href={`/api/lottery/download/${l.lotteryRunId}`} onClick={(e) => handleDownload(e)}>Download</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  if (!activeSummary) {
    return <div className="text-sm text-slate-500">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link to="/results" className="text-sm text-purple-600 hover:underline">← All results</Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {activeSummary.siteName} ({activeSummary.subcity}) · {activeSummary.bedType} · {activeSummary.totalArea} m²
          </h1>
          <p className="text-sm text-slate-500">
            Drawn on {new Date(activeSummary.drawnAt).toLocaleString()}
          </p>
        </div>
        <button
          className="btn text-white px-5 py-2.5 rounded-lg font-semibold"
          style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16,185,129,0.4)' }}
          onClick={(e) => fakeHrefDownload(e, id)}
        >
          Download Excel
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPI label="Total Houses" value={activeSummary.totalHouses} />
        <KPI label="Available Houses" value={activeSummary.availableHouses} tone="blue" />
        <KPI label="Allocated Houses" value={activeSummary.allocatedHouses} tone="purple" />
        <KPI label="Total Applicants" value={activeSummary.totalApplicants} />
        <KPI label="Winners" value={activeSummary.winnersCount} tone="emerald" />
        <KPI label="Waitlist" value={activeSummary.waitlistCount} tone={activeSummary.waitlistCount > 0 ? 'amber' : 'slate'} />
      </div>

      <div className="card p-5">
        <div className="flex border-b border-slate-200 mb-4">
          <TabButton active={tab === 'winners'} onClick={() => setTab('winners')}>Winners ({winners.length})</TabButton>
          <TabButton active={tab === 'waitlist'} onClick={() => setTab('waitlist')}>Waitlist ({waitlist.length})</TabButton>
        </div>

        {tab === 'winners' && <ResultsTable rows={winners} showHouse emptyMessage="No winners for this lottery draw configuration." />}
        {tab === 'waitlist' && <ResultsTable rows={waitlist} showHouse={false} emptyMessage="No waitlist overflow records encountered." />}
      </div>
    </div>
  );
}

function KPI({ label, value, tone = 'slate' }) {
  const cls = { 
    slate: 'text-slate-900', 
    emerald: 'text-emerald-700', 
    amber: 'text-amber-700',
    blue: 'text-blue-700',
    purple: 'text-[#95298E]'
  }[tone];
  
  return (
    <div className="card p-4">
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
      <div className={`mt-1 text-3xl font-bold tabular-nums ${cls || 'text-slate-900'}`}>{value}</div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${active ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{children}</button>
  );
}

function ResultsTable({ rows, showHouse, emptyMessage }) {
  if (rows.length === 0) {
    return <div className="py-12 text-center text-sm text-slate-500">{emptyMessage}</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left whitespace-nowrap">
        <thead>
          <tr className="text-slate-500 border-b bg-slate-50/40">
            <th className="py-2.5 p-2 w-10">#</th>
            <th className="py-2.5 p-2">Applicant ID</th>
            <th className="py-2.5 p-2">Bed Type</th>
            <th className="py-2.5 p-2">Site </th>
            
            {showHouse && (
              <>
                <th className="py-2.5 p-2">Subcity</th>
                <th className="py-2.5 p-2">Block</th>
                <th className="py-2.5 p-2">House Number</th>
                <th className="py-2.5 p-2">Floor</th>
                <th className="py-2.5 p-2">Net (m²)</th>
                <th className="py-2.5 p-2">Prop. (m²)</th>
                <th className="py-2.5 p-2">Common (m²)</th>
                <th className="py-2.5 p-2">Total (m²)</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || i} className="border-b last:border-0 hover:bg-slate-50 font-medium text-slate-700">
              <td className="p-2 text-slate-400 tabular-nums">{i + 1}</td>
              <td className="p-2 font-mono text-slate-900 font-bold">{r.applicant?.idCode || '—'}</td>
              <td className="p-2"><span className="badge-blue">{r.bedroom || r.applicant?.bedroom || '—'} BR</span></td>
              <td className="p-2 font-semibold">{r.site || r.applicant?.site || '—'}</td>
              
              {showHouse && (
                <>
                  <td className="p-2 text-slate-600">{r.subcity || '—'}</td>
                  <td className="p-2 font-mono">{r.block || '—'}</td>
                  <td className="p-2 font-mono text-slate-800 font-bold">{r.houseNumber || '—'}</td>
                  <td className="p-2 tabular-nums">{r.floor ?? '—'}</td>
                  <td className="p-2 font-mono text-slate-500">{r.netarea || '—'}</td>
                  <td className="p-2 font-mono text-slate-500">{r.proportionalarea || '—'}</td>
                  <td className="p-2 font-mono text-slate-500">{r.commonarea || '—'}</td>
                  <td className="p-2 font-mono font-bold text-[#95298E]">{r.totalarea || r.area || '—'}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function handleDownload(e) {
  e.preventDefault();
  let href = e.currentTarget.getAttribute('href');
  if (href.startsWith('/api')) { href = `http://localhost:5000${href}`; }
  const token = localStorage.getItem('token');
  fetch(href, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    .then(async (r) => {
      if (!r.ok) throw new Error('Download execution failed');
      const blob = await r.blob();
      const dispo = r.headers.get('Content-Disposition') || '';
      const m = /filename="([^"]+)"/.exec(dispo);
      const filename = m ? m[1] : 'lottery_run_result.xlsx';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    }).catch((err) => alert(err.message));
}

function fakeHrefDownload(e, customId) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const url = `http://localhost:5000/api/lottery/download/${customId}`;
  fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    .then(async (r) => {
      if (!r.ok) throw new Error('Download process encountered an error');
      const blob = await r.blob();
      const urlObj = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlObj; a.download = 'CBE_Lottery_Result.xlsx'; a.click();
      URL.revokeObjectURL(urlObj);
    })
    .catch((err) => alert(err.message));
}