"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
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

      console.log("Login response:", result);

      if (!response.ok || result.status !== "success") {
        setError(
          result.message || "Email atau password salah."
        );

        setLoading(false);
        return;
      }

      /*
       * Response backend sebelumnya:
       *
       * {
       *   status: "success",
       *   code: 200,
       *   message: "Login berhasil",
       *   data: {
       *     user: {
       *       id: 4,
       *       username: "testuser",
       *       email: "testuser@example.com",
       *       role: "user"
       *     }
       *   }
       * }
       */

      const backendUser = result.data?.user;

      if (!backendUser) {
        setError("Data user tidak ditemukan dari server.");
        setLoading(false);
        return;
      }

      /*
       * Simpan data user untuk kebutuhan tampilan frontend.
       *
       * JANGAN simpan password.
       */
      const user = {
        id: backendUser.id,
        name:
          backendUser.username ||
          backendUser.name ||
          "User",
        email: backendUser.email,
        role: backendUser.role,
      };

      localStorage.setItem(
        "hostingwebid_user",
        JSON.stringify(user)
      );

      /*
       * Simpan status login frontend.
       */
      localStorage.setItem(
        "hostingweb_auth",
        JSON.stringify({
          loggedIn: true,
          email: backendUser.email,
        })
      );

      /*
       * Session PHP tetap berada di cookie PHPSESSID.
       *
       * credentials: "include" di atas memastikan
       * browser menerima/mengirim cookie tersebut.
       */

      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Tidak dapat terhubung ke server."
      );

      setLoading(false);
    }
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
            <h1>Selamat Datang 👋</h1>

            <p>
              Login ke akun HostingWeb kamu untuk melanjutkan.
            </p>
          </div>

          {error && (
            <div className="auth-alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

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
                disabled={loading}
              />
            </div>

            <div className="form-group">

              <div className="label-row">

                <label htmlFor="password">
                  Password
                </label>

                <Link href="/forgot-password">
                  Lupa password?
                </Link>

              </div>

              <div className="password-wrapper">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword
                    ? "Sembunyikan"
                    : "Lihat"}
                </button>

              </div>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Memproses..."
                : "Login"}
            </button>

          </form>

          <div className="auth-divider">
            <span>atau</span>
          </div>

          <div className="auth-register">
            Belum punya akun?{" "}

            <Link href="/register">
              Daftar sekarang
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