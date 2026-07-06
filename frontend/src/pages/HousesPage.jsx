
// import { useEffect, useMemo, useRef, useState } from "react";
// import api from "../api/client";

// export default function HousesPage() {
//   const [sites, setSites] = useState([]);
//   const [filterSite, setFilterSite] = useState("");
//   const [filterBed, setFilterBed] = useState("");
//   const [filterArea, setFilterArea] = useState("");
//   const [filterStatus, setFilterStatus] = useState("");
  
//   // Pagination states for all houses
//   const [page, setPage] = useState(1);
//   const [limit] = useState(20);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalHouses, setTotalHouses] = useState(0);

//   // Pagination states for inventory summary
//   const [summaryPage, setSummaryPage] = useState(1);
//   const summaryLimit = 20;

//   const [houses, setHouses] = useState([]);
//   const [summary, setSummary] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState("");
//   const fileRef = useRef();

//   async function load() {
//     const params = { page, limit };
    
//     if (filterSite) params.site = filterSite;
//     if (filterBed) params.bedroom = filterBed;
//     if (filterArea) params.area = filterArea;
//     if (filterStatus) params.status = filterStatus;

//     try {
//       const [list, sum] = await Promise.all([
//         api.get("/houses", { params }),
//         api.get("/houses/summary"),
//       ]);

//       let receivedHouses = list.data.houses || [];
//       setSummary(sum.data.groups || []);

//       if (list.data.pagination) {
//         setHouses(receivedHouses);
//         setTotalPages(list.data.pagination.totalPages || 1);
//         setTotalHouses(list.data.pagination.total || 0);
//       } else {
//         // Fallback client-side pagination for main list if API lacks it
//         setTotalHouses(receivedHouses.length);
//         setTotalPages(Math.ceil(receivedHouses.length / limit) || 1);
//         const offset = (page - 1) * limit;
//         setHouses(receivedHouses.slice(offset, offset + limit));
//       }
//     } catch (err) {
//       setError(err?.response?.data?.message || "Failed to load houses");
//     }
//   }

//   // Load unique sites for filter
//   useEffect(() => {
//     api.get("/houses/sites")
//       .then((r) => setSites(r.data.sites || []))
//       .catch(() => setSites([]));
//   }, []);

//   // Dynamic Backend Data Extraction Hooks for Filter Dropdowns
//   const dynamicBedTypes = useMemo(() => {
//     // If a site filter is active, only show bed types that exist at that site
//     const relevantRows = filterSite ? summary.filter(g => g.site === filterSite) : summary;
//     const uniqueBeds = [...new Set(relevantRows.map(g => String(g.bedroom)))];
//     return uniqueBeds.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
//   }, [summary, filterSite]);

//   const dynamicAreas = useMemo(() => {
//     // Cascading Filter: Only display real area configurations matching active selections above
//     let relevantRows = summary;
//     if (filterSite) relevantRows = relevantRows.filter(g => g.site === filterSite);
//     if (filterBed) relevantRows = relevantRows.filter(g => String(g.bedroom) === filterBed);
    
//     const uniqueAreas = [...new Set(relevantRows.map(g => String(g.area).trim()))];
//     return uniqueAreas.sort((a, b) => parseFloat(a) - parseFloat(b));
//   }, [summary, filterSite, filterBed]);

//   // Reset dependent fields down the stream if a parent selection changes
//   useEffect(() => {
//     setPage(1);
//     setSummaryPage(1);
//   }, [filterSite, filterBed, filterArea, filterStatus]);

//   // Load data
//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page, filterSite, filterBed, filterArea, filterStatus]);

//   async function onUpload(e) {
//     e.preventDefault();
//     setError("");
//     setResult(null);
//     const file = fileRef.current?.files?.[0];
//     if (!file) return setError("Please choose an Excel file");
    
//     setUploading(true);
//     try {
//       const fd = new FormData();
//       fd.append("file", file);
//       const { data } = await api.post("/houses/upload", fd, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
      
//       if (!data.ok) setError(data.message);
//       else setResult(data);
      
//       fileRef.current.value = "";
//       await load();
//     } catch (err) {
//       setError(err?.response?.data?.message || "Upload failed");
//     } finally {
//       setUploading(false);
//     }
//   }

//   async function downloadTemplate() {
//     const csv =
//       "site,block,house,floor,bedType,area\n" +
//       "German,A1,101,1,1bed,74.5\n" +
//       "German,A1,102,1,2bed,92.0\n" +
//       "Girar,B2,201,2,3bed,125.0\n" +
//       "Ayer-Tena,C3,301,3,Studio,48.5\n" +
//       "New-Site,D4,401,4,Penthouse,180.0\n";

//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "houses_template.csv";
//     a.click();
//     URL.revokeObjectURL(url);
//   }

//   // Slice summary data based on summary pagination state
//   const totalSummaryPages = Math.ceil(summary.length / summaryLimit) || 1;
//   const summaryOffset = (summaryPage - 1) * summaryLimit;
//   const paginatedSummary = summary.slice(summaryOffset, summaryOffset + summaryLimit);

//   return (
//     <div className="space-y-6">
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Houses</h1>
//           <p className="text-sm text-slate-500">
//             Upload the apartment inventory. Each row represents one available house.
//           </p>
//         </div>
//         <button
//           className="btn-secondary bg-black text-white"
//           onClick={downloadTemplate}
//         >
//           Download CSV template
//         </button>
//       </div>

//       {/* Upload Section */}
//       <div className="card p-5">
//         <h2 className="font-semibold text-slate-900 mb-3">Upload houses (Excel/CSV)</h2>
//         <form onSubmit={onUpload} className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
//           <div className="flex-1">
//             <label className="label">Excel file (.xlsx)</label>
//             <input ref={fileRef} type="file" accept=".xlsx,.xls" className="input" />
//           </div>
//           <button type="submit" className="btn-primary md:w-auto" disabled={uploading}>
//             {uploading ? "Uploading…" : "Upload"}
//           </button>
//         </form>
//         <p className="mt-2 text-xs text-slate-500">
//           Expected columns (any casing):{" "}
//           <code className="font-mono">site, block, house, floor, bedType, area</code>
//           . Both <code className="font-mono">site</code> and <code className="font-mono">bedType</code> are fully dynamic.
//         </p>

//         {error && <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
//         {result && (
//           <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
//             {result.message}
//             {result.errors?.length && (
//               <ul className="list-disc pl-5 mt-1 text-xs text-emerald-800">
//                 {result.errors.slice(0, 10).map((e, i) => (
//                   <li key={i}>Row {e.row}: {e.error}</li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Summary Section with Added Pagination */}
//       <div className="card p-5">
//         <div className="flex items-center justify-between mb-3">
//           <div>
//             <h2 className="font-semibold text-slate-900">Inventory by (site, bed type, area)</h2>
//             <p className="text-xs text-slate-500 mt-0.5">
//               {summary.length > 0 ? `${summary.length} categories total · Page size: 20` : "No summary view available"}
//             </p>
//           </div>
//         </div>
//         {summary.length === 0 ? (
//           <div className="py-8 text-center text-sm text-slate-500">No houses uploaded yet.</div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="text-left text-slate-500 border-b">
//                     <th className="py-2 pr-4">Site</th>
//                     <th className="py-2 pr-4">Bed Type</th>
//                     <th className="py-2 pr-4">Area (m²)</th>
//                     <th className="py-2 pr-4 text-right">Houses</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginatedSummary.map((g, i) => (
//                     <tr key={i} className="border-b last:border-0">
//                       <td className="py-2 pr-4">{g.site}</td>
//                       <td className="py-2 pr-4"><span className="badge-blue">{g.bedroom} bed</span></td>
//                       <td className="py-2 pr-4">{g.area}</td>
//                       <td className="py-2 pr-4 text-right tabular-nums font-medium">{g.count}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination for Summary Table */}
//             {summary.length > 0 && (
//               <div className="mt-4 pt-4 border-t border-slate-100 flex flex-row items-center justify-between gap-4 text-sm text-slate-500">
//                 <span>
//                   Showing{" "}
//                   <span className="font-semibold text-slate-700">
//                     {(summaryPage - 1) * summaryLimit + 1}
//                   </span>{" "}
//                   –{" "}
//                   <span className="font-semibold text-slate-700">
//                     {Math.min(summaryPage * summaryLimit, summary.length)}
//                   </span>{" "}
//                   of{" "}
//                   <span className="font-semibold text-slate-700">{summary.length}</span>{" "}
//                   categories
//                 </span>

//                 <div className="flex items-center gap-1">
//                   <button className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40" disabled={summaryPage <= 1} onClick={() => setSummaryPage(1)}>«</button>
//                   <button className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40" disabled={summaryPage <= 1} onClick={() => setSummaryPage(summaryPage - 1)}>‹ Prev</button>

//                   {Array.from({ length: totalSummaryPages }, (_, i) => i + 1)
//                     .filter(p => p === 1 || p === totalSummaryPages || Math.abs(p - summaryPage) <= 2)
//                     .reduce((acc, p, idx, arr) => {
//                       if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
//                       acc.push(p);
//                       return acc;
//                     }, [])
//                     .map((item, i) =>
//                       item === "..." ? (
//                         <span key={`summary-ellipsis-${i}`} className="px-1 text-slate-400">…</span>
//                       ) : (
//                         <button
//                           key={`summary-page-${item}`}
//                           onClick={() => setSummaryPage(item)}
//                           className={`py-1.5 px-3 rounded text-xs font-medium transition-colors ${
//                             item === summaryPage ? "bg-[#95298E] text-white shadow-sm" : "btn-secondary"
//                           }`}
//                         >
//                           {item}
//                         </button>
//                       )
//                     )}

//                   <button className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40" disabled={summaryPage >= totalSummaryPages} onClick={() => setSummaryPage(summaryPage + 1)}>Next ›</button>
//                   <button className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40" disabled={summaryPage >= totalSummaryPages} onClick={() => setSummaryPage(totalSummaryPages)}>»</button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Main Houses Table */}
//       <div className="card p-5">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <h2 className="font-semibold text-slate-900">All Houses</h2>
//             <p className="text-xs text-slate-500 mt-0.5">
//               {totalHouses > 0 ? `${totalHouses} houses total · Page size: 20` : "No houses yet"}
//             </p>
//           </div>
//         </div>

//         {/* Dynamic Dropdown Filters Context */}
//         <div className="flex flex-row flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
//           <select className="input flex-1 min-w-[130px]" value={filterSite} onChange={(e) => { setFilterSite(e.target.value); setFilterBed(""); setFilterArea(""); }}>
//             <option value="">All sites</option>
//             {sites.map((s, i) => (
//               <option key={i} value={s}>{s}</option>
//             ))}
//           </select>

//           <select className="input flex-1 min-w-[130px]" value={filterBed} onChange={(e) => { setFilterBed(e.target.value); setFilterArea(""); }} disabled={!filterSite && summary.length === 0}>
//             <option value="">All bed types</option>
//             {dynamicBedTypes.map((type, i) => (
//               <option key={i} value={type}>{type} Bed</option>
//             ))}
//           </select>

//           <select className="input flex-1 min-w-[130px]" value={filterArea} onChange={(e) => setFilterArea(e.target.value)} disabled={!filterBed && dynamicAreas.length === 0}>
//             <option value="">All areas</option>
//             {dynamicAreas.map((a, i) => (
//               <option key={i} value={a}>{a} m²</option>
//             ))}
//           </select>

//           <select className="input flex-1 min-w-[130px]" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
//             <option value="">All statuses</option>
//             <option value="NONE">Available</option>
//             <option value="PROVIDED">Allocated</option>
//           </select>

//           {(filterSite || filterBed || filterArea || filterStatus) && (
//             <button className="btn-secondary text-xs px-3 py-2 whitespace-nowrap" onClick={() => {
//               setFilterSite(""); setFilterBed(""); setFilterArea(""); setFilterStatus("");
//             }}>
//               Clear filters
//             </button>
//           )}
//         </div>

//         {/* Table View */}
//         {houses.length === 0 ? (
//           <div className="py-8 text-center text-sm text-slate-500">No houses match the selected filters.</div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="text-left text-slate-500 border-b">
//                   <th className="py-2 pr-3">Site</th>
//                   <th className="py-2 pr-3">Block</th>
//                   <th className="py-2 pr-3">House Number</th>
//                   <th className="py-2 pr-3">Floor</th>
//                   <th className="py-2 pr-3">Bed Type</th>
//                   <th className="py-2 pr-3">Area (m²)</th>
//                   <th className="py-2 pr-3">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {houses.map((h) => (
//                   <tr key={h.id} className="border-b last:border-0 hover:bg-slate-50">
//                     <td className="py-2 pr-3">{h.site}</td>
//                     <td className="py-2 pr-3">{h.block}</td>
//                     <td className="py-2 pr-3">{h.houseNumber}</td>
//                     <td className="py-2 pr-3">{h.floor}</td>
//                     <td className="py-2 pr-3"><span className="badge-blue">{h.bedroom} bed</span></td>
//                     <td className="py-2 pr-3">{h.area}</td>
//                     <td className="py-2 pr-3">
//                       {h.status === "PROVIDED" ? (
//                         <span className="badge-amber">Allocated</span>
//                       ) : (
//                         <span className="badge-green">Available</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Table Pagination Component */}
//         {totalHouses > 0 && (
//           <div className="mt-4 pt-4 border-t border-slate-100 flex flex-row items-center justify-between gap-4 text-sm text-slate-500">
//             <span>
//               Showing{" "}
//               <span className="font-semibold text-slate-700">
//                 {(page - 1) * limit + 1}
//               </span>{" "}
//               –{" "}
//               <span className="font-semibold text-slate-700">
//                 {Math.min(page * limit, totalHouses)}
//               </span>{" "}
//               of{" "}
//               <span className="font-semibold text-slate-700">{totalHouses}</span>{" "}
//               houses
//             </span>

//             <div className="flex items-center gap-1">
//               <button className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
//               <button className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Prev</button>

//               {Array.from({ length: totalPages }, (_, i) => i + 1)
//                 .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
//                 .reduce((acc, p, idx, arr) => {
//                   if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
//                   acc.push(p);
//                   return acc;
//                 }, [])
//                 .map((item, i) =>
//                   item === "..." ? (
//                     <span key={`ellipsis-${i}`} className="px-1 text-slate-400">…</span>
//                   ) : (
//                     <button
//                       key={item}
//                       onClick={() => setPage(item)}
//                       className={`py-1.5 px-3 rounded text-xs font-medium transition-colors ${
//                         item === page ? "bg-[#95298E] text-white shadow-sm" : "btn-secondary"
//                       }`}
//                     >
//                       {item}
//                     </button>
//                   )
//                 )}

//               <button className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next ›</button>
//               <button className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/client";

export default function HousesPage() {
  const [sites, setSites] = useState([]);
  const [filterSite, setFilterSite] = useState("");
  const [filterBed, setFilterBed] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  // Pagination states for all houses
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHouses, setTotalHouses] = useState(0);

  // Pagination states for inventory summary
  const [summaryPage, setSummaryPage] = useState(1);
  const summaryLimit = 20;

  const [houses, setHouses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef();

  async function load() {
    const params = { page, limit };
    
    if (filterSite) params.site = filterSite;
    if (filterBed) params.bedroom = filterBed;
    if (filterArea) params.area = filterArea;
    if (filterStatus) params.status = filterStatus;

    try {
      const [list, sum] = await Promise.all([
        api.get("/houses", { params }),
        api.get("/houses/summary"),
      ]);

      let receivedHouses = list.data.houses || [];
      setSummary(sum.data.groups || []);

      if (list.data.pagination) {
        setHouses(receivedHouses);
        setTotalPages(list.data.pagination.totalPages || 1);
        setTotalHouses(list.data.pagination.total || 0);
      } else {
        // Fallback client-side pagination for main list if API lacks it
        setTotalHouses(receivedHouses.length);
        setTotalPages(Math.ceil(receivedHouses.length / limit) || 1);
        const offset = (page - 1) * limit;
        setHouses(receivedHouses.slice(offset, offset + limit));
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load houses");
    }
  }

  // Load unique sites for filter
  useEffect(() => {
    api.get("/houses/sites")
      .then((r) => setSites(r.data.sites || []))
      .catch(() => setSites([]));
  }, []);

  // Dynamic Backend Data Extraction Hooks for Filter Dropdowns
  const dynamicBedTypes = useMemo(() => {
    const relevantRows = filterSite ? summary.filter(g => g.site === filterSite) : summary;
    const uniqueBeds = [...new Set(relevantRows.map(g => String(g.bedroom)))];
    return uniqueBeds.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }, [summary, filterSite]);

  const dynamicAreas = useMemo(() => {
    let relevantRows = summary;
    if (filterSite) relevantRows = relevantRows.filter(g => g.site === filterSite);
    if (filterBed) relevantRows = relevantRows.filter(g => String(g.bedroom) === filterBed);
    
    const uniqueAreas = [...new Set(relevantRows.map(g => String(g.area).trim()))];
    return uniqueAreas.sort((a, b) => parseFloat(a) - parseFloat(b));
  }, [summary, filterSite, filterBed]);

  // Reset dependent fields down the stream if a parent selection changes
  useEffect(() => {
    setPage(1);
    setSummaryPage(1);
  }, [filterSite, filterBed, filterArea, filterStatus]);

  // Load data
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterSite, filterBed, filterArea, filterStatus]);

  async function onUpload(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    const file = fileRef.current?.files?.[0];
    if (!file) return setError("Please choose an Excel file");
    
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/houses/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (!data.ok) setError(data.message);
      else setResult(data);
      
      fileRef.current.value = "";
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function downloadTemplate() {
    const csv =
      "site,block,house,floor,bedType,area\n" +
      "German,A1,101,1,1bed,74.5\n" +
      "German,A1,102,1,2bed,92.0\n" +
      "Girar,B2,201,2,3bed,125.0\n" +
      "Ayer-Tena,C3,301,3,Studio,48.5\n" +
      "New-Site,D4,401,4,Penthouse,180.0\n";

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "houses_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Slice summary data based on summary pagination state
  const totalSummaryPages = Math.ceil(summary.length / summaryLimit) || 1;
  const summaryOffset = (summaryPage - 1) * summaryLimit;
  const paginatedSummary = summary.slice(summaryOffset, summaryOffset + summaryLimit);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Houses</h1>
          <p className="text-sm text-slate-500">
            Upload the apartment inventory. Each row represents one available house.
          </p>
        </div>
        <button
          className="btn-secondary bg-black text-white"
          onClick={downloadTemplate}
        >
          Download CSV template
        </button>
      </div>

      {/* Upload Section */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 mb-3">Upload houses (Excel/CSV)</h2>
        <form onSubmit={onUpload} className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
          <div className="flex-1">
            <label className="label">Excel file (.xlsx)</label>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="input" />
          </div>
          <button type="submit" className="btn-primary md:w-auto" disabled={uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          Expected columns (any casing):{" "}
          <code className="font-mono">site, block, house, floor, bedType, area</code>
          . Both <code className="font-mono">site</code> and <code className="font-mono">bedType</code> are fully dynamic.
        </p>

        {error && <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
        {result && (
          <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
            {result.message}
            {result.errors?.length && (
              <ul className="list-disc pl-5 mt-1 text-xs text-emerald-800">
                {result.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>Row {e.row}: {e.error}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Summary Section with Your Preferred Beautiful Pagination */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-slate-900">Inventory by (site, bed type, area)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {summary.length > 0 ? `${summary.length} categories total · Page size: 20` : "No summary view available"}
            </p>
          </div>
        </div>
        {summary.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">No houses uploaded yet.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-4">Site</th>
                    <th className="py-2 pr-4">Bed Type</th>
                    <th className="py-2 pr-4">Area (m²)</th>
                    <th className="py-2 pr-4 text-right">Houses</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSummary.map((g, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-4">{g.site}</td>
                      <td className="py-2 pr-4"><span className="badge-blue">{g.bedroom} bed</span></td>
                      <td className="py-2 pr-4">{g.area}</td>
                      <td className="py-2 pr-4 text-right tabular-nums font-medium">{g.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Beautiful Page Selectors for Summary */}
            {summary.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-row items-center justify-between gap-4 text-sm text-slate-500">
                <span>
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {(summaryPage - 1) * summaryLimit + 1}
                  </span>{" "}
                  –{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(summaryPage * summaryLimit, summary.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">{summary.length}</span>{" "}
                  categories
                </span>

                <div className="flex items-center gap-1">
                  <button className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40" disabled={summaryPage <= 1} onClick={() => setSummaryPage(1)}>«</button>
                  <button className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40" disabled={summaryPage <= 1} onClick={() => setSummaryPage(summaryPage - 1)}>‹ Prev</button>

                  {Array.from({ length: totalSummaryPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalSummaryPages || Math.abs(p - summaryPage) <= 2)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, i) =>
                      item === "..." ? (
                        <span key={`summary-ellipsis-${i}`} className="px-1 text-slate-400">…</span>
                      ) : (
                        <button
                          key={`summary-page-${item}`}
                          onClick={() => setSummaryPage(item)}
                          className={`py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                            item === summaryPage ? "bg-[#95298E] text-white shadow-sm" : "btn-secondary"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40" disabled={summaryPage >= totalSummaryPages} onClick={() => setSummaryPage(summaryPage + 1)}>Next ›</button>
                  <button className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40" disabled={summaryPage >= totalSummaryPages} onClick={() => setSummaryPage(totalSummaryPages)}>»</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Houses Table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-900">All Houses</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalHouses > 0 ? `${totalHouses} houses total · Page size: 20` : "No houses yet"}
            </p>
          </div>
        </div>

        {/* Dynamic Dropdown Filters Context */}
        <div className="flex flex-row flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <select className="input flex-1 min-w-[130px]" value={filterSite} onChange={(e) => { setFilterSite(e.target.value); setFilterBed(""); setFilterArea(""); }}>
            <option value="">All sites</option>
            {sites.map((s, i) => (
              <option key={i} value={s}>{s}</option>
            ))}
          </select>

          <select className="input flex-1 min-w-[130px]" value={filterBed} onChange={(e) => { setFilterBed(e.target.value); setFilterArea(""); }} disabled={!filterSite && summary.length === 0}>
            <option value="">All bed types</option>
            {dynamicBedTypes.map((type, i) => (
              <option key={i} value={type}>{type} Bed</option>
            ))}
          </select>

          <select className="input flex-1 min-w-[130px]" value={filterArea} onChange={(e) => setFilterArea(e.target.value)} disabled={!filterBed && dynamicAreas.length === 0}>
            <option value="">All areas</option>
            {dynamicAreas.map((a, i) => (
              <option key={i} value={a}>{a} m²</option>
            ))}
          </select>

          <select className="input flex-1 min-w-[130px]" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="NONE">Available</option>
            <option value="PROVIDED">Allocated</option>
          </select>

          {(filterSite || filterBed || filterArea || filterStatus) && (
            <button className="btn-secondary text-xs px-3 py-2 whitespace-nowrap" onClick={() => {
              setFilterSite(""); setFilterBed(""); setFilterArea(""); setFilterStatus("");
            }}>
              Clear filters
            </button>
          )}
        </div>

        {/* Table View */}
        {houses.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">No houses match the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2 pr-3">Site</th>
                  <th className="py-2 pr-3">Block</th>
                  <th className="py-2 pr-3">House Number</th>
                  <th className="py-2 pr-3">Floor</th>
                  <th className="py-2 pr-3">Bed Type</th>
                  <th className="py-2 pr-3">Area (m²)</th>
                  <th className="py-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {houses.map((h) => (
                  <tr key={h.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="py-2 pr-3">{h.site}</td>
                    <td className="py-2 pr-3">{h.block}</td>
                    <td className="py-2 pr-3">{h.houseNumber}</td>
                    <td className="py-2 pr-3">{h.floor}</td>
                    <td className="py-2 pr-3"><span className="badge-blue">{h.bedroom} bed</span></td>
                    <td className="py-2 pr-3">{h.area}</td>
                    <td className="py-2 pr-3">
                      {h.status === "PROVIDED" ? (
                        <span className="badge-amber">Allocated</span>
                      ) : (
                        <span className="badge-green">Available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination Component */}
        {totalHouses > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <span>
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {(page - 1) * limit + 1}
              </span>{" "}
              –{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(page * limit, totalHouses)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">{totalHouses}</span>{" "}
              houses
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