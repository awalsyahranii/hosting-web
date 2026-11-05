"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError("Silakan masukkan email kamu.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const savedUser = localStorage.getItem(
        "hostingweb_user"
      );

      if (!savedUser) {
        setMessage(
          "Jika email tersebut terdaftar, instruksi reset password akan dikirim."
        );
        setLoading(false);
        return;
      }

      const user = JSON.parse(savedUser);

      if (user.email !== email) {
        setMessage(
          "Jika email tersebut terdaftar, instruksi reset password akan dikirim."
        );
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "hostingweb_reset_email",
        email
      );

      setMessage(
        "Email ditemukan. Silakan lanjutkan ke halaman reset password."
      );

      setLoading(false);
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
            </div>

          <div className="auth-header">
            <h1>Lupa Password?</h1>

            <p>
              Masukkan email yang digunakan untuk akun
              HostingWeb kamu.
            </p>
          </div>

          {error && (
            <div className="auth-alert">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-success">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Memeriksa..."
                : "Kirim Instruksi Reset"}
            </button>
          </form>

          <div className="auth-register">
            Ingat password kamu?{" "}
            <Link href="/login">
              Kembali ke Login
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