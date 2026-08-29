"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resetEmail = localStorage.getItem(
      "hostingweb_reset_email"
    );

    if (resetEmail) {
      setEmail(resetEmail);
    }
  }, []);

  function handleReset(e: FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !password || !confirmPassword) {
      setError("Semua field wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const savedUser = localStorage.getItem(
        "hostingweb_user"
      );

      if (!savedUser) {
        setError("Akun tidak ditemukan.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(savedUser);

      if (user.email !== email) {
        setError("Email tidak sesuai dengan akun.");
        setLoading(false);
        return;
      }

      user.password = password;

      localStorage.setItem(
        "hostingweb_user",
        JSON.stringify(user)
      );

      localStorage.removeItem(
        "hostingweb_reset_email"
      );

      setSuccess(
        "Password berhasil diubah. Mengarahkan ke login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    }, 700);
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <Link href="/">
            <img
              src="/logo.png"
              alt="HostingWeb"
              className="auth-logo"
            />
          </Link>
        </div>

        <div className="auth-card">
          <div className="auth-icon">
            🔑
          </div>

          <div className="auth-header">
            <h1>Reset Password</h1>

            <p>
              Buat password baru untuk akun kamu.
            </p>
          </div>

          {error && (
            <div className="auth-alert">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-success">
              {success}
            </div>
          )}

          <form onSubmit={handleReset}>
            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="nama@email.com"
              />
            </div>

            <div className="form-group">
              <label>Password Baru</label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Minimal 8 karakter"
              />
            </div>

            <div className="form-group">
              <label>Konfirmasi Password</label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Ulangi password baru"
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Menyimpan..."
                : "Simpan Password Baru"}
            </button>
          </form>

          <div className="auth-register">
            <Link href="/login">
              ← Kembali ke Login
            </Link>
          </div>
        </div>

        <div className="auth-back">
          <Link href="/">
            ← Kembali ke HostingWeb
          </Link>
        </div>
      </div>
    </main>
  );
}