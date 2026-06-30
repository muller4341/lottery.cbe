
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
  const [block, setBlock] = useState('');

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
        const [s, unallocatedHousesRes, ag, lr] = await Promise.all([
          api.get('/houses/sites'),
          api.get('/lottery/unallocated-summary'),
          api.get('/applicants/summary'),
          api.get('/lottery/lotteries'),
        ]);
        setSites(s.data.sites || []);
        setHouseGroups(unallocatedHousesRes.data.groups || []);
        setApplicantGroups(ag.data.groups || []);
        setLotteries(lr.data.lotteries || []);
      } catch (e) {
        console.error("Failed to load initial metrics scope", e);
      }
    })();
  }, []);

  // 1. Strict Filter Flow: Sites that have unallocated/available houses
  const availableSites = useMemo(() => {
    const activeSites = new Set(houseGroups.filter((g) => g.count > 0).map((g) => g.site));
    return sites.filter((s) => activeSites.has(s));
  }, [sites, houseGroups]);

  // 2. Strict Filter Flow: ONLY show bed types that have available houses for the selected site
  const availableBedTypes = useMemo(() => {
    if (!siteId) return [];
    const filtered = houseGroups.filter((g) => g.site === siteId && g.count > 0);
    return [...new Set(filtered.map((g) => String(g.bedroom)))];
  }, [siteId, houseGroups]);

  // 3. Strict Filter Flow: ONLY show areas that have available houses for the selected site + bed type
  const availableAreas = useMemo(() => {
    if (!siteId || !bedType) return [];
    const filtered = houseGroups.filter(
      (g) => g.site === siteId && String(g.bedroom) === bedType && g.count > 0
    );
    return [...new Set(filtered.map((g) => g.area))].sort((a, b) => parseFloat(a) - parseFloat(b));
  }, [siteId, bedType, houseGroups]);

  // Track historically drawn keys to identify how many applicants have already been locked into a result status
  const drawnKeys = useMemo(() => {
    return new Set(lotteries.map((l) => `${l.site}|${l.bedroom}|${l.area}`));
  }, [lotteries]);

  const preview = useMemo(() => {
    if (!siteId || !bedType || !totalArea) return null;
    
    const houses = houseGroups.find(
      (g) => g.site === siteId && String(g.bedroom) === bedType && g.area === totalArea
    );
    const applicants = applicantGroups.find(
      (g) => g.site === siteId && String(g.bedroom) === bedType && g.area === totalArea
    );

    const houseCount = houses?.count || 0;
    let appCount = applicants?.count || 0;

    // Fixed: If a lottery was already drawn for this exact criteria combination, 
    // the remaining available unallocated applicant pool count becomes 0 because they are no longer "NONE"
    if (drawnKeys.has(`${siteId}|${bedType}|${totalArea}`)) {
      appCount = 0;
    }

    const winners = Math.min(houseCount, appCount);
    const waitlist = Math.max(0, appCount - houseCount);
    return { houseCount, appCount, winners, waitlist };
  }, [siteId, bedType, totalArea, houseGroups, applicantGroups, drawnKeys]);

  async function runDraw() {
    setErr(''); setSummary(null); setDrawing(true);
    setDrawSummary(null); setDrawWinners([]); setDrawApplicants([]); setDrawResults([]);

    const uniqueRunId = `RUN-${Date.now()}`;

    try {
      const applicantsRes = await api.get('/applicants', {
        params: { site: siteId, bedroom: Number(bedType), area: totalArea },
      });
      const allApplicants = applicantsRes.data.applicants || [];
      // Only stream applicants whose current structural state status remains 'NONE' to the UI animation player
      const validNoneApplicants = allApplicants.filter(a => !a.status || a.status === 'NONE');
      setDrawApplicants(validNoneApplicants);

      const { data } = await api.post('/lottery/draw', {
        site: siteId,
        bedroom: Number(bedType),
        area: totalArea,
        block:block,
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

      const [unallocatedHousesRes, ag, lr] = await Promise.all([
        api.get('/lottery/unallocated-summary'),
        api.get('/applicants/summary'),
        api.get('/lottery/lotteries'),
      ]);
      setHouseGroups(unallocatedHousesRes.data.groups || []);
      setApplicantGroups(ag.data.groups || []);
      setLotteries(lr.data.lotteries || []);

      setSiteId(''); setBedType(''); setTotalArea('');

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
          Pick a single (site, bed type, area) combination and draw the lottery. Only unallocated houses are listed.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <h2 className="font-semibold text-slate-999 mb-4">Filter & Draw</h2>
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
                  <option key={i} value={type}>{type} Bed</option>
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
                  <option key={i} value={a}>{a} m²</option>
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
            ) : preview.appCount === 0 ? (
              <div className="mt-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                ⚠️ There is no applicant for this house detail.
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
                drawing || !siteId || !bedType || !totalArea || !preview || preview.houseCount === 0 || preview.appCount === 0
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