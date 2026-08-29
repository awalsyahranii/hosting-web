"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleRegister(e: FormEvent) {
    e.preventDefault();

    setError("");

    if (!name || !email || !password || !confirmPassword) {
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
      const existingUser = localStorage.getItem(
        "hostingweb_user"
      );

      if (existingUser) {
        const user = JSON.parse(existingUser);

        if (user.email === email) {
          setError(
            "Email tersebut sudah terdaftar. Silakan login."
          );
          setLoading(false);
          return;
        }
      }

      const user = {
        name,
        email,
        password,
      };

      localStorage.setItem(
        "hostingweb_user",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "hostingweb_auth",
        JSON.stringify({
          loggedIn: true,
          email,
        })
      );

      router.push("/dashboard");
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
          <div className="auth-header">
            <h1>Buat Akun Baru 🚀</h1>

            <p>
              Daftar sekarang dan mulai bangun website kamu.
            </p>
          </div>

          {error && (
            <div className="auth-alert">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="name">
                Nama Lengkap
              </label>

              <input
                id="name"
                type="text"
                placeholder="Nama lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Konfirmasi Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
              />
            </div>

            <div className="terms">
              Dengan mendaftar, kamu menyetujui Syarat &
              Ketentuan dan Kebijakan Privasi HostingWeb.
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Membuat akun..." : "Buat Akun"}
            </button>
          </form>

          <div className="auth-divider">
            <span>atau</span>
          </div>

          <div className="auth-register">
            Sudah punya akun?{" "}
            <Link href="/login">
              Login sekarang
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