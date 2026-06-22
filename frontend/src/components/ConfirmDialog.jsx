import React from 'react';

export default function ConfirmDialog({ preview, siteName, bedType, area, onCancel, onConfirm, busy }) {
  if (!preview) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md card p-6">
        <h3 className="text-lg font-semibold text-slate-900">Confirm lottery draw</h3>
        <p className="mt-2 text-sm text-slate-600">
          You're about to draw the lottery for the following combination. This action
          cannot be undone.
        </p>

        <dl className="mt-4 space-y-2 text-sm">
          <Row k="Site" v={siteName} />
          <Row k="Bed type" v={bedType} />
          <Row k="Area" v={`${area} m²`} />
          <Row k="Houses" v={preview.houseCount} />
          <Row k="Applicants" v={preview.appCount} />
          <Row k="Winners" v={preview.winners} />
          <Row k="Waitlist" v={preview.waitlist} />
        </dl>

        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="btn-primary" onClick={onConfirm} disabled={busy}>
            {busy ? 'Drawing…' : 'Confirm & draw'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 last:border-0 pb-1">
      <dt className="text-slate-500">{k}</dt>
      <dd className="font-medium text-slate-800">{v}</dd>
    </div>
  );
}
