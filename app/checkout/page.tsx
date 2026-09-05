"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* =========================================================
   TYPE CHECKOUT ITEM
========================================================= */

type CheckoutItem = {
  cart_id: number;
  domain_id: number;
  domain_name: string;
  extension: string;
  price: number;
};


/* =========================================================
   TYPE CHECKOUT DATA
========================================================= */

type CheckoutData = {
  items: CheckoutItem[];
  subtotal: string;
  ppn: string;
  total: string;
};


/* =========================================================
   TYPE COUPON RESPONSE
========================================================= */

type CouponResponse = {
  status: string;
  code: number;
  message: string;

  data?: {
    coupon?: {
      id: number;
      code: string;
      discount_type: string;
      discount_value: string | number;
    };

    subtotal?: string;
    discount?: string;
    after_discount?: string;
  };
};


/* =========================================================
   TYPE ORDER RESPONSE
========================================================= */

type OrderResponse = {
  status: string;
  code: number;
  message: string;

  data?: {
    order_id?: number;
    order_number?: string;
    subtotal?: string;
    discount?: string;
    after_discount?: string;
    ppn?: string;
    total?: string;
    status?: string;
    service_status?: string;
    start_date?: string | null;
    expiry_date?: string | null;

    coupon?: {
      id: number;
      code: string;
    } | null;
  };
};

/* =========================================================
   TYPE PAYMENT RESPONSE
========================================================= */

type PaymentResponse = {
  status: string;
  code: number;
  message: string;

  data?: {
    payment_id?: number | null;
    payment_number?: string;
    order_id?: number;
    order_number?: string;
    amount?: string;
    payment_method?: string;
    status?: string;
    invoice_id?: number | null;
    invoice_number?: string | null;
  };
};


/* =========================================================
   API
========================================================= */

const CHECKOUT_API =
  "http://localhost/hosting_webid/api/v1/checkout/index.php";

const COUPON_VALIDATE_API =
  "http://localhost/hosting_webid/api/v1/admin/coupon/validate.php";

const ORDER_CREATE_API =
  "http://localhost/hosting_webid/api/v1/order/create.php";

const PAYMENT_API =
  "http://localhost/hosting_webid/api/v1/payment/index.php";


/* =========================================================
   HELPER RESPONSE
========================================================= */

/**
 * Membaca response API dengan aman.
 *
 * Kalau server mengirim JSON:
 *     langsung di-parse.
 *
 * Kalau server mengirim HTML/PHP error:
 *     jangan muncul "Unexpected token <".
 *     Kita tampilkan pesan server.
 */
async function readApiResponse<T>(
  response: Response
): Promise<T> {

  const text =
    await response.text();

  if (!text.trim()) {
    throw new Error(
      `Server tidak mengembalikan response. HTTP ${response.status}`
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    const temporaryElement = document.createElement("div");
    temporaryElement.innerHTML = text;
    const cleanText = temporaryElement.textContent
      ?.replace(/\s+/g, " ")
      .trim();

    console.error("API mengembalikan non-JSON:", text);

    throw new Error(
      cleanText
        ? cleanText.substring(0, 1000)
        : `Server mengembalikan response tidak valid. HTTP ${response.status}`
    );
  }
}


  /* =========================================================
    PAGE
  ========================================================= */

  export default function CheckoutPage() {

    /* =======================================================
      CHECKOUT
    ======================================================= */

    const router =
      useRouter();

    const [checkout, setCheckout] =
      useState<CheckoutData | null>(null);

    const [loading, setLoading] =
      useState(true);

    const [error, setError] =
      useState("");

    const [submitting, setSubmitting] =
      useState(false);


  /* =======================================================
     VOUCHER
  ======================================================= */

  const [couponCode, setCouponCode] =
    useState("");

  const [couponLoading, setCouponLoading] =
    useState(false);

  const [couponError, setCouponError] =
    useState("");

  const [couponMessage, setCouponMessage] =
    useState("");

  const [couponDiscount, setCouponDiscount] =
    useState(0);

  const [couponApplied, setCouponApplied] =
    useState(false);


  /* =======================================================
     ORDER
  ======================================================= */

  const [orderSuccess, setOrderSuccess] =
    useState("");

  const [createdOrderId, setCreatedOrderId] =
    useState<number | null>(null);

  const [createdOrderNumber, setCreatedOrderNumber] =
    useState("");

  const [paymentId, setPaymentId] =
  useState<number | null>(null);

  const [paymentNumber, setPaymentNumber] =
    useState("");

  const [paymentStatus, setPaymentStatus] =
    useState("");

  const [paymentAmount, setPaymentAmount] =
    useState(0);

  const [invoiceId, setInvoiceId] =
    useState<number | null>(null);

  const [copiedAccount, setCopiedAccount] =
  useState("");


  /* =======================================================
   CEK AKSES CHECKOUT
   ADMIN TIDAK BOLEH CHECKOUT
  ======================================================= */

  useEffect(() => {

    const savedUser =
      localStorage.getItem(
        "hostingwebid_user"
      );


    /* =====================================================
      TIDAK ADA SESSION
    ===================================================== */

    if (!savedUser) {

      router.replace("/login");

      return;

    }


    try {

      const parsedUser =
        JSON.parse(savedUser);


      /* ===================================================
        ADMIN TIDAK BOLEH CHECKOUT
      =================================================== */

      if (
        parsedUser?.role === "admin"
      ) {

        router.replace("/admin");

        return;

      }


      /* ===================================================
        USER HARUS ROLE USER
      =================================================== */

      if (
        parsedUser?.role !== "user"
      ) {

        router.replace("/login");

        return;

      }

      setTimeout(() => {
        void fetchCheckout();
      }, 0);


    } catch (error) {

      console.error(
        "Gagal membaca session checkout:",
        error
      );


      localStorage.removeItem(
        "hostingwebid_user"
      );

      localStorage.removeItem(
        "hostingweb_auth"
      );


      router.replace("/login");

    }

  }, [router]);


 /* =======================================================
   FETCH CHECKOUT
   HANYA UNTUK USER
    ======================================================= */

    async function fetchCheckout() {

      try {

        setLoading(true);

        setError("");


        /* =====================================================
          PASTIKAN SESSION MASIH USER
        ===================================================== */

        const savedUser =
          localStorage.getItem(
            "hostingwebid_user"
          );


        if (!savedUser) {

          router.replace("/login");

          return;

        }


        let parsedUser: { role?: string };


        try {

          parsedUser =
            JSON.parse(savedUser);

        } catch {

          localStorage.removeItem(
            "hostingwebid_user"
          );

          localStorage.removeItem(
            "hostingweb_auth"
          );

          router.replace("/login");

          return;

        }


        /* =====================================================
          ADMIN TIDAK BOLEH MEMANGGIL CHECKOUT
        ===================================================== */

        if (
          parsedUser?.role === "admin"
        ) {

          router.replace("/admin");

          return;

        }


        /* =====================================================
          ROLE HARUS USER
        ===================================================== */

        if (
          parsedUser?.role !== "user"
        ) {

          router.replace("/login");

          return;

        }


        /* =====================================================
          REQUEST CHECKOUT
        ===================================================== */

        const response =
          await fetch(
            CHECKOUT_API,
            {
              method: "GET",

              credentials: "include",

              headers: {
                Accept:
                  "application/json",
              },

              cache:
                "no-store",
            }
          );


        /* =====================================================
          BACA RESPONSE
        ===================================================== */

        const result =
          await readApiResponse<{
            status: string;
            code: number;
            message: string;
            data?: CheckoutData;
          }>(
            response
          );


        /* =====================================================
          SESSION TIDAK BERHAK
        ===================================================== */

        if (
          response.status === 401 ||
          response.status === 403
        ) {

          router.replace("/login");

          return;

        }


        /* =====================================================
          VALIDASI RESPONSE
        ===================================================== */

        if (
          !response.ok ||
          result.status !==
            "success"
        ) {

          throw new Error(
            result.message ||
            "Gagal mengambil data checkout."
          );

        }


        /* =====================================================
          SIMPAN DATA CHECKOUT
        ===================================================== */

        setCheckout(
          result.data ?? null
        );


      } catch (error) {

        console.error(
          "Checkout Error:",
          error
        );


        setError(
          error instanceof Error
            ? error.message
            : "Tidak dapat mengambil data checkout."
        );


      } finally {

        setLoading(false);

      }

    }

  /* =======================================================
     TERAPKAN VOUCHER
  ======================================================= */

  async function applyCoupon() {

    try {

      setCouponLoading(true);

      setCouponError("");

      setCouponMessage("");


      if (
        !couponCode.trim()
      ) {

        setCouponError(
          "Masukkan kode voucher."
        );

        return;
      }


      if (!checkout) {

        setCouponError(
          "Data checkout belum tersedia."
        );

        return;
      }


      const response =
        await fetch(
          COUPON_VALIDATE_API,
          {
            method: "POST",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body:
              JSON.stringify({
                code:
                  couponCode
                    .trim()
                    .toUpperCase(),

                subtotal:
                  Number(
                    checkout.subtotal
                  ),
              }),
          }
        );


      const result =
        await readApiResponse<CouponResponse>(
          response
        );


      if (
        !response.ok ||
        result.status !==
          "success"
      ) {

        throw new Error(
          result.message ||
          "Voucher tidak dapat digunakan."
        );
      }


      const discount =
        Number(
          result.data?.discount ??
          0
        );


      setCouponDiscount(
        discount
      );


      setCouponApplied(
        true
      );


      setCouponMessage(
        `Voucher ${
          result.data?.coupon?.code ??
          couponCode
            .trim()
            .toUpperCase()
        } berhasil digunakan.`
      );


    } catch (error) {

      console.error(
        "Coupon Error:",
        error
      );


      setCouponDiscount(0);

      setCouponApplied(
        false
      );


      setCouponError(
        error instanceof Error
          ? error.message
          : "Voucher tidak dapat digunakan."
      );


    } finally {

      setCouponLoading(
        false
      );

    }
  }


  /* =======================================================
     HAPUS VOUCHER
  ======================================================= */

  function removeCoupon() {

    setCouponCode("");

    setCouponDiscount(0);

    setCouponApplied(
      false
    );

    setCouponError("");

    setCouponMessage("");

  }




  /* =======================================================
   BUAT ORDER + PAYMENT
======================================================= */

async function handleCreateOrder() {

  if (!checkout) {

    setError(
      "Data checkout belum tersedia."
    );

    return;
  }


  try {

    /* =====================================================
       MULAI PROSES
    ===================================================== */

    setSubmitting(true);

    setError("");

    setOrderSuccess("");


    /* =====================================================
       RESET ORDER
    ===================================================== */

    setCreatedOrderId(
      null
    );

    setCreatedOrderNumber(
      ""
    );


    /* =====================================================
       RESET PAYMENT
    ===================================================== */

    setPaymentId(
      null
    );

    setPaymentNumber(
      ""
    );

    setPaymentStatus(
      ""
    );

    setPaymentAmount(
      0
    );

    setInvoiceId(null);


    /* =====================================================
       DATA ORDER
    ===================================================== */

    const requestBody = {

      coupon_code:
        couponApplied
          ? couponCode
              .trim()
              .toUpperCase()
          : null,

    };


    console.log(
      "CREATE ORDER REQUEST:",
      requestBody
    );


    /* =====================================================
       CREATE ORDER
    ===================================================== */

    const response =
      await fetch(
        ORDER_CREATE_API,
        {
          method: "POST",

          credentials:
            "include",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body:
            JSON.stringify(
              requestBody
            ),
        }
      );


    /* =====================================================
       BACA RESPONSE ORDER
    ===================================================== */

    const result =
      await readApiResponse<OrderResponse>(
        response
      );


    console.log(
      "CREATE ORDER RESPONSE:",
      result
    );


    /* =====================================================
       VALIDASI ORDER
    ===================================================== */

    if (
      !response.ok ||
      result.status !==
        "success"
    ) {

      throw new Error(
        result.message ||
        "Gagal membuat pesanan."
      );

    }


    /* =====================================================
       AMBIL ORDER ID
    ===================================================== */

    const orderId =
      Number(
        result.data?.order_id
      );


    if (
      !Number.isFinite(
        orderId
      ) ||
      orderId <= 0
    ) {

      throw new Error(
        "Order berhasil dibuat tetapi ID order tidak valid."
      );

    }


    setCreatedOrderId(
      orderId
    );


    /* =====================================================
       AMBIL ORDER NUMBER
    ===================================================== */

    setCreatedOrderNumber(
      result.data?.order_number
      ?? ""
    );


    /* =====================================================
       BUAT PAYMENT PENDING
       
       Payment menggunakan:
       order_id
       payment_method = transfer

       Invoice belum dibuat.
    ===================================================== */

    const paymentResponse =
      await fetch(
        PAYMENT_API,
        {
          method: "POST",

          credentials:
            "include",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body:
            JSON.stringify({
              order_id:
                orderId,

              payment_method:
                "transfer",
            }),
        }
      );


    /* =====================================================
       BACA RESPONSE PAYMENT
    ===================================================== */

    const paymentResult =
      await readApiResponse<PaymentResponse>(
        paymentResponse
      );


    console.log(
      "CREATE PAYMENT RESPONSE:",
      paymentResult
    );


    /* =====================================================
       VALIDASI PAYMENT
       
       HTTP 201 = payment baru dibuat

       HTTP 409 = payment pending sudah ada.
       Ini tetap boleh digunakan karena payment
       tersebut sudah tersedia untuk order tersebut.
    ===================================================== */

    const paymentAccepted =
      paymentResponse.ok ||
      paymentResult.code === 409;


    if (
      !paymentAccepted ||
      (
        paymentResult.status !==
          "success" &&
        paymentResult.code !==
          409
      )
    ) {

      throw new Error(
        paymentResult.message ||
        "Order berhasil dibuat, tetapi payment gagal dibuat."
      );

    }


    /* =====================================================
       AMBIL DATA PAYMENT
    ===================================================== */

    const paymentData =
      paymentResult.data;


    /* =====================================================
       PAYMENT ID
    ===================================================== */

    if (
      paymentData?.payment_id
    ) {

      setPaymentId(
        Number(
          paymentData.payment_id
        )
      );

    }


    /* =====================================================
       PAYMENT NUMBER
    ===================================================== */

    setPaymentNumber(
      paymentData?.payment_number
      ?? ""
    );


    /* =====================================================
       PAYMENT STATUS
    ===================================================== */

    setPaymentStatus(
      paymentData?.status
      ?? "pending"
    );


    /* =====================================================
       PAYMENT AMOUNT
    ===================================================== */

    const amount =
      Number(
        paymentData?.amount
        ?? calculatedTotal
      );


    setPaymentAmount(
      amount
    );

    setInvoiceId(
      paymentData?.invoice_id
        ? Number(paymentData.invoice_id)
        : null
    );


    /* =====================================================
       CEK DATA PAYMENT
    ===================================================== */

    if (
      !paymentData?.payment_number
    ) {

      throw new Error(
        "Payment berhasil diproses tetapi nomor payment tidak ditemukan."
      );

    }


    /* =====================================================
       SUCCESS
    ===================================================== */

    setOrderSuccess(
      "Pesanan berhasil dibuat dan menunggu pembayaran."
    );


  } catch (error) {

    console.error(
      "Create Order Error:",
      error
    );


    setError(
      error instanceof Error
        ? error.message
        : "Tidak dapat membuat pesanan."
    );


  } finally {

    setSubmitting(
      false
    );

  }

}

  useEffect(() => {
    if (!paymentId || paymentStatus.toLowerCase() === "paid") {
      return;
    }

    let active = true;

    const refreshPaymentStatus = async () => {
      try {
        const response = await fetch(
          `${PAYMENT_API}?payment_id=${paymentId}`,
          {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
            cache: "no-store",
          }
        );
        const result = await readApiResponse<PaymentResponse>(response);
        const latestPayment = result.data;

        if (!active || !latestPayment) return;

        setPaymentStatus(latestPayment.status || "pending");
        setInvoiceId(
          latestPayment.invoice_id
            ? Number(latestPayment.invoice_id)
            : null
        );
      } catch (error) {
        console.error("Gagal memperbarui status payment:", error);
      }
    };

    void refreshPaymentStatus();
    const interval = window.setInterval(refreshPaymentStatus, 10000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [paymentId, paymentStatus]);

/* =======================================================
   COPY NOMOR REKENING
======================================================= */

async function handleCopyAccount(
  accountNumber: string,
  bankName: string
) {

  try {

    await navigator.clipboard.writeText(
      accountNumber
    );

    setCopiedAccount(
      bankName
    );

    setTimeout(() => {

      setCopiedAccount("");

    }, 1800);

  } catch (error) {

    console.error(
      "Gagal menyalin nomor rekening:",
      error
    );

  }

}


  /* =======================================================
     FORMAT RUPIAH
  ======================================================= */

  function rupiah(
    value: string | number
  ) {

    return new Intl.NumberFormat(
      "id-ID",
      {
        style:
          "currency",

        currency:
          "IDR",

        minimumFractionDigits:
          0,
      }
    ).format(
      Number(value) || 0
    );
  }

  


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (
      <main className="checkout-page">

        <div className="checkout-container">

          <h1>
            Checkout
          </h1>

          <p>
            Memuat checkout...
          </p>

        </div>

      </main>
    );
  }


  /* =======================================================
     ERROR CHECKOUT AWAL
  ======================================================= */

  if (
    error &&
    !checkout
  ) {

    return (
      <main className="checkout-page">

        <div className="checkout-container">

          <h1>
            Checkout
          </h1>

          <div className="general-error">
            {error}
          </div>

          <button
            type="button"
            onClick={
              fetchCheckout
            }
          >
            Coba Lagi
          </button>

        </div>

      </main>
    );
  }


  /* =======================================================
     CHECKOUT NULL
  ======================================================= */

  if (!checkout) {

    return (
      <main className="checkout-page">

        <div className="checkout-container">

          <h1>
            Checkout
          </h1>

          <p>
            Data checkout tidak tersedia.
          </p>

        </div>

      </main>
    );
  }


  /* =======================================================
     PERHITUNGAN TOTAL
  ======================================================= */

  const subtotalValue =
    Number(
      checkout.subtotal
    ) || 0;


  const discountedSubtotal =
    Math.max(
      subtotalValue -
        couponDiscount,
      0
    );


  /**
   * PPN dihitung setelah diskon.
   */
  const calculatedPpn =
    discountedSubtotal *
    0.11;


  const calculatedTotal =
    discountedSubtotal +
    calculatedPpn;


  
  /* =======================================================
    KONFIRMASI PEMBAYARAN VIA WHATSAPP
  ======================================================= */

  async function handleWhatsAppConfirmation() {

    if (paymentId) {
      try {
        await fetch(
          "http://localhost/hosting_webid/api/v1/payment/request-confirmation.php",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ payment_id: paymentId }),
          }
        );
      } catch (error) {
        console.error("Gagal mencatat konfirmasi WhatsApp:", error);
      }
    }

    const adminWhatsApp =
      "6285333555976";


    const message = [
      "Hallo admin saya sudah melakukan payment.",
      "",
      `Nomor Order: ${createdOrderNumber || "-"}`,
      `Nomor Payment: ${paymentNumber || "-"}`,
      `Total Pembayaran: ${rupiah(paymentAmount)}`,
      "",
      "Saya sudah melakukan transfer sesuai total pembayaran.",
      "",
      "Saya lampirkan bukti transfer pada chat ini.",
      "",
      "Mohon dibantu untuk mengecek dan memverifikasi pembayaran saya.",
      "",
      "Terima kasih."
    ].join("\n");


    const whatsappUrl =
      `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(
        message
      )}`;


    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }


  /* =======================================================
     UI
  ======================================================= */

    return (
    <main className="checkout-page">

      <div className="checkout-container">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="checkout-header">

          <span className="checkout-eyebrow">
            CHECKOUT
          </span>

          <h1>
            Checkout HostingWeb
          </h1>

          <p>
            Periksa pesanan sebelum melakukan pembayaran.
          </p>

        </header>


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (

          <div className="general-error">

            <span className="general-error-icon">
              !
            </span>

            <span>
              {error}
            </span>

          </div>

        )}


        {/* =====================================================
            SEBELUM ORDER
        ===================================================== */}

        {!orderSuccess ? (

          <div className="checkout-grid">

            {/* =================================================
                ITEMS
            ================================================= */}

            <section className="checkout-items">

              <div className="section-heading">

                <span className="section-eyebrow">
                  ORDER
                </span>

                <h2>
                  Domain yang Dibeli
                </h2>

              </div>


              {checkout.items.length > 0 ? (

                <div className="checkout-item-list">

                  {checkout.items.map(
                    (item) => (

                      <div
                        key={item.cart_id}
                        className="item-card"
                      >

                        <div className="item-information">

                          <h3>
                            {item.domain_name}
                          </h3>

                          <span>
                            {item.extension}
                          </span>

                        </div>


                        <strong>
                          {rupiah(
                            item.price
                          )}
                        </strong>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="empty-checkout">

                  Tidak ada item checkout.

                </div>

              )}

            </section>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <aside className="summary-card">

              <div className="section-heading">

                <span className="section-eyebrow">
                  ORDER SUMMARY
                </span>

                <h2>
                  Ringkasan Pembayaran
                </h2>

              </div>


              {/* =================================================
                  VOUCHER
              ================================================= */}

              <div className="coupon-box">

                <label
                  htmlFor="coupon"
                >
                  Kode Voucher
                </label>


                <div className="coupon-input-row">

                  <input
                    id="coupon"
                    type="text"

                    value={couponCode}

                    onChange={(e) => {

                      setCouponCode(
                        e.target.value.toUpperCase()
                      );

                      setCouponError("");
                      setCouponMessage("");

                    }}

                    placeholder="Masukkan kode voucher"

                    disabled={
                      couponLoading ||
                      couponApplied ||
                      submitting
                    }
                  />


                  {!couponApplied ? (

                    <button
                      type="button"

                      onClick={applyCoupon}

                      disabled={
                        couponLoading ||
                        submitting
                      }
                    >

                      {couponLoading
                        ? "Memeriksa..."
                        : "Pakai"}

                    </button>

                  ) : (

                    <button
                      type="button"

                      className="remove-coupon-btn"

                      onClick={removeCoupon}

                      disabled={
                        submitting
                      }
                    >

                      Hapus

                    </button>

                  )}

                </div>


                {couponError && (

                  <div className="coupon-error">

                    {couponError}

                  </div>

                )}


                {couponMessage && (

                  <div className="coupon-success">

                    {couponMessage}

                  </div>

                )}

              </div>


              {/* =================================================
                  SUBTOTAL
              ================================================= */}

              <div className="summary-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  {rupiah(
                    subtotalValue
                  )}
                </strong>

              </div>


              {/* =================================================
                  DISKON
              ================================================= */}

              {couponDiscount > 0 && (

                <div className="summary-row discount-row">

                  <span>
                    Diskon Voucher
                  </span>

                  <strong>
                    -{" "}
                    {rupiah(
                      couponDiscount
                    )}
                  </strong>

                </div>

              )}


              {/* =================================================
                  SETELAH DISKON
              ================================================= */}

              <div className="summary-row">

                <span>
                  Setelah Diskon
                </span>

                <strong>
                  {rupiah(
                    discountedSubtotal
                  )}
                </strong>

              </div>


              {/* =================================================
                  PPN
              ================================================= */}

              <div className="summary-row">

                <span>
                  PPN (11%)
                </span>

                <strong>
                  {rupiah(
                    calculatedPpn
                  )}
                </strong>

              </div>


              <div className="summary-divider" />


              {/* =================================================
                  TOTAL
              ================================================= */}

              <div className="summary-row total-row">

                <span>
                  Total
                </span>

                <strong>
                  {rupiah(
                    calculatedTotal
                  )}
                </strong>

              </div>


              {/* =================================================
                  CREATE ORDER
              ================================================= */}

              <button
                type="button"

                className="checkout-btn"

                onClick={
                  handleCreateOrder
                }

                disabled={
                  submitting
                }
              >

                {submitting
                  ? "Memproses..."
                  : "Buat Pesanan"}

              </button>


              <p className="payment-note">

                Setelah pesanan dibuat, pembayaran akan
                menunggu konfirmasi admin.

              </p>

            </aside>

          </div>

        ) : (

          /* =====================================================
             SETELAH ORDER BERHASIL
          ===================================================== */

          <>

            {/* =================================================
                SUCCESS
            ================================================= */}

            <div className="order-success-modern">

              <div className="success-check">
                ✓
              </div>


              <div className="success-content">

                <strong>
                  Pesanan berhasil dibuat
                </strong>

                <p>
                  Pesanan kamu telah dibuat dan menunggu
                  pembayaran.
                </p>


                <div className="success-reference">

                  <div>

                    <span>
                      Nomor Order
                    </span>

                    <strong>
                      {createdOrderNumber}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Order ID
                    </span>

                    <strong>
                      #{createdOrderId}
                    </strong>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                PAYMENT
            ================================================= */}

            {paymentNumber && (

              <section className="payment-modern">

                {/* HEADER */}

                <div className="payment-modern-top">

                  <div>

                    <span className="payment-eyebrow">
                      PEMBAYARAN
                    </span>

                    <h2>
                      {paymentStatus.toLowerCase() === "paid"
                        ? "Pembayaran Berhasil"
                        : "Selesaikan Pembayaran"}
                    </h2>

                    <p>
                      {paymentStatus.toLowerCase() === "paid"
                        ? "Pembayaran telah diverifikasi oleh admin."
                        : "Transfer sesuai nominal pembayaran ke salah satu rekening berikut."}
                    </p>

                  </div>


                  <div className="payment-status-pill">

                    <span className="payment-status-dot" />

                    {paymentStatus.toLowerCase() === "paid"
                      ? "Pembayaran Dikonfirmasi"
                      : "Menunggu Pembayaran"}

                  </div>

                </div>


                {/* =================================================
                    PAYMENT SUMMARY
                ================================================= */}

                <div className="payment-summary">

                  <div className="payment-summary-main">

                    <span>
                      Total pembayaran
                    </span>

                    <strong>
                      {rupiah(
                        paymentAmount
                      )}
                    </strong>

                  </div>


                  <div className="payment-summary-meta">

                    <div>

                      <span>
                        Nomor Order
                      </span>

                      <strong>
                        {createdOrderNumber}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Nomor Payment
                      </span>

                      <strong>
                        {paymentNumber}
                      </strong>

                    </div>

                  </div>

                </div>


                {paymentStatus.toLowerCase() === "paid" ? (
                  <div className="payment-confirmed-panel">
                    <div className="payment-confirmed-icon">✓</div>
                    <strong>Pembayaran berhasil dikonfirmasi</strong>
                    <p>Pesanan dan layanan kamu sudah aktif.</p>
                    <div className="payment-confirmed-actions">
                      <Link
                        href={invoiceId ? `/dashboard/invoices?id=${invoiceId}` : "/dashboard/invoices"}
                        className="payment-confirmed-button primary"
                      >
                        Lihat Invoice
                      </Link>
                      <Link
                        href="/dashboard"
                        className="payment-confirmed-button secondary"
                      >
                        Buka Dashboard
                      </Link>
                    </div>
                  </div>
                ) : (
                <>

                {/* =================================================
                    REKENING PEMBAYARAN
                ================================================= */}

                <div className="payment-bank-area">

                  <div className="payment-bank-title">

                    <div>

                      <span className="payment-bank-eyebrow">
                        TRANSFER BANK
                      </span>

                      <h3>
                        Rekening Pembayaran
                      </h3>

                      <p>
                        Transfer sesuai total pembayaran ke salah satu
                        rekening berikut.
                      </p>

                    </div>


                    <div className="payment-bank-owner">

                      <span>
                        Atas Nama
                      </span>

                      <strong>
                        Irwanto
                      </strong>

                    </div>

                  </div>


                  {/* =================================================
                      DAFTAR REKENING
                  ================================================= */}

                  <div className="payment-bank-list">


                    {/* ================= BCA ================= */}

                    <div className="payment-bank-row">

                      <div className="bank-logo bank-logo-bca">
                        <img
                          src="/bank-logos/bca.png"
                          alt="Logo Bank BCA"
                        />
                      </div>


                      <div className="bank-account-info">

                        <span className="bank-label">
                          Nomor Rekening
                        </span>

                        <div className="bank-number-copy">

                          <strong>
                            8735105848
                          </strong>

                          <button
                            type="button"
                            className="copy-account-button"
                            onClick={() =>
                              handleCopyAccount(
                                "8735105848",
                                "BCA"
                              )
                            }
                          >
                            <span>
                              {copiedAccount === "BCA"
                                ? "✓"
                                : "⧉"}
                            </span>

                            {copiedAccount === "BCA"
                              ? "Tersalin"
                              : "Salin"}
                          </button>

                        </div>

                      </div>


                      <div className="bank-owner">

                        <span>
                          Pemilik Rekening
                        </span>

                        <strong>
                          Irwanto
                        </strong>

                      </div>

                    </div>


                    {/* ================= BRI ================= */}

                    <div className="payment-bank-row">

                    <div className="bank-logo bank-logo-bri">
                      <img
                        src="/bank-logos/bri.png"
                        alt="Logo Bank BRI"
                      />
                    </div>


                      <div className="bank-account-info">

                        <span className="bank-label">
                          Nomor Rekening
                        </span>

                        <div className="bank-number-copy">

                          <strong>
                            490501014725533
                          </strong>

                          <button
                            type="button"
                            className="copy-account-button"
                            onClick={() =>
                              handleCopyAccount(
                                "4905-01-014725-53-3",
                                "BRI"
                              )
                            }
                          >
                            <span>
                              {copiedAccount === "BRI"
                                ? "✓"
                                : "⧉"}
                            </span>

                            {copiedAccount === "BRI"
                              ? "Tersalin"
                              : "Salin"}
                          </button>

                        </div>

                      </div>


                      <div className="bank-owner">

                        <span>
                          Pemilik Rekening
                        </span>

                        <strong>
                          Irwanto
                        </strong>

                      </div>

                    </div>


                    {/* ================= MANDIRI ================= */}

                    <div className="payment-bank-row">

                      <div className="bank-logo bank-logo-mandiri">
                        <img
                          src="/bank-logos/mandiri.png"
                          alt="Logo Bank Mandiri"
                        />
                      </div>


                      <div className="bank-account-info">

                        <span className="bank-label">
                          Nomor Rekening
                        </span>

                        <div className="bank-number-copy">

                          <strong>
                            1740002093110
                          </strong>

                          <button
                            type="button"
                            className="copy-account-button"
                            onClick={() =>
                              handleCopyAccount(
                                "174-00-02093110",
                                "MANDIRI"
                              )
                            }
                          >
                            <span>
                              {copiedAccount === "MANDIRI"
                                ? "✓"
                                : "⧉"}
                            </span>

                            {copiedAccount === "MANDIRI"
                              ? "Tersalin"
                              : "Salin"}
                          </button>

                        </div>

                      </div>


                      <div className="bank-owner">

                        <span>
                          Pemilik Rekening
                        </span>

                        <strong>
                          Irwanto
                        </strong>

                      </div>

                    </div>


                    {/* ================= BNI ================= */}

                    <div className="payment-bank-row">

                    <div className="bank-logo bank-logo-bni">
                      <img
                        src="/bank-logos/bni.png"
                        alt="Logo Bank BNI"
                      />
                    </div>

                      <div className="bank-account-info">

                        <span className="bank-label">
                          Nomor Rekening
                        </span>

                        <div className="bank-number-copy">

                          <strong>
                            0671541810
                          </strong>

                          <button
                            type="button"
                            className="copy-account-button"
                            onClick={() =>
                              handleCopyAccount(
                                "0671541810",
                                "BNI"
                              )
                            }
                          >
                            <span>
                              {copiedAccount === "BNI"
                                ? "✓"
                                : "⧉"}
                            </span>

                            {copiedAccount === "BNI"
                              ? "Tersalin"
                              : "Salin"}
                          </button>

                        </div>

                      </div>


                      <div className="bank-owner">

                        <span>
                          Pemilik Rekening
                        </span>

                        <strong>
                          Irwanto
                        </strong>

                      </div>

                    </div>

                  </div>


                  {/* =================================================
                      PERINGATAN
                  ================================================= */}

                  <div className="payment-transfer-warning">

                    <div className="payment-transfer-warning-icon">
                      !
                    </div>


                    <div className="payment-transfer-warning-content">

                      <strong>
                        Perhatikan sebelum melakukan transfer
                      </strong>

                      <p>
                        Pastikan nomor rekening dan nama pemilik rekening
                        sudah sesuai sebelum melakukan pembayaran.
                        Kesalahan transfer ke rekening atau nama yang
                        tidak sesuai menjadi tanggung jawab pengirim dan
                        berada di luar tanggung jawab kami.
                      </p>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    NOTICE
                ================================================= */}

                <div className="payment-modern-note">

                  <div className="payment-note-icon">
                    !
                  </div>


                  <div>

                    <strong>
                      Setelah melakukan transfer
                    </strong>

                    <p>
                      Simpan bukti pembayaran.
                      Setelah transfer, lakukan
                      konfirmasi kepada admin agar
                      pembayaran dapat diverifikasi.
                    </p>

                  </div>

                </div>

                  {/* =================================================
                      WHATSAPP CONFIRMATION
                  ================================================= */}

                   <div className="payment-whatsapp">

                    <div className="payment-whatsapp-content">

                      <strong>
                        Sudah melakukan transfer?
                      </strong>

                      <p>
                        Konfirmasi kepada admin dan lampirkan
                        bukti transfer melalui WhatsApp.
                      </p>

                    </div>


                    <button
                      type="button"
                      className="payment-whatsapp-button"
                      onClick={handleWhatsAppConfirmation}
                    >
                      Konfirmasi via WhatsApp
                    </button>

                  </div>

                </>
                )}


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="payment-modern-footer">

                  <div>

                    <span>
                      Status pembayaran
                    </span>

                    <strong>
                      {paymentStatus.toLowerCase() === "paid"
                        ? "PAID"
                        : "PENDING"}
                    </strong>

                  </div>


                  <span className="payment-footer-hint">
                    {paymentStatus.toLowerCase() === "paid"
                      ? "Dikonfirmasi admin"
                      : "Belum dikonfirmasi admin"}
                  </span>

                </div>

              </section>

            )}

          </>

        )}

      </div>


      {/* =====================================================
          GLOBAL STYLE
      ===================================================== */}

      <style jsx global>{`

        /* =====================================================
           PAGE
        ===================================================== */

        .checkout-page {
          min-height: 100vh;
          padding: 64px 24px 80px;
          background:
            linear-gradient(
              180deg,
              #fafbfc 0%,
              #ffffff 55%,
              #fafbfc 100%
            );
          color: #151a32;
        }


        .checkout-container {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .checkout-header {
          margin-bottom: 30px;
        }


        .checkout-eyebrow {
          display: block;
          margin-bottom: 7px;
          color: #f7931e;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.7px;
        }


        .checkout-header h1 {
          margin: 0 0 7px;
          color: #11143d;
          font-size: 32px;
          font-weight: 850;
          letter-spacing: -1px;
        }


        .checkout-header p {
          margin: 0;
          color: #7b8491;
          font-size: 13px;
          line-height: 1.7;
        }


        /* =====================================================
           ERROR
        ===================================================== */

        .general-error {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding: 12px 14px;
          background: #fff6f6;
          border: 1px solid #fecaca;
          border-radius: 10px;
          color: #b91c1c;
          font-size: 11px;
        }


        .general-error-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #fee2e2;
          font-size: 10px;
          font-weight: 800;
        }


        /* =====================================================
           SUCCESS
        ===================================================== */

        .order-success-modern {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          margin-bottom: 17px;
          padding: 17px 19px;
          background: #f0fdf8;
          border: 1px solid #c8efdc;
          border-radius: 13px;
        }


        .success-check {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #16a34a;
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
        }


        .success-content > strong {
          display: block;
          margin-bottom: 3px;
          color: #047857;
          font-size: 13px;
          font-weight: 800;
        }


        .success-content > p {
          margin: 0;
          color: #39705c;
          font-size: 10px;
          line-height: 1.6;
        }


        .success-reference {
          display: flex;
          flex-wrap: wrap;
          gap: 22px;
          margin-top: 9px;
        }


        .success-reference > div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }


        .success-reference span {
          color: #699080;
          font-size: 8px;
        }


        .success-reference strong {
          color: #075e46;
          font-size: 10px;
        }


        /* =====================================================
           CHECKOUT
        ===================================================== */

        .checkout-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            360px;
          gap: 24px;
          align-items: start;
        }


        .checkout-items,
        .summary-card {
          background: #ffffff;
          border: 1px solid #e8ecf1;
          border-radius: 16px;
          box-shadow:
            0 10px 28px
            rgba(17, 20, 61, 0.035);
        }


        .checkout-items {
          padding: 27px;
        }


        .summary-card {
          padding: 25px;
        }


        /* =====================================================
           HEADING
        ===================================================== */

        .section-heading {
          padding-bottom: 14px;
          margin-bottom: 17px;
          border-bottom: 1px solid #edf0f3;
        }


        .section-eyebrow {
          display: block;
          margin-bottom: 5px;
          color: #f7931e;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }


        .section-heading h2 {
          margin: 0;
          color: #11143d;
          font-size: 16px;
          font-weight: 800;
        }


        /* =====================================================
           ITEM
        ===================================================== */

        .checkout-item-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }


        .item-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 15px 17px;
          background: #fafbfc;
          border: 1px solid #edf0f3;
          border-radius: 10px;
        }


        .item-information h3 {
          margin: 0 0 4px;
          color: #11143d;
          font-size: 13px;
          font-weight: 750;
        }


        .item-information span {
          display: inline-block;
          padding: 3px 7px;
          background: #ecfdf5;
          border-radius: 999px;
          color: #047857;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
        }


        .item-card > strong {
          color: #11143d;
          font-size: 13px;
          white-space: nowrap;
        }


        .empty-checkout {
          padding: 25px;
          text-align: center;
          color: #94a3b8;
          font-size: 11px;
        }


        /* =====================================================
           COUPON
        ===================================================== */

        .coupon-box {
          margin-bottom: 20px;
          padding-bottom: 18px;
          border-bottom: 1px solid #edf0f3;
        }


        .coupon-box label {
          display: block;
          margin-bottom: 7px;
          color: #11143d;
          font-size: 10px;
          font-weight: 750;
        }


        .coupon-input-row {
          display: flex;
          gap: 7px;
        }


        .coupon-input-row input {
          flex: 1;
          min-width: 0;
          height: 40px;
          padding: 0 11px;
          border: 1px solid #dfe4ea;
          border-radius: 8px;
          background: #ffffff;
          color: #11143d;
          font-size: 11px;
          outline: none;
        }


        .coupon-input-row input:focus {
          border-color: #f7931e;
        }


        .coupon-input-row button {
          height: 40px;
          padding: 0 13px;
          border: none;
          border-radius: 8px;
          background: #f7931e;
          color: #ffffff;
          font-size: 10px;
          font-weight: 750;
          cursor: pointer;
        }


        .coupon-input-row button:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }


        .coupon-input-row .remove-coupon-btn {
          background: #dc2626;
        }


        .coupon-error {
          margin-top: 7px;
          color: #dc2626;
          font-size: 9px;
        }


        .coupon-success {
          margin-top: 7px;
          padding: 7px 9px;
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          border-radius: 7px;
          color: #047857;
          font-size: 9px;
        }


        /* =====================================================
           SUMMARY
        ===================================================== */

        .summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 12px;
          color: #667085;
          font-size: 11px;
        }


        .summary-row strong {
          color: #11143d;
        }


        .discount-row strong {
          color: #16a34a;
        }


        .summary-divider {
          height: 1px;
          margin: 18px 0;
          background: #edf0f3;
        }


        .total-row {
          margin-bottom: 20px;
          color: #11143d;
          font-size: 12px;
          font-weight: 750;
        }


        .total-row strong {
          color: #f7931e;
          font-size: 19px;
          font-weight: 850;
        }


        /* =====================================================
           BUTTON
        ===================================================== */

        .checkout-btn {
          width: 100%;
          height: 44px;
          border: none;
          border-radius: 9px;
          background: #f7931e;
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition:
            background 0.2s ease,
            transform 0.15s ease;
        }


        .checkout-btn:hover {
          background: #e9820c;
          transform: translateY(-1px);
        }


        .checkout-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          transform: none;
        }


        .payment-note {
          margin: 9px 0 0;
          color: #94a3b8;
          font-size: 9px;
          line-height: 1.6;
        }


        /* =====================================================
           PAYMENT
        ===================================================== */

        .payment-modern {
          width: 100%;
          padding: 30px 32px;
          background: #ffffff;
          border: 1px solid #e7ebf0;
          border-radius: 19px;
          box-shadow:
            0 14px 38px
            rgba(17, 20, 61, 0.045);
        }


        .payment-modern-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 25px;
          padding-bottom: 23px;
          border-bottom: 1px solid #edf0f3;
        }


        .payment-eyebrow {
          display: block;
          margin-bottom: 7px;
          color: #f7931e;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.6px;
        }


        .payment-modern-top h2 {
          margin: 0 0 6px;
          color: #11143d;
          font-size: 24px;
          font-weight: 850;
          letter-spacing: -0.6px;
        }


        .payment-modern-top p {
          margin: 0;
          color: #7c8592;
          font-size: 11px;
          line-height: 1.7;
        }


        .payment-status-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          padding: 8px 12px;
          background: #fff8ef;
          border: 1px solid #f7dfc4;
          border-radius: 999px;
          color: #c66b17;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
        }


        .payment-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #f7931e;
        }


        /* =====================================================
           PAYMENT SUMMARY
        ===================================================== */

        .payment-summary {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 15px;
          margin-top: 22px;
        }


        .payment-summary-main {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 103px;
          padding: 19px 21px;
          background: #fffaf4;
          border: 1px solid #f5dcc0;
          border-radius: 13px;
        }


        .payment-summary-main span {
          margin-bottom: 5px;
          color: #966131;
          font-size: 9px;
        }


        .payment-summary-main strong {
          color: #f7931e;
          font-size: 28px;
          font-weight: 850;
          letter-spacing: -0.6px;
        }


        .payment-summary-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }


        .payment-summary-meta > div {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 14px;
          background: #fafbfc;
          border: 1px solid #edf0f3;
          border-radius: 10px;
        }


        .payment-summary-meta span {
          margin-bottom: 5px;
          color: #929ba7;
          font-size: 8px;
        }


        .payment-summary-meta strong {
          color: #11143d;
          font-size: 10px;
          line-height: 1.5;
          word-break: break-word;
        }


        /* =====================================================
           BANK
        ===================================================== */

        .payment-bank-area {
          margin-top: 27px;
        }


        .payment-bank-title {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 13px;
        }


        .payment-bank-title h3 {
          margin: 0 0 4px;
          color: #11143d;
          font-size: 15px;
          font-weight: 800;
        }


        .payment-bank-title p {
          margin: 0;
          color: #89929e;
          font-size: 9px;
        }


        .payment-bank-title > span {
          color: #667085;
          font-size: 10px;
          white-space: nowrap;
        }


        /* =====================================================
           BANK LIST
        ===================================================== */

        .payment-bank-list {
          overflow: hidden;
          border: 1px solid #e7ebf0;
          border-radius: 13px;
        }


        .payment-bank-row {
          display: grid;
          grid-template-columns:
            105px
            minmax(0, 1fr)
            85px;
          align-items: center;
          gap: 18px;
          min-height: 76px;
          padding: 12px 17px;
          background: #ffffff;
          border-bottom: 1px solid #edf0f3;
          transition:
            background 0.2s ease;
        }


        .payment-bank-row:last-child {
          border-bottom: none;
        }


        .payment-bank-row:hover {
          background: #fcfcfd;
        }


        .bank-brand {
          color: #11143d;
          font-size: 14px;
          font-weight: 850;
        }


        .bank-account-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }


        .bank-account-info span {
          color: #929ba7;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.7px;
        }


        .bank-account-info strong {
          color: #11143d;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.15px;
          word-break: break-word;
        }


        .bank-owner {
          text-align: right;
          color: #667085;
          font-size: 10px;
        }


        /* =====================================================
           NOTICE
        ===================================================== */

        .payment-modern-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 18px;
          padding: 14px 15px;
          background: #f8fafc;
          border-radius: 10px;
        }


        .payment-note-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #e2e8f0;
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
        }


        .payment-modern-note strong {
          display: block;
          margin-bottom: 3px;
          color: #11143d;
          font-size: 10px;
        }


        .payment-modern-note p {
          margin: 0;
          color: #64748b;
          font-size: 10px;
          line-height: 1.6;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .payment-modern-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-top: 17px;
          padding-top: 16px;
          border-top: 1px solid #edf0f3;
        }


        .payment-modern-footer > div {
          display: flex;
          align-items: center;
          gap: 8px;
        }


        .payment-modern-footer > div span {
          color: #8d96a1;
          font-size: 9px;
        }


        .payment-modern-footer strong {
          padding: 5px 9px;
          background: #fff8ef;
          border-radius: 999px;
          color: #c56a18;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
        }


        .payment-footer-hint {
          color: #a0a8b3;
          font-size: 9px;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {

          .checkout-page {
            padding:
              42px 16px
              65px;
          }


          .checkout-header h1 {
            font-size: 27px;
          }


          .checkout-grid {
            grid-template-columns: 1fr;
          }


          .checkout-items,
          .summary-card {
            padding: 21px;
          }


          .payment-modern {
            padding: 21px 18px;
            border-radius: 16px;
          }


          .payment-modern-top {
            flex-direction: column;
          }


          .payment-status-pill {
            align-self: flex-start;
          }


          .payment-summary {
            grid-template-columns: 1fr;
          }


          .payment-summary-meta {
            grid-template-columns: 1fr 1fr;
          }


          .payment-bank-title {
            align-items: flex-start;
            flex-direction: column;
          }


          .payment-bank-row {
            grid-template-columns: 1fr;
            gap: 6px;
            min-height: auto;
            padding: 15px;
          }


          .bank-owner {
            text-align: left;
          }


          .payment-modern-footer {
            align-items: flex-start;
            flex-direction: column;
          }


          .order-success-modern {
            padding: 15px;
          }


          .success-reference {
            gap: 14px;
          }

        }

      `}</style>

    </main>
  );
}