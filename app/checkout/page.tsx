"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CheckoutItem = {
  cart_id: number;
  domain_id: number;
  domain_name: string;
  extension: string;
  price: number;
};

type CheckoutData = {
  items: CheckoutItem[];
  subtotal: string;
  ppn: string;
  total: string;
};

export default function CheckoutPage() {
  const [checkout, setCheckout] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCheckout();
  }, []);

 async function fetchCheckout() {
  try {
    setLoading(true);
    setError("");

    console.log("1. Fetch mulai");

    const response = await fetch(
      "http://localhost/hosting_webid/api/v1/checkout/index.php",
      {
        method: "GET",
        credentials: "include",
      }
    );

    console.log(
      "2. Response diterima:",
      response.status
    );

    const result = await response.json();

    console.log(
      "3. Data diterima:",
      result
    );

    if (!response.ok || result.status !== "success") {
      setError(
        result.message ||
          "Gagal mengambil data checkout."
      );
      return;
    }

    setCheckout(result.data);

  } catch (error) {
    console.error(
      "Checkout error:",
      error
    );

    setError(
      "Tidak dapat mengambil data checkout."
    );

  } finally {
    setLoading(false);
  }
}

  async function handleProceedToInvoice() {
    try {
      setSubmitting(true);
      setError("");

      console.log("1. Membuat order");
      const orderResponse = await fetch(
        "http://localhost/hosting_webid/api/v1/order/create.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const orderResult = await orderResponse.json();
      console.log("2. Order result:", orderResult);

      if (!orderResponse.ok || orderResult.status !== "success") {
        setError(orderResult.message || "Gagal membuat pesanan.");
        return;
      }

      const orderId = orderResult.data.order_id;
      console.log("3. Membuat invoice untuk order_id:", orderId);

      const invoiceResponse = await fetch(
        "http://localhost/hosting_webid/api/v1/invoice/index.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ order_id: orderId }),
        }
      );

      const invoiceResult = await invoiceResponse.json();
      console.log("4. Invoice result:", invoiceResult);

      if (invoiceResponse.status === 409) {
        router.push("/dashboard/invoices");
        return;
      }

      if (!invoiceResponse.ok || invoiceResult.status !== "success") {
        setError(invoiceResult.message || "Gagal membuat invoice.");
        return;
      }

      const newInvoiceId = invoiceResult.data?.id;
      if (newInvoiceId) {
        router.push(`/dashboard/invoices?id=${newInvoiceId}`);
      } else {
        router.push("/dashboard/invoices");
      }
    } catch (error) {
      console.error("Proses checkout error:", error);
      setError("Tidak dapat memproses checkout. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  function rupiah(value: string | number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value));
  }

  if (loading) {
    return (
      <main className="checkout-page">
        <div className="checkout-container">
          <h1>Checkout</h1>
          <p>Memuat checkout...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="checkout-page">
        <div className="checkout-container">
          <h1>Checkout</h1>

          <p>{error}</p>

          <button
            type="button"
            onClick={fetchCheckout}
          >
            Coba Lagi
          </button>
        </div>
      </main>
    );
  }

  if (!checkout) {
    return (
      <main className="checkout-page">
        <div className="checkout-container">
          <h1>Checkout</h1>
          <p>Data checkout tidak tersedia.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">

        <h1>Checkout HostingWeb</h1>

        <p>
          Periksa pesanan sebelum melakukan pembayaran.
        </p>

        <div className="checkout-grid">

          <section className="checkout-items">

            <h2>Domain yang Dibeli</h2>

            {checkout.items.map((item) => (
              <div
                key={item.cart_id}
                className="item-card"
              >
                <div>
                  <h3>{item.domain_name}</h3>

                  <span>
                    {item.extension}
                  </span>
                </div>

                <strong>
                  {rupiah(item.price)}
                </strong>
              </div>
            ))}

          </section>

          <aside className="summary-card">

            <h2>Ringkasan Pembayaran</h2>

            <div className="summary-row">
              <span>Subtotal</span>

              <strong>
                {rupiah(checkout.subtotal)}
              </strong>
            </div>

            <div className="summary-row">
              <span>PPN (11%)</span>

              <strong>
                {rupiah(checkout.ppn)}
              </strong>
            </div>

            <hr />

            <div className="summary-row total-row">
              <span>Total</span>

              <strong>
                {rupiah(checkout.total)}
              </strong>
            </div>

            <button
              type="button"
              className="checkout-btn"
              onClick={handleProceedToInvoice}
              disabled={submitting}
            >
              {submitting ? "Memproses..." : "Lanjut ke Invoice"}
            </button>

          </aside>

        </div>

      </div>
    </main>
  );
}