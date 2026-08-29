"use client";

import { useEffect, useState } from "react";

type Coupon = {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  min_purchase: string;
  max_discount: string | null;
  start_date: string | null;
  end_date: string | null;
  usage_limit: number | null;
  used_count: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

type CouponForm = {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  min_purchase: string;
  max_discount: string;
  start_date: string;
  end_date: string;
  usage_limit: string;
  status: "active" | "inactive";
};

const API_URL =
  "http://localhost/hosting_webid/api/v1/admin/coupon";

const emptyForm: CouponForm = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  min_purchase: "",
  max_discount: "",
  start_date: "",
  end_date: "",
  usage_limit: "",
  status: "active",
};

export default function CouponAdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<CouponForm>(emptyForm);

  // =====================================================
  // HELPER RESPONSE
  // =====================================================

  const parseResponse = async (response: Response) => {
    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      console.error("Response server:", text);

      return {
        status: "error",
        code: response.status,
        message:
          response.status === 404
            ? "Endpoint API tidak ditemukan"
            : response.status === 405
            ? "Method HTTP tidak diizinkan"
            : "Server mengembalikan response yang tidak valid",
      };
    }
  };

  // =====================================================
  // GET ALL COUPONS
  // =====================================================

  const fetchCoupons = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/index.php`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await parseResponse(response);

      if (!response.ok || result.status !== "success") {
        alert(
          result.message ||
            "Gagal mengambil data voucher"
        );
        return;
      }

      setCoupons(result.data || []);
    } catch (error) {
      console.error("GET COUPON ERROR:", error);

      alert(
        "Tidak dapat terhubung ke server. Pastikan Apache/XAMPP aktif."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  // =====================================================
  // TAMBAH
  // =====================================================

  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);

    setForm({
      code: coupon.code,

      discount_type:
        coupon.discount_type,

      discount_value:
        coupon.discount_value,

      min_purchase:
        coupon.min_purchase,

      max_discount:
        coupon.max_discount || "",

      start_date:
        coupon.start_date
          ? coupon.start_date
              .substring(0, 16)
              .replace(" ", "T")
          : "",

      end_date:
        coupon.end_date
          ? coupon.end_date
              .substring(0, 16)
              .replace(" ", "T")
          : "",

      usage_limit:
        coupon.usage_limit !== null
          ? String(coupon.usage_limit)
          : "",

      status:
        coupon.status,
    });

    setShowForm(true);
  };

  // =====================================================
  // SUBMIT CREATE / UPDATE
  // =====================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!form.code.trim()) {
      alert("Kode voucher wajib diisi");
      return;
    }

    if (!form.discount_value) {
      alert("Nilai diskon wajib diisi");
      return;
    }

    const discountValue =
      Number(form.discount_value);

    if (discountValue <= 0) {
      alert(
        "Nilai diskon harus lebih besar dari 0"
      );
      return;
    }

    if (
      form.discount_type === "percentage" &&
      discountValue > 100
    ) {
      alert(
        "Diskon persentase maksimal 100%"
      );
      return;
    }

    if (
      form.start_date &&
      form.end_date &&
      new Date(form.start_date) >
        new Date(form.end_date)
    ) {
      alert(
        "Tanggal mulai tidak boleh lebih besar dari tanggal berakhir"
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        code: form.code
          .trim()
          .toUpperCase(),

        discount_type:
          form.discount_type,

        discount_value:
          discountValue,

        min_purchase:
          form.min_purchase !== ""
            ? Number(form.min_purchase)
            : 0,

        max_discount:
          form.max_discount !== ""
            ? Number(form.max_discount)
            : null,

        start_date:
          form.start_date !== ""
            ? form.start_date.replace(
                "T",
                " "
              ) + ":00"
            : null,

        end_date:
          form.end_date !== ""
            ? form.end_date.replace(
                "T",
                " "
              ) + ":00"
            : null,

        usage_limit:
          form.usage_limit !== ""
            ? Number(form.usage_limit)
            : null,

        status:
          form.status,
      };

      const isEdit =
        editingId !== null;

      const url = isEdit
        ? `${API_URL}/update.php?id=${editingId}`
        : `${API_URL}/create.php`;

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",

        credentials: "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(payload),
      });

      const result =
        await parseResponse(response);

      if (
        !response.ok ||
        result.status !== "success"
      ) {
        alert(
          result.message ||
            "Gagal menyimpan voucher"
        );
        return;
      }

      alert(result.message);

      setShowForm(false);
      resetForm();

      await fetchCoupons();
    } catch (error) {
      console.error(
        "SAVE COUPON ERROR:",
        error
      );

      alert(
        "Tidak dapat terhubung ke server."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // TOGGLE STATUS
  // =====================================================

  const handleToggle = async (
    coupon: Coupon
  ) => {
    const nextStatus =
      coupon.status === "active"
        ? "menonaktifkan"
        : "mengaktifkan";

    const confirmed = window.confirm(
      `Yakin ingin ${nextStatus} voucher ${coupon.code}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/toggle-status.php?id=${coupon.id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const result =
        await parseResponse(response);

      if (
        !response.ok ||
        result.status !== "success"
      ) {
        alert(
          result.message ||
            "Gagal mengubah status voucher"
        );
        return;
      }

      alert(result.message);

      await fetchCoupons();
    } catch (error) {
      console.error(
        "TOGGLE ERROR:",
        error
      );

      alert(
        "Tidak dapat terhubung ke server."
      );
    }
  };

  // =====================================================
  // FORMAT RUPIAH
  // =====================================================

  const formatRupiah = (
    value: string | number | null
  ) => {
    if (
      value === null ||
      value === ""
    ) {
      return "-";
    }

    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }
    ).format(Number(value));
  };

  // =====================================================
  // FORMAT TANGGAL
  // =====================================================

  const formatDate = (
    value: string | null
  ) => {
    if (!value) {
      return "Tidak terbatas";
    }

    const date = new Date(
      value.replace(" ", "T")
    );

    if (isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(date);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">
          Memuat data voucher...
        </div>
      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              marginBottom: "6px",
            }}
          >
            Voucher
          </h1>

          <p
            style={{
              margin: 0,
              color: "#666",
            }}
          >
            Kelola voucher dan diskon
            untuk pelanggan.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="cart-checkout-button"
          style={{
            minWidth: "220px",
          }}
        >
          + Tambah Voucher
        </button>
      </div>

      {/* =================================================
          FORM
      ================================================= */}

      {showForm && (
        <div
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "24px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "24px",
            }}
          >
            {editingId !== null
              ? "Edit Voucher"
              : "Tambah Voucher"}
          </h2>

          <form
            onSubmit={handleSubmit}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "16px",
              }}
            >

              {/* KODE */}

              <div>
                <label>
                  Kode Voucher
                </label>

                <input
                  type="text"
                  value={form.code}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      code:
                        e.target.value
                          .toUpperCase(),
                    })
                  }
                  placeholder="DISKON10"
                  style={inputStyle}
                />
              </div>

              {/* TIPE */}

              <div>
                <label>
                  Tipe Diskon
                </label>

                <select
                  value={
                    form.discount_type
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      discount_type:
                        e.target.value as
                          | "percentage"
                          | "fixed",
                    })
                  }
                  style={inputStyle}
                >
                  <option value="percentage">
                    Persentase (%)
                  </option>

                  <option value="fixed">
                    Nominal Tetap (Rp)
                  </option>
                </select>
              </div>

              {/* NILAI DISKON */}

              <div>
                <label>
                  Nilai Diskon
                </label>

                <input
                  type="number"
                  min="1"
                  max={
                    form.discount_type ===
                    "percentage"
                      ? "100"
                      : undefined
                  }
                  value={
                    form.discount_value
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      discount_value:
                        e.target.value,
                    })
                  }
                  placeholder={
                    form.discount_type ===
                    "percentage"
                      ? "40"
                      : "50000"
                  }
                  style={inputStyle}
                />
              </div>

              {/* MIN PURCHASE */}

              <div>
                <label>
                  Minimum Pembelian
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    form.min_purchase
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      min_purchase:
                        e.target.value,
                    })
                  }
                  placeholder="100000"
                  style={inputStyle}
                />
              </div>

              {/* MAX DISCOUNT */}

              <div>
                <label>
                  Maksimum Diskon
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    form.max_discount
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      max_discount:
                        e.target.value,
                    })
                  }
                  placeholder="50000"
                  style={inputStyle}
                />
              </div>

              {/* START */}

              <div>
                <label>
                  Tanggal Mulai
                </label>

                <input
                  type="datetime-local"
                  value={
                    form.start_date
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      start_date:
                        e.target.value,
                    })
                  }
                  style={inputStyle}
                />
              </div>

              {/* END */}

              <div>
                <label>
                  Tanggal Berakhir
                </label>

                <input
                  type="datetime-local"
                  value={
                    form.end_date
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      end_date:
                        e.target.value,
                    })
                  }
                  style={inputStyle}
                />
              </div>

              {/* USAGE */}

              <div>
                <label>
                  Batas Penggunaan
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    form.usage_limit
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      usage_limit:
                        e.target.value,
                    })
                  }
                  placeholder="100"
                  style={inputStyle}
                />
              </div>

              {/* STATUS */}

              <div>
                <label>
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status:
                        e.target.value as
                          | "active"
                          | "inactive",
                    })
                  }
                  style={inputStyle}
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>

            </div>

            {/* BUTTON */}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "24px",
              }}
            >
              <button
                type="submit"
                disabled={saving}
                className="cart-checkout-button"
              >
                {saving
                  ? "Menyimpan..."
                  : editingId !== null
                  ? "Update Voucher"
                  : "Simpan Voucher"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={saving}
                style={{
                  padding:
                    "10px 20px",
                  borderRadius: "6px",
                  border:
                    "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =================================================
          TABLE
      ================================================= */}

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          overflowX: "auto",
          boxShadow:
            "0 2px 10px rgba(0,0,0,0.06)",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: "1100px",
            borderCollapse:
              "collapse",
          }}
        >
          <thead>
            <tr>
              {[
                "ID",
                "Kode",
                "Diskon",
                "Min. Pembelian",
                "Maks. Diskon",
                "Penggunaan",
                "Periode",
                "Status",
                "Aksi",
              ].map((title) => (
                <th
                  key={title}
                  style={thStyle}
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>

            {coupons.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#777",
                  }}
                >
                  Belum ada voucher
                </td>
              </tr>
            ) : (
              coupons.map(
                (coupon) => (
                  <tr
                    key={coupon.id}
                    style={{
                      borderBottom:
                        "1px solid #eee",
                    }}
                  >

                    {/* ID */}

                    <td
                      style={tdStyle}
                    >
                      {coupon.id}
                    </td>

                    {/* CODE */}

                    <td
                      style={tdStyle}
                    >
                      <strong>
                        {coupon.code}
                      </strong>
                    </td>

                    {/* DISCOUNT */}

                    <td
                      style={tdStyle}
                    >
                      <strong>
                        {coupon.discount_type ===
                        "percentage"
                          ? `${Number(
                              coupon.discount_value
                            )}%`
                          : formatRupiah(
                              coupon.discount_value
                            )}
                      </strong>
                    </td>

                    {/* MIN */}

                    <td
                      style={tdStyle}
                    >
                      {formatRupiah(
                        coupon.min_purchase
                      )}
                    </td>

                    {/* MAX */}

                    <td
                      style={tdStyle}
                    >
                      {formatRupiah(
                        coupon.max_discount
                      )}
                    </td>

                    {/* USAGE */}

                    <td
                      style={{
                        ...tdStyle,
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {coupon.used_count} /{" "}
                      {coupon.usage_limit ??
                        "∞"}
                    </td>

                    {/* PERIOD */}

                    <td
                      style={{
                        ...tdStyle,
                        minWidth:
                          "190px",
                      }}
                    >
                      {coupon.start_date ||
                      coupon.end_date ? (
                        <>
                          <div>
                            {formatDate(
                              coupon.start_date
                            )}
                          </div>

                          <div
                            style={{
                              margin:
                                "4px 0",
                              color:
                                "#777",
                              fontSize:
                                "12px",
                            }}
                          >
                            sampai
                          </div>

                          <div>
                            {formatDate(
                              coupon.end_date
                            )}
                          </div>
                        </>
                      ) : (
                        <span
                          style={{
                            color:
                              "#777",
                          }}
                        >
                          Tidak terbatas
                        </span>
                      )}
                    </td>

                    {/* STATUS */}

                    <td
                      style={tdStyle}
                    >
                      <span
                        style={{
                          display:
                            "inline-block",
                          padding:
                            "5px 10px",
                          borderRadius:
                            "20px",
                          fontSize:
                            "12px",
                          fontWeight:
                            700,
                          background:
                            coupon.status ===
                            "active"
                              ? "#e8f7e8"
                              : "#fdeaea",
                          color:
                            coupon.status ===
                            "active"
                              ? "#218838"
                              : "#c62828",
                        }}
                      >
                        {coupon.status ===
                        "active"
                          ? "ACTIVE"
                          : "INACTIVE"}
                      </span>
                    </td>

                    {/* ACTION */}

                    <td
                      style={tdStyle}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          gap: "8px",
                          flexWrap:
                            "wrap",
                        }}
                      >

                        {/* EDIT */}

                        <button
                          onClick={() =>
                            handleEdit(
                              coupon
                            )
                          }
                          style={{
                            ...actionButton,
                            background:
                              "#f1f5f9",
                            color:
                              "#334155",
                          }}
                        >
                          Edit
                        </button>

                        {/* TOGGLE */}

                        <button
                          onClick={() =>
                            handleToggle(
                              coupon
                            )
                          }
                          style={{
                            ...actionButton,
                            background:
                              coupon.status ===
                              "active"
                                ? "#fff3cd"
                                : "#dff6e4",
                            color:
                              coupon.status ===
                              "active"
                                ? "#856404"
                                : "#218838",
                          }}
                        >
                          {coupon.status ===
                          "active"
                            ? "Nonaktifkan"
                            : "Aktifkan"}
                        </button>

                      </div>
                    </td>

                  </tr>
                )
              )
            )}

          </tbody>
        </table>
      </div>

    </main>
  );
}

// =====================================================
// STYLES
// =====================================================

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  marginTop: "6px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  boxSizing: "border-box",
  fontSize: "14px",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 10px",
  borderBottom:
    "2px solid #e5e7eb",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "16px 10px",
  verticalAlign: "middle",
};

const actionButton: React.CSSProperties = {
  border: "none",
  borderRadius: "6px",
  padding: "7px 11px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
};