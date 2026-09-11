"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserData = {
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
};

const defaultForm: UserData = {
  firstName: "",
  lastName: "",
  companyName: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Indonesia",
  phone: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<UserData>(defaultForm);
  const [initialForm, setInitialForm] = useState<UserData>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (!savedUser) {
      router.push("/login?redirect=/dashboard/profile");
      return;
    }

    try {
      const user: UserData = JSON.parse(savedUser);
      const nameParts = (user.name || "").trim().split(/\s+/);
      const data: UserData = {
        firstName: user.firstName || nameParts[0] || "",
        lastName: user.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""),
        companyName: user.companyName || "",
        email: user.email || "",
        address1: user.address1 || "",
        address2: user.address2 || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        country: user.country || "Indonesia",
        phone: user.phone || "",
      };
      setForm(data);
      setInitialForm(data);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      setToast("");
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function updateField(field: keyof UserData, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError("");
  }

  function handleCancel() {
    setForm(initialForm);
    setError("");
    setToast("Perubahan dibatalkan.");
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    setSaving(true);
    setTimeout(() => {
      try {
        const savedUser = localStorage.getItem("hostingwebid_user");
        const currentUser: UserData = savedUser ? JSON.parse(savedUser) : {};
        const updatedUser: UserData = {
          ...currentUser,
          ...form,
          name: `${form.firstName} ${form.lastName}`.trim(),
        };

        localStorage.setItem("hostingwebid_user", JSON.stringify(updatedUser));
        setInitialForm(form);
        setToast("Perubahan profil berhasil disimpan!");
      } catch {
        setError("Perubahan gagal disimpan. Silakan coba lagi.");
      } finally {
        setSaving(false);
      }
    }, 400);
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Memuat profil pengguna...
      </div>
    );
  }

  return (
    <div className="dash-table-card" style={{ maxWidth: 850 }}>
      <div className="dash-table-header">
        <div className="dash-table-title-group">
          <span className="dash-table-pretitle">INFORMASI PENGGUNA</span>
          <h3 className="dash-table-title">Profil &amp; Data Kontak Akun</h3>
        </div>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-2">
          <span>✓</span>
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg flex items-center gap-2">
          <span>!</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Nama Depan *</label>
            <input
              type="text"
              value={form.firstName || ""}
              onChange={(e) => updateField("firstName", e.target.value)}
              className="px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Nama Belakang *</label>
            <input
              type="text"
              value={form.lastName || ""}
              onChange={(e) => updateField("lastName", e.target.value)}
              className="px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Email Akun *</label>
            <input
              type="email"
              value={form.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
              className="px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500 bg-slate-50"
              readOnly
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">No. WhatsApp / Telepon *</label>
            <input
              type="tel"
              value={form.phone || ""}
              placeholder="08xxxxxxxxxx"
              onChange={(e) => updateField("phone", e.target.value)}
              className="px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase">Nama Perusahaan / Bisnis (Opsional)</label>
          <input
            type="text"
            value={form.companyName || ""}
            placeholder="PT / CV / Toko"
            onChange={(e) => updateField("companyName", e.target.value)}
            className="px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase">Alamat *</label>
          <input
            type="text"
            value={form.address1 || ""}
            placeholder="Jalan, No Rumah / Gedung"
            onChange={(e) => updateField("address1", e.target.value)}
            className="px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Kota *</label>
            <input
              type="text"
              value={form.city || ""}
              onChange={(e) => updateField("city", e.target.value)}
              className="px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Provinsi *</label>
            <input
              type="text"
              value={form.state || ""}
              onChange={(e) => updateField("state", e.target.value)}
              className="px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Kode Pos *</label>
            <input
              type="text"
              value={form.zipCode || ""}
              onChange={(e) => updateField("zipCode", e.target.value)}
              className="px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}