"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCaptchaClick = () => {
    if (captchaChecked) return;
    setCaptchaLoading(true);
    setTimeout(() => {
      setCaptchaLoading(false);
      setCaptchaChecked(true);
    }, 500);
  };

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email atau username dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost/hosting_webid/api/v1/auth/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            identifier: email,
            password: password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        setError(result.message || "Email atau password salah.");
        setLoading(false);
        return;
      }

      const backendUser = result.data?.user;

      if (!backendUser) {
        setError("Data user tidak ditemukan dari server.");
        setLoading(false);
        return;
      }

      const user = {
        id: backendUser.id,
        name: backendUser.username || backendUser.name || "User",
        email: backendUser.email,
        role: backendUser.role,
      };

      localStorage.setItem("hostingwebid_user", JSON.stringify(user));
      localStorage.setItem(
        "hostingweb_auth",
        JSON.stringify({
          loggedIn: true,
          email: backendUser.email,
        })
      );

      // REDIRECTION LOGIC:
      if (redirectParam) {
        router.push(redirectParam);
      } else if (
        backendUser.role === "admin" ||
        backendUser.role === "super_admin" ||
        backendUser.role === "superadmin"
      ) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Tidak dapat terhubung ke server.");
      setLoading(false);
    }
  }

  return (
    <main className="auth-page-wrapper">
      <div className="auth-main-container">
        {/* TOP BRAND LOGO */}
        <div className="auth-brand-top">
          <Link href="/" className="inline-block">
            <img src="/logo.png" alt="HostingWeb" className="auth-logo-img" />
          </Link>
        </div>

        {/* CARD CONTAINER / PEMBUNGKUS */}
        <div className="auth-card-box">
          {/* HEADER */}
          <div className="auth-header-section">
            <div className="auth-badge-pill">
              <span className="auth-badge-dot"></span>
              Portal Pelanggan & Admin
            </div>
            <h1 className="auth-main-title">Selamat Datang Kembali</h1>
            <p className="auth-sub-title">
              Kelola domain, hosting, dan layanan website bisnis kamu di{" "}
              <span className="auth-highlight-text">HostingWeb</span>.
            </p>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="auth-error-alert" role="alert">
              <span className="auth-alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleLogin} className="auth-form-body">
            {/* EMAIL / USERNAME */}
            <div className="auth-field-group">
              <label className="auth-field-label">Email atau Username</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="auth-text-input"
                  placeholder="nama@email.com atau username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="auth-field-group">
              <div className="auth-label-row">
                <label className="auth-field-label">Password</label>
                <Link href="/forgot-password" className="auth-forgot-link">
                  Lupa password?
                </Link>
              </div>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-text-input has-toggle"
                  placeholder="Masukkan password akun kamu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* REMEMBER ME */}
            <div className="auth-checkbox-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="auth-custom-checkbox"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
            </div>

            {/* CAPTCHA MOCK */}
            <div
              className={`auth-captcha-box ${captchaChecked ? "is-verified" : ""}`}
              onClick={handleCaptchaClick}
            >
              <div className="auth-captcha-left">
                <div
                  className={`auth-captcha-checkbox ${
                    captchaChecked ? "checked" : captchaLoading ? "loading" : ""
                  }`}
                >
                  {captchaChecked && <span className="auth-captcha-check">✓</span>}
                  {captchaLoading && <span className="auth-captcha-spinner" />}
                </div>
                <span className="auth-captcha-text">
                  {captchaChecked ? "Verifikasi Berhasil" : "Saya bukan robot (Verifikasi Keamanan)"}
                </span>
              </div>
              <div className="auth-captcha-brand">
                <img
                  src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                  alt="reCAPTCHA"
                  className="auth-captcha-logo"
                />
                <small className="auth-captcha-sub">reCAPTCHA</small>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading || !captchaChecked}
              className="auth-submit-btn"
            >
              {loading ? (
                <span className="auth-btn-loading">
                  <span className="auth-spinner" />
                  Memproses Masuk...
                </span>
              ) : (
                <span>Masuk ke Akun Sekarang →</span>
              )}
            </button>
          </form>

          {/* REGISTER LINK */}
          <div className="auth-bottom-section">
            <div className="auth-register-text">
              Belum punya akun?{" "}
              <Link href="/register" className="auth-register-link">
                Daftar sekarang
              </Link>
            </div>
          </div>
        </div>

        {/* OUTSIDE CARD FOOTER */}
        <div className="auth-footer-outer">
          <Link href="/" className="auth-back-link">
            ← Kembali ke Beranda HostingWeb
          </Link>
        </div>
      </div>

      <style jsx>{`
        .auth-page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          background-image: 
            radial-gradient(at 50% 0%, rgba(249, 115, 22, 0.06) 0px, transparent 60%),
            radial-gradient(at 100% 100%, rgba(239, 68, 68, 0.03) 0px, transparent 50%);
          padding: 48px 16px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #0f172a;
          position: relative;
        }

        .auth-main-container {
          width: 100%;
          max-width: 450px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        .auth-brand-top {
          margin-bottom: 24px;
          text-align: center;
          transition: transform 0.2s ease;
        }

        .auth-brand-top:hover {
          transform: translateY(-2px);
        }

        .auth-logo-img {
          height: 40px;
          width: auto;
          object-fit: contain;
        }

        .auth-card-box {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 36px 32px;
          box-shadow: 
            0 10px 30px -5px rgba(15, 23, 42, 0.06),
            0 20px 40px -15px rgba(15, 23, 42, 0.04),
            0 0 0 1px rgba(226, 232, 240, 0.8);
        }

        .auth-header-section {
          text-align: center;
          margin-bottom: 24px;
        }

        .auth-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff7ed;
          border: 1px solid #ffedd5;
          color: #c2410c;
          font-size: 11.5px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 9999px;
          margin-bottom: 12px;
          letter-spacing: 0.02em;
        }

        .auth-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ea580c;
        }

        .auth-main-title {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.03em;
          margin: 0 0 8px 0;
          line-height: 1.25;
        }

        .auth-sub-title {
          font-size: 13.5px;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }

        .auth-highlight-text {
          color: #ea580c;
          font-weight: 700;
        }

        .auth-error-alert {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .auth-alert-icon {
          font-size: 14px;
        }

        .auth-form-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .auth-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .auth-field-label {
          font-size: 12px;
          font-weight: 700;
          color: #334155;
          letter-spacing: 0.01em;
        }

        .auth-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .auth-forgot-link {
          font-size: 12px;
          font-weight: 600;
          color: #ea580c;
          text-decoration: none;
          transition: color 0.15s;
        }

        .auth-forgot-link:hover {
          color: #c2410c;
          text-decoration: underline;
        }

        .auth-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .auth-input-wrapper:focus-within {
          border-color: #ea580c;
          box-shadow: 0 0 0 3.5px rgba(234, 88, 12, 0.12);
        }

        .auth-input-icon {
          position: absolute;
          left: 14px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .auth-text-input {
          width: 100%;
          border: none;
          background: transparent;
          padding: 12px 14px 12px 42px;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          font-weight: 500;
        }

        .auth-text-input.has-toggle {
          padding-right: 42px;
        }

        .auth-text-input::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }

        .auth-password-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          transition: color 0.15s;
        }

        .auth-password-toggle:hover {
          color: #ea580c;
        }

        .auth-checkbox-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .auth-checkbox-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #475569;
          cursor: pointer;
          user-select: none;
        }

        .auth-custom-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #ea580c;
          cursor: pointer;
        }

        /* CAPTCHA BOX */
        .auth-captcha-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 14px;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
        }

        .auth-captcha-box:hover {
          border-color: #cbd5e1;
        }

        .auth-captcha-box.is-verified {
          border-color: #86efac;
          background: #f0fdf4;
        }

        .auth-captcha-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .auth-captcha-checkbox {
          width: 22px;
          height: 22px;
          border: 2px solid #cbd5e1;
          border-radius: 5px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .auth-captcha-checkbox.checked {
          background: #16a34a;
          border-color: #16a34a;
        }

        .auth-captcha-check {
          color: #ffffff;
          font-size: 13px;
          font-weight: 900;
        }

        .auth-captcha-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid #cbd5e1;
          border-top-color: #ea580c;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .auth-captcha-text {
          font-size: 12.5px;
          color: #334155;
          font-weight: 500;
        }

        .auth-captcha-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .auth-captcha-logo {
          width: 22px;
          height: 22px;
          object-fit: contain;
        }

        .auth-captcha-sub {
          font-size: 8.5px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* SUBMIT BUTTON */
        .auth-submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border: none;
          color: #ffffff;
          font-size: 14.5px;
          font-weight: 700;
          padding: 13px 20px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 4px;
        }

        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(234, 88, 12, 0.4);
          filter: brightness(1.05);
        }

        .auth-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .auth-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .auth-btn-loading {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .auth-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        /* DIVIDER */
        .auth-divider-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0 16px 0;
        }

        .auth-divider-line {
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .auth-divider-text {
          font-size: 11.5px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        /* GOOGLE BUTTON */
        .auth-google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          color: #334155;
          font-size: 13.5px;
          font-weight: 600;
          padding: 11px 18px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .auth-google-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        /* BOTTOM SECTION */
        .auth-bottom-section {
          margin-top: 22px;
          text-align: center;
        }

        .auth-register-text {
          font-size: 13px;
          color: #64748b;
        }

        .auth-register-link {
          color: #ea580c;
          font-weight: 700;
          text-decoration: none;
          margin-left: 4px;
          transition: color 0.15s;
        }

        .auth-register-link:hover {
          color: #c2410c;
          text-decoration: underline;
        }

        /* FOOTER OUTSIDE */
        .auth-footer-outer {
          margin-top: 24px;
          text-align: center;
        }

        .auth-back-link {
          font-size: 13px;
          color: #64748b;
          text-decoration: none;
          transition: color 0.2s;
        }

        .auth-back-link:hover {
          color: #0f172a;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Memuat login...</div>}>
      <LoginForm />
    </Suspense>
  );
}