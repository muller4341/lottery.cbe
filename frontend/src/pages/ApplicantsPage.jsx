// import { useEffect, useRef, useState } from 'react';
// import api from '../api/client';

// export default function ApplicantsPage() {
//   const [sites, setSites] = useState([]);
//   const [filterSite, setFilterSite] = useState('');
//   const [filterBed, setFilterBed] = useState('');
//   const [filterArea, setFilterArea] = useState('');
//   const [applicants, setApplicants] = useState([]);
//   const [summary, setSummary] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState('');
//   const fileRef = useRef();

//   async function load() {
//     const params = {};
//     if (filterSite) params.siteId = filterSite;
//     if (filterBed) params.bedType = filterBed;
//     if (filterArea) params.totalArea = filterArea;
//     const [list, sum] = await Promise.all([
//       api.get('/applicants', { params }),
//       api.get('/applicants/summary'),
//     ]);
//     setApplicants(list.data.applicants || []);
//     setSummary(sum.data.groups || []);
//   }

//   useEffect(() => {
//     api.get('/sites').then((r) => setSites(r.data.sites || []));
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => { load(); /* eslint-disable-next-line */ }, [filterSite, filterBed, filterArea]);

//   async function onUpload(e) {
//     e.preventDefault();
//     setError(''); setResult(null);
//     const file = fileRef.current?.files?.[0];
//     if (!file) return setError('Please choose an Excel file');
//     setUploading(true);
//     try {
//       const fd = new FormData();
//       fd.append('file', file);
//       const { data } = await api.post('/applicants/upload', fd, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       if (!data.ok) setError(data.message);
//       else setResult(data);
//       fileRef.current.value = '';
//       await load();
//     } catch (err) {
//       setError(err?.response?.data?.message || 'Upload failed');
//     } finally {
//       setUploading(false);
//     }
//   }

//   function downloadTemplate() {
//     const csv =
//       'employeeId,fullName,site,bedType,area\n' +
//       'EMP001,Abebe Kebede,German,1bed,74.5\n' +
//       'EMP002,Sara Tesfa,Girar,2bed,43.6\n' +
//       'EMP003,Daniel Mekonnen,Ayer-tena,3bed,54.6\n';
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url; a.download = 'applicants_template.csv'; a.click();
//     URL.revokeObjectURL(url);
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Applicants</h1>
//           <p className="text-sm text-slate-500">
//             Upload the applicant list (one row per employee, identified by Employee ID).
//           </p>
//         </div>
//         <button className="btn-secondary" onClick={downloadTemplate}>Download CSV template</button>
//       </div>

//       <div className="card p-5">
//         <h2 className="font-semibold text-slate-900 mb-3">Upload applicants (Excel/CSV)</h2>
//         <form onSubmit={onUpload} className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
//           <div className="flex-1">
//             <label className="label">Excel file (.xlsx)</label>
//             <input ref={fileRef} type="file" accept=".xlsx,.xls" className="input" />
//           </div>
//           <button type="submit" className="btn-primary md:w-auto" disabled={uploading}>
//             {uploading ? 'Uploading…' : 'Upload'}
//           </button>
//         </form>
//         <p className="mt-2 text-xs text-slate-500">
//           Expected columns: <code className="font-mono">employeeId, fullName, site, bedType, area</code>.
//           Each employee can apply only once — re-uploading an employee ID updates their preference.
//         </p>

//         {error && (
//           <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
//             {error}
//           </div>
//         )}
//         {result && (
//           <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
//             {result.message}
//             {result.errors?.length ? (
//               <ul className="list-disc pl-5 mt-1 text-xs text-emerald-800">
//                 {result.errors.slice(0, 10).map((e, i) => (
//                   <li key={i}>Row {e.row}: {e.error}</li>
//                 ))}
//                 {result.errors.length > 10 ? <li>… and {result.errors.length - 10} more</li> : null}
//               </ul>
//             ) : null}
//           </div>
//         )}
//       </div>

//       <div className="card p-5">
//         <h2 className="font-semibold text-slate-900 mb-3">Applicants by (site, bed type, area)</h2>
//         {summary.length === 0 ? (
//           <div className="py-8 text-center text-sm text-slate-500">No applicants uploaded yet.</div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="text-left text-slate-500 border-b">
//                   <th className="py-2 pr-4">Site</th>
//                   <th className="py-2 pr-4">Bed Type</th>
//                   <th className="py-2 pr-4">Area (m²)</th>
//                   <th className="py-2 pr-4 text-right">Applicants</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {summary.map((g) => (
//                   <tr key={`${g.siteId}-${g.bedType}-${g.totalArea}`} className="border-b last:border-0">
//                     <td className="py-2 pr-4">{g.siteName}</td>
//                     <td className="py-2 pr-4"><span className="badge-blue">{g.bedType}</span></td>
//                     <td className="py-2 pr-4">{g.totalArea}</td>
//                     <td className="py-2 pr-4 text-right tabular-nums font-medium">{g.count}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       <div className="card p-5">
//         <div className="flex items-center justify-between mb-3">
//           <h2 className="font-semibold text-slate-900">All applicants</h2>
//           <div className="flex gap-2">
//             <select className="input" value={filterSite} onChange={(e) => setFilterSite(e.target.value)}>
//               <option value="">All sites</option>
//               {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
//             </select>
//             <select className="input" value={filterBed} onChange={(e) => setFilterBed(e.target.value)}>
//               <option value="">All bed types</option>
//               <option value="1bed">1bed</option>
//               <option value="2bed">2bed</option>
//               <option value="3bed">3bed</option>
//             </select>
//             <input
//               className="input" type="number" step="0.1" placeholder="Area"
//               value={filterArea} onChange={(e) => setFilterArea(e.target.value)}
//             />
//           </div>
//         </div>

//         {applicants.length === 0 ? (
//           <div className="py-8 text-center text-sm text-slate-500">No applicants match the filter.</div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="text-left text-slate-500 border-b">
//                   <th className="py-2 pr-3">Employee ID</th>
//                   <th className="py-2 pr-3">Full Name</th>
//                   <th className="py-2 pr-3">Site</th>
//                   <th className="py-2 pr-3">Bed</th>
//                   <th className="py-2 pr-3">Area (m²)</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {applicants.map((a) => (
//                   <tr key={a.id} className="border-b last:border-0 hover:bg-slate-50">
//                     <td className="py-2 pr-3 font-mono">{a.employeeId}</td>
//                     <td className="py-2 pr-3">{a.fullName || '—'}</td>
//                     <td className="py-2 pr-3">{a.site.name}</td>
//                     <td className="py-2 pr-3"><span className="badge-blue">{a.bedType}</span></td>
//                     <td className="py-2 pr-3">{a.totalArea}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useEffect, useRef, useState } from 'react';
import api from '../api/client';

export default function ApplicantsPage() {
  const [sites, setSites] = useState([]);
  const [filterSite, setFilterSite] = useState('');
  const [filterBed, setFilterBed] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [summary, setSummary] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplicants, setTotalApplicants] = useState(0);

  async function load() {
    const params = { page, limit };
    if (filterSite) params.site = filterSite;
    if (filterBed) params.bedroom = filterBed;
    if (filterArea) params.area = filterArea;

    try {
      const [list, sum] = await Promise.all([
        api.get('/applicants', { params }),
        api.get('/applicants/summary'),
      ]);
      
      // Support backend pagination structure or fallback gracefully
      const receivedApplicants = list.data.applicants || [];
      setApplicants(receivedApplicants);
      setSummary(sum.data.groups || []);

      if (list.data.pagination) {
        setTotalPages(list.data.pagination.totalPages || 1);
        setTotalApplicants(list.data.pagination.total || 0);
      } else {
        // Fallback calculation if backend list returns unpaginated array
        setTotalApplicants(receivedApplicants.length);
        setTotalPages(Math.ceil(receivedApplicants.length / limit) || 1);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load applicants');
    }
  }

  useEffect(() => {
    // Collect unique sites dynamically from house options
    api.get('/houses/sites')
      .then((r) => setSites(r.data.sites || []))
      .catch(() => setSites([]));
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset page to 1 when any filters modify
  useEffect(() => {
    setPage(1);
  }, [filterSite, filterBed, filterArea]);

  useEffect(() => { 
    load(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterSite, filterBed, filterArea]);

  async function onUpload(e) {
    e.preventDefault();
    setError(''); setResult(null);
    const file = fileRef.current?.files?.[0];
    if (!file) return setError('Please choose an Excel file');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/applicants/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!data.ok) setError(data.message);
      else setResult(data);
      fileRef.current.value = '';
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function downloadTemplate() {
    const csv =
      'employeeId,fullName,site,bedroom,area\n' +
      'EMP001,Abebe Kebede,German,1,74.5\n' +
      'EMP002,Sara Tesfa,Girar,2,43.6\n' +
      'EMP003,Daniel Mekonnen,Ayer-tena,3,54.6\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'applicants_template.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applicants</h1>
          <p className="text-sm text-slate-500">
            Upload the applicant list (one row per employee, identified by Employee ID).
          </p>
        </div>
        <button className="btn-secondary" onClick={downloadTemplate}>Download CSV template</button>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 mb-3">Upload applicants (Excel/CSV)</h2>
        <form onSubmit={onUpload} className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
          <div className="flex-1">
            <label className="label">Excel file (.xlsx)</label>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="input" />
          </div>
          <button type="submit" className="btn-primary md:w-auto" disabled={uploading}>
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          Expected columns: <code className="font-mono">employeeId, fullName, site, bedroom, area</code>.
          Each employee can apply only once — re-uploading an employee ID updates their preference.
        </p>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {result && (
          <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
            {result.message}
            {result.errors?.length ? (
              <ul className="list-disc pl-5 mt-1 text-xs text-emerald-800">
                {result.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>Row {e.row}: {e.error}</li>
                ))}
                {result.errors.length > 10 ? <li>… and {result.errors.length - 10} more</li> : null}
              </ul>
            ) : null}
          </div>
        )}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 mb-3">Applicants by (site, bed type, area)</h2>
        {summary.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">No applicants uploaded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2 pr-4">Site</th>
                  <th className="py-2 pr-4">Bed Type</th>
                  <th className="py-2 pr-4">Area (m²)</th>
                  <th className="py-2 pr-4 text-right">Applicants</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((g, i) => (
                  <tr key={`${g.site}-${g.bedroom}-${g.area}-${i}`} className="border-b last:border-0">
                    <td className="py-2 pr-4">{g.site}</td>
                    <td className="py-2 pr-4"><span className="badge-blue">{g.bedroom} bed</span></td>
                    <td className="py-2 pr-4">{g.area}</td>
                    <td className="py-2 pr-4 text-right tabular-nums font-medium">{g.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-slate-900">All applicants</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalApplicants > 0 ? `${totalApplicants} applicants total · Page size: 20` : "No applicants yet"}
            </p>
          </div>
          <div className="flex gap-2">
            <select className="input" value={filterSite} onChange={(e) => setFilterSite(e.target.value)}>
              <option value="">All sites</option>
              {sites.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
            <select className="input" value={filterBed} onChange={(e) => setFilterBed(e.target.value)}>
              <option value="">All bed types</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
            <input
              className="input" type="text" placeholder="Area"
              value={filterArea} onChange={(e) => setFilterArea(e.target.value)}
            />
          </div>
        </div>

        {applicants.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">No applicants match the filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2 pr-3">Applicant ID</th>
                  <th className="py-2 pr-3">Full Name</th>
                  <th className="py-2 pr-3">Site</th>
                  <th className="py-2 pr-3">Bed Type</th>
                  <th className="py-2 pr-3">Area (m²)</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((a) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="py-2 pr-3 font-mono">{a.idCode}</td>
                    <td className="py-2 pr-3">{a.username || '—'}</td>
                    <td className="py-2 pr-3">{a.site}</td>
                    <td className="py-2 pr-3"><span className="badge-blue">{a.bedroom} bed</span></td>
                    <td className="py-2 pr-3">{a.area}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* === ORIGINAL BEAUTIFUL PAGINATION === */}
        {totalApplicants > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <span>
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {(page - 1) * limit + 1}
              </span>{" "}
              –{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(page * limit, totalApplicants)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">{totalApplicants}</span>{" "}
              applicants
            </span>

            <div className="flex items-center gap-1">
              <button className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
              <button className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Prev</button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-slate-400">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                        item === page ? "bg-[#95298E] text-white shadow-sm" : "btn-secondary"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next ›</button>
              <button className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}