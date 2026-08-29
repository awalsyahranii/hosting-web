"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

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

export default function MyDetailsPage() {
  const [form, setForm] = useState<UserData>(defaultForm);
  const [initialForm, setInitialForm] =
    useState<UserData>(defaultForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");

    if (!savedUser) {
      window.location.href = "/login?redirect=/dashboard/profile";
      return;
    }

    try {
      const user: UserData = JSON.parse(savedUser);

      const nameParts = (user.name || "")
        .trim()
        .split(/\s+/);

      const data: UserData = {
        firstName:
          user.firstName ||
          nameParts[0] ||
          "",

        lastName:
          user.lastName ||
          (nameParts.length > 1
            ? nameParts.slice(1).join(" ")
            : ""),

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
      localStorage.removeItem("hostingwebid_user");
      localStorage.removeItem("hostingweb_auth");

      window.location.href =
        "/login?redirect=/dashboard/profile";

      return;
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast("");
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [toast]);

  function updateField(
    field: keyof UserData,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  }

  function handleCancel() {
    setForm(initialForm);
    setError("");
    setToast("Perubahan dibatalkan.");
  }

  function handleSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const required: Array<keyof UserData> = [
      "firstName",
      "lastName",
      "email",
      "address1",
      "city",
      "state",
      "zipCode",
      "country",
      "phone",
    ];

    const missing = required.some(
      (field) =>
        !String(form[field] || "").trim()
    );

    if (missing) {
      setError(
        "Lengkapi semua field yang bertanda *."
      );
      return;
    }

    if (
      !/^\S+@\S+\.\S+$/.test(
        form.email || ""
      )
    ) {
      setError(
        "Masukkan alamat email yang valid."
      );
      return;
    }

    if (
      (form.phone || "")
        .replace(/\D/g, "")
        .length < 8
    ) {
      setError(
        "Nomor telepon minimal 8 digit."
      );
      return;
    }

    setSaving(true);

    setTimeout(() => {
      try {
        const savedUser =
          localStorage.getItem(
            "hostingwebid_user"
          );

        const currentUser: UserData =
          savedUser
            ? JSON.parse(savedUser)
            : {};

        const updatedUser: UserData = {
          ...currentUser,
          ...form,
          name:
            `${form.firstName} ${form.lastName}`
              .trim(),
        };

        localStorage.setItem(
          "hostingwebid_user",
          JSON.stringify(updatedUser)
        );

        setInitialForm(form);

        setToast(
          "Perubahan berhasil disimpan."
        );
      } catch {
        setError(
          "Perubahan gagal disimpan. Silakan coba lagi."
        );
      } finally {
        setSaving(false);
      }
    }, 650);
  }

  function handleLogout() {
    localStorage.removeItem(
      "hostingwebid_user"
    );

    localStorage.removeItem(
      "hostingweb_auth"
    );

    window.location.href = "/";
  }

  if (loading) {
    return (
      <main className="dashboard-loading">
        <div className="dashboard-loading-box">
          <div className="dashboard-spinner" />

          <p>
            Memuat My Details...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page my-details-page">

      {/* =========================
          SIDEBAR
      ========================== */}

      <aside className="dashboard-sidebar">

        <div className="dashboard-sidebar-top">

          <Link
            href="/"
            className="dashboard-brand"
          >
            <img
              src="/logo.png"
              alt="HostingWeb"
            />
          </Link>

        </div>

        <nav className="dashboard-nav">

          <div className="dashboard-nav-label">
            UTAMA
          </div>

          <Link
            href="/dashboard"
            className="dashboard-nav-item"
          >
            <span className="dashboard-nav-icon">
              ⌂
            </span>

            <span>
              Dashboard
            </span>
          </Link>

          <Link
            href="/dashboard/hosting"
            className="dashboard-nav-item"
          >
            <span className="dashboard-nav-icon">
              ◫
            </span>

            <span>
              Hosting Saya
            </span>
          </Link>

          <Link
            href="/dashboard/domain"
            className="dashboard-nav-item"
          >
            <span className="dashboard-nav-icon">
              ◉
            </span>

            <span>
              Domain Saya
            </span>
          </Link>

          <div className="dashboard-nav-label">
            TRANSAKSI
          </div>

          <Link
            href="/dashboard/orders"
            className="dashboard-nav-item"
          >
            <span className="dashboard-nav-icon">
              🛒
            </span>

            <span>
              Pesanan
            </span>
          </Link>

          <Link
            href="/dashboard/invoices"
            className="dashboard-nav-item"
          >
            <span className="dashboard-nav-icon">
              ▤
            </span>

            <span>
              Invoice
            </span>
          </Link>

          <div className="dashboard-nav-label">
            AKUN
          </div>

          <Link
            href="/dashboard/profile"
            className="dashboard-nav-item active"
          >
            <span className="dashboard-nav-icon">
              ◯
            </span>

            <span>
              Profil Saya
            </span>
          </Link>

        </nav>

        <div className="dashboard-sidebar-bottom">

          <div className="dashboard-sidebar-support">

            <div className="support-icon">
              ?
            </div>

            <div>
              <strong>
                Butuh bantuan?
              </strong>

              <span>
                Hubungi support kami.
              </span>
            </div>

          </div>

          <button
            className="dashboard-logout"
            onClick={handleLogout}
          >
            <span>
              ↪
            </span>

            Keluar
          </button>

        </div>

      </aside>


      {/* =========================
          MAIN
      ========================== */}

      <div className="dashboard-main">

        {/* TOPBAR */}

        <header className="dashboard-topbar">

          <div className="dashboard-topbar-left">

            <Link
              href="/dashboard"
              className="my-details-back"
            >
              ←
            </Link>

            <div>

              <span className="dashboard-page-label">
                CLIENT AREA
              </span>

              <h1>
                My Details
              </h1>

            </div>

          </div>


          <div className="dashboard-topbar-right">

            <div className="my-details-user-avatar">
              {(form.firstName || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

          </div>

        </header>


        {/* CONTENT */}

        <section className="dashboard-content my-details-content">

          {/* BREADCRUMB */}

          <nav
            className="my-details-breadcrumb"
            aria-label="Breadcrumb"
            >
            <Link
                href="/dashboard"
                className="breadcrumb-link"
            >
                Dashboard
            </Link>

            <span className="breadcrumb-separator">
                /
            </span>

            <Link
                href="/dashboard"
                className="breadcrumb-link"
            >
                Client Area
            </Link>

            <span className="breadcrumb-separator">
                /
            </span>

            <span className="breadcrumb-current">
                My Details
            </span>
            </nav>


          {/* TITLE */}

          <div className="my-details-heading">

            <div>

              <span className="my-details-eyebrow">
                ACCOUNT SETTINGS
              </span>

              <h2>
                My Details
              </h2>

              <p>
                Kelola informasi pribadi dan data
                kontak akun kamu.
              </p>

            </div>

          </div>


          {/* CARD */}

          <div className="my-details-card">

            <div className="my-details-card-header">

              <div>

                <h3>
                  Personal Information
                </h3>

                <p>
                  Pastikan informasi yang kamu
                  masukkan sudah benar.
                </p>

              </div>

              <span className="my-details-required-note">
                * Wajib diisi
              </span>

            </div>


            <form
              onSubmit={handleSave}
              noValidate
            >

              {error && (
                <div
                  className="my-details-alert"
                  role="alert"
                >
                  <span>
                    !
                  </span>

                  {error}
                </div>
              )}


              <div className="my-details-form-grid">

                {/* FIRST NAME */}

                <div className="my-details-field">

                  <label htmlFor="firstName">
                    First Name{" "}
                    <span>*</span>
                  </label>

                  <input
                    id="firstName"
                    value={form.firstName}
                    onChange={(event) =>
                      updateField(
                        "firstName",
                        event.target.value
                      )
                    }
                    placeholder="First name"
                    disabled={saving}
                  />

                </div>


                {/* LAST NAME */}

                <div className="my-details-field">

                  <label htmlFor="lastName">
                    Last Name{" "}
                    <span>*</span>
                  </label>

                  <input
                    id="lastName"
                    value={form.lastName}
                    onChange={(event) =>
                      updateField(
                        "lastName",
                        event.target.value
                      )
                    }
                    placeholder="Last name"
                    disabled={saving}
                  />

                </div>


                {/* COMPANY */}

                <div className="my-details-field full">

                  <label htmlFor="companyName">
                    Company Name
                  </label>

                  <input
                    id="companyName"
                    value={
                      form.companyName
                    }
                    onChange={(event) =>
                      updateField(
                        "companyName",
                        event.target.value
                      )
                    }
                    placeholder="Company name (optional)"
                    disabled={saving}
                  />

                </div>


                {/* EMAIL */}

                <div className="my-details-field full">

                  <label htmlFor="email">
                    Email Address{" "}
                    <span>*</span>
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="nama@email.com"
                    disabled={saving}
                  />

                </div>


                {/* ADDRESS 1 */}

                <div className="my-details-field full">

                  <label htmlFor="address1">
                    Address 1{" "}
                    <span>*</span>
                  </label>

                  <input
                    id="address1"
                    value={
                      form.address1
                    }
                    onChange={(event) =>
                      updateField(
                        "address1",
                        event.target.value
                      )
                    }
                    placeholder="Alamat utama"
                    disabled={saving}
                  />

                </div>


                {/* ADDRESS 2 */}

                <div className="my-details-field full">

                  <label htmlFor="address2">
                    Address 2
                  </label>

                  <input
                    id="address2"
                    value={
                      form.address2
                    }
                    onChange={(event) =>
                      updateField(
                        "address2",
                        event.target.value
                      )
                    }
                    placeholder="Alamat tambahan (optional)"
                    disabled={saving}
                  />

                </div>


                {/* CITY */}

                <div className="my-details-field">

                  <label htmlFor="city">
                    City{" "}
                    <span>*</span>
                  </label>

                  <input
                    id="city"
                    value={form.city}
                    onChange={(event) =>
                      updateField(
                        "city",
                        event.target.value
                      )
                    }
                    placeholder="City"
                    disabled={saving}
                  />

                </div>


                {/* STATE */}

                <div className="my-details-field">

                  <label htmlFor="state">
                    State/Region{" "}
                    <span>*</span>
                  </label>

                  <input
                    id="state"
                    value={form.state}
                    onChange={(event) =>
                      updateField(
                        "state",
                        event.target.value
                      )
                    }
                    placeholder="State / Region"
                    disabled={saving}
                  />

                </div>


                {/* ZIP */}

                <div className="my-details-field">

                  <label htmlFor="zipCode">
                    Zip Code{" "}
                    <span>*</span>
                  </label>

                  <input
                    id="zipCode"
                    value={
                      form.zipCode
                    }
                    onChange={(event) =>
                      updateField(
                        "zipCode",
                        event.target.value
                      )
                    }
                    placeholder="Zip code"
                    disabled={saving}
                  />

                </div>


                {/* COUNTRY */}

                <div className="my-details-field">

                  <label htmlFor="country">
                    Country{" "}
                    <span>*</span>
                  </label>

                  <select
                    id="country"
                    value={
                      form.country
                    }
                    onChange={(event) =>
                      updateField(
                        "country",
                        event.target.value
                      )
                    }
                    disabled={saving}
                  >

                    <option value="">
                      Select country
                    </option>

                    <option value="Indonesia">
                      Indonesia
                    </option>

                    <option value="Malaysia">
                      Malaysia
                    </option>

                    <option value="Singapore">
                      Singapore
                    </option>

                    <option value="Brunei">
                      Brunei
                    </option>

                    <option value="Thailand">
                      Thailand
                    </option>

                    <option value="Philippines">
                      Philippines
                    </option>

                    <option value="Vietnam">
                      Vietnam
                    </option>

                    <option value="United States">
                      United States
                    </option>

                    <option value="United Kingdom">
                      United Kingdom
                    </option>

                    <option value="Australia">
                      Australia
                    </option>

                  </select>

                </div>


                {/* PHONE */}

                <div className="my-details-field full">

                  <label htmlFor="phone">
                    Phone Number{" "}
                    <span>*</span>
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="+62 812 3456 7890"
                    disabled={saving}
                  />

                </div>

              </div>


              {/* ACTION */}

              <div className="my-details-actions">

                <button
                  type="button"
                  className="my-details-cancel"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="my-details-save"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <span className="my-details-button-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save changes
                      <span>
                        →
                      </span>
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>


          <p className="my-details-footer-note">
            Informasi ini digunakan untuk kebutuhan
            akun dan komunikasi layanan HostingWeb.
          </p>

        </section>

      </div>


      {/* TOAST */}

      {toast && (
        <div
          className="my-details-toast"
          role="status"
        >

          <span>
            ✓
          </span>

          <div>

            <strong>
              Berhasil
            </strong>

            <p>
              {toast}
            </p>

          </div>

          <button
            onClick={() => setToast("")}
            aria-label="Tutup notifikasi"
          >
            ×
          </button>

        </div>
      )}

    </main>
  );
}