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

      <style jsx global>{`
        .checkout-page {
          background: #fcfcfd;
          min-height: 100vh;
          padding: 80px 20px;
          color: #1a1e29;
        }

        .checkout-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .checkout-container h1 {
          font-size: 28px;
          font-weight: 800;
          color: #11143d;
          margin-bottom: 6px;
        }

        .checkout-container p {
          font-size: 14px;
          color: #7d8590;
          margin-bottom: 40px;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 30px;
          align-items: start;
        }

        .checkout-items {
          background: white;
          border: 1px solid #eef0f3;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }

        .checkout-items h2 {
          font-size: 16px;
          font-weight: 700;
          color: #11143d;
          margin-bottom: 24px;
          border-bottom: 1px solid #eef0f3;
          padding-bottom: 12px;
        }

        .item-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fafbfc;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 16px;
        }

        .item-card:last-child {
          margin-bottom: 0;
        }

        .item-card h3 {
          font-size: 14px;
          font-weight: 700;
          color: #1a1e29;
          margin-bottom: 4px;
        }

        .item-card span {
          font-size: 10px;
          font-weight: 700;
          background: #ecfdf5;
          color: #047857;
          padding: 3px 8px;
          border-radius: 99px;
          text-transform: uppercase;
        }

        .item-card strong {
          font-size: 15px;
          color: #11143d;
        }

        .summary-card {
          background: white;
          border: 1px solid #eef0f3;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }

        .summary-card h2 {
          font-size: 16px;
          font-weight: 700;
          color: #11143d;
          margin-bottom: 24px;
          border-bottom: 1px solid #eef0f3;
          padding-bottom: 12px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #4a5568;
          margin-bottom: 14px;
        }

        .summary-row hr {
          border: none;
          height: 1px;
          background: #eef0f3;
          margin: 20px 0;
        }

        .total-row {
          font-size: 14px;
          color: #11143d;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .total-row strong {
          font-size: 18px;
          color: #f7931e;
        }

        .checkout-btn {
          width: 100%;
          background: #f7931e;
          color: white;
          font-size: 13px;
          font-weight: 700;
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s ease;
          box-shadow: 0 4px 10px rgba(247, 147, 30, 0.2);
        }

        .checkout-btn:hover {
          background: #ffad32;
        }

        .checkout-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          box-shadow: none;
        }

        .checkout-page .checkout-container button[type="button"] {
          background: #f7931e;
          color: white;
          font-size: 12px;
          font-weight: 700;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .checkout-page .checkout-container button[type="button"]:hover {
          background: #ffad32;
        }

        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}