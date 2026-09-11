"use client";

import { useState } from "react";

export default function SecurityPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  return (
    <div className="dash-table-card" style={{ maxWidth: 800 }}>
      <div className="dash-table-header">
        <div className="dash-table-title-group">
          <span className="dash-table-pretitle">AUTENTIKASI &amp; KEAMANAN</span>
          <h3 className="dash-table-title">Pengaturan Keamanan Akun</h3>
        </div>
      </div>

      <div className="flex flex-col gap-5 py-2">
        {/* 2FA ITEM */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              🛡️
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Two-Factor Authentication (2FA)</h4>
              <p className="text-xs text-slate-500">Memberikan lapisan perlindungan ganda saat login akun.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              twoFactorEnabled
                ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {twoFactorEnabled ? "✓ 2FA Aktif" : "Nonaktif"}
          </button>
        </div>

        {/* ACTIVE SESSION */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              💻
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Sesi Login Saat Ini</h4>
              <p className="text-xs text-slate-500">Perangkat browser terdaftar dan terenkripsi TLS 1.3.</p>
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            ● Perangkat Aktif
          </span>
        </div>
      </div>
    </div>
  );
}
