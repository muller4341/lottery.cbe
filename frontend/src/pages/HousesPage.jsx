import { useEffect, useRef, useState } from "react";
import api from "../api/client";

export default function HousesPage() {
  const [sites, setSites] = useState([]);
  const [filterSite, setFilterSite] = useState("");
  const [filterBed, setFilterBed] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHouses, setTotalHouses] = useState(0);

  const [houses, setHouses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef();

  async function load() {
    const params = {
      page,
      limit,
    };
    if (filterSite) params.siteId = filterSite;
    if (filterBed) params.bedType = filterBed;
    if (filterArea) params.totalArea = filterArea;
    if (filterStatus) params.status = filterStatus;

    try {
      const [list, sum] = await Promise.all([
        api.get("/houses", { params }),
        api.get("/houses/summary"),
      ]);
      setHouses(list.data.houses || []);
      setSummary(sum.data.groups || []);
      if (list.data.pagination) {
        setTotalPages(list.data.pagination.totalPages || 1);
        setTotalHouses(list.data.pagination.total || 0);
      } else {
        setTotalPages(1);
        setTotalHouses(list.data.houses?.length || 0);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load houses");
    }
  }

  useEffect(() => {
    api.get("/sites").then((r) => setSites(r.data.sites || []));
  }, []);

  // When filters change, reset page to 1
  useEffect(() => {
    setPage(1);
  }, [filterSite, filterBed, filterArea, filterStatus]);

  // Load when page, limit, or any filter changes
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filterSite, filterBed, filterArea, filterStatus]);

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
      "German,A1,102,1,1bed,74.5\n" +
      "Girar,B2,201,2,2bed,43.6\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "houses_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Houses</h1>
          <p className="text-sm text-slate-500">
            Upload the apartment inventory. Each row represents one available
            house.
          </p>
        </div>
        <button
          className="btn-secondary bg-black text-white"
          onClick={downloadTemplate}
        >
          Download CSV template
        </button>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 mb-3">
          Upload houses (Excel/CSV)
        </h2>
        <form
          onSubmit={onUpload}
          className="flex flex-col md:flex-row gap-3 items-stretch md:items-end"
        >
          <div className="flex-1">
            <label className="label">Excel file (.xlsx)</label>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="input"
            />
          </div>
          <button
            type="submit"
            className="btn-primary md:w-auto"
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          Expected columns (any casing):{" "}
          <code className="font-mono">
            site, block, house, floor, bedType, area
          </code>
          . bedType must be one of{" "}
          <code className="font-mono">1bed / 2bed / 3bed</code>. Site must be
          one of <code className="font-mono">German, Ayer-tena, Girar</code>.
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
                  <li key={i}>
                    Row {e.row}: {e.error}
                  </li>
                ))}
                {result.errors.length > 10 ? (
                  <li>… and {result.errors.length - 10} more</li>
                ) : null}
              </ul>
            ) : null}
          </div>
        )}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 mb-3">
          Inventory by (site, bed type, area)
        </h2>
        {summary.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No houses uploaded yet.
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
                </tr>
              </thead>
              <tbody>
                {summary.map((g) => (
                  <tr
                    key={`${g.siteId}-${g.bedType}-${g.totalArea}`}
                    className="border-b last:border-0"
                  >
                    <td className="py-2 pr-4">{g.siteName}</td>
                    <td className="py-2 pr-4">
                      <span className="badge-blue">{g.bedType}</span>
                    </td>
                    <td className="py-2 pr-4">{g.totalArea}</td>
                    <td className="py-2 pr-4 text-right tabular-nums font-medium">
                      {g.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-900">All Houses</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalHouses > 0
                ? `${totalHouses} houses total · Page size: 20`
                : "No houses yet"}
            </p>
          </div>
        </div>

        {/* Filters — full-width horizontal row */}
        <div className="flex flex-row flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <select
            className="input flex-1 min-w-[130px]"
            value={filterSite}
            onChange={(e) => setFilterSite(e.target.value)}
          >
            <option value="">All sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            className="input flex-1 min-w-[130px]"
            value={filterBed}
            onChange={(e) => setFilterBed(e.target.value)}
          >
            <option value="">All bed types</option>
            <option value="1bed">1bed</option>
            <option value="2bed">2bed</option>
            <option value="3bed">3bed</option>
          </select>
          <input
            className="input flex-1 min-w-[90px]"
            type="number"
            step="0.1"
            placeholder="Area (m²)"
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
          />
          <select
            className="input flex-1 min-w-[130px]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="allocated">Allocated</option>
          </select>
          {(filterSite || filterBed || filterArea || filterStatus) && (
            <button
              className="btn-secondary text-xs px-3 py-2 whitespace-nowrap"
              onClick={() => {
                setFilterSite("");
                setFilterBed("");
                setFilterArea("");
                setFilterStatus("");
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {houses.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No houses match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Site</th>
                  <th className="py-2 pr-3">Block</th>
                  <th className="py-2 pr-3">House</th>
                  <th className="py-2 pr-3">Floor</th>
                  <th className="py-2 pr-3">Bed</th>
                  <th className="py-2 pr-3">Area (m²)</th>
                  <th className="py-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {houses.map((h) => (
                  <tr
                    key={h.id}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-2 pr-3 text-slate-500">{h.id}</td>
                    <td className="py-2 pr-3">{h.site.name}</td>
                    <td className="py-2 pr-3">{h.blockNumber}</td>
                    <td className="py-2 pr-3">{h.houseNumber}</td>
                    <td className="py-2 pr-3">{h.floorNumber}</td>
                    <td className="py-2 pr-3">
                      <span className="badge-blue">{h.bedType}</span>
                    </td>
                    <td className="py-2 pr-3">{h.totalArea}</td>
                    <td className="py-2 pr-3">
                      {h.isAllocated ? (
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

        {/* Pagination Controls — always visible when there is data */}
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
              <button
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage(1)}
              >
                «
              </button>
              <button
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ‹ Prev
              </button>

              {/* Page number pills */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - page) <= 2
                )
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) {
                    acc.push("...");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-slate-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                        item === page
                          ? "bg-[#95298E] text-white shadow-sm"
                          : "btn-secondary"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next ›
              </button>
              <button
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage(totalPages)}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

