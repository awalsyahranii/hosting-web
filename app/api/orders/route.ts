import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ordersFilePath = path.join(process.cwd(), "data", "orders.json");

export type StoredOrder = {
  id: number | string;
  order_id?: number | string;
  order_number: string;
  payment_id?: number | string;
  payment_number: string;
  username: string;
  user_name?: string;
  email: string;
  phone?: string;
  domain?: string;
  domain_name?: string;
  package_name?: string;
  service_category?: string;
  amount: number;
  total: number;
  subtotal?: number;
  ppn?: number;
  discount?: number;
  payment_method?: string;
  status: string;
  service_status?: string;
  billing_period?: string;
  created_at: string;
  paid_at?: string | null;
  confirmation_requested_at?: string | null;
  items?: Array<{
    domain_name?: string;
    description?: string;
    price?: number;
    billing_period?: string;
  }>;
};

function readOrders(): StoredOrder[] {
  try {
    if (!fs.existsSync(ordersFilePath)) {
      fs.mkdirSync(path.dirname(ordersFilePath), { recursive: true });
      fs.writeFileSync(ordersFilePath, JSON.stringify([], null, 2), "utf8");
      return [];
    }
    const data = fs.readFileSync(ordersFilePath, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading orders.json:", err);
    return [];
  }
}

function writeOrders(orders: StoredOrder[]) {
  try {
    if (!fs.existsSync(path.dirname(ordersFilePath))) {
      fs.mkdirSync(path.dirname(ordersFilePath), { recursive: true });
    }
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing orders.json:", err);
  }
}

// GET all orders
export async function GET() {
  const orders = readOrders();
  return NextResponse.json(
    { status: "success", count: orders.length, data: orders },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}

// POST: Create or upsert an order
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orders = readOrders();

    const orderNumber = body.order_number || `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const paymentNumber = body.payment_number || `PAY-${orderNumber.replace(/^ORD-/, "")}`;
    const id = body.id || body.order_id || Date.now();

    const newOrder: StoredOrder = {
      id,
      order_id: body.order_id || id,
      order_number: orderNumber,
      payment_id: body.payment_id || id,
      payment_number: paymentNumber,
      username: body.username || body.user_name || "Pelanggan",
      user_name: body.username || body.user_name || "Pelanggan",
      email: body.email || body.user_email || "-",
      phone: body.phone || body.whatsapp || "-",
      domain: body.domain || body.domain_name || body.package_name || "-",
      domain_name: body.domain_name || body.domain || body.package_name || "-",
      package_name: body.package_name || body.domain_name || "Layanan HostingWeb",
      service_category: body.service_category || "hosting",
      amount: Number(body.amount ?? body.total ?? body.price ?? 0),
      total: Number(body.total ?? body.amount ?? body.price ?? 0),
      subtotal: Number(body.subtotal ?? body.amount ?? body.price ?? 0),
      ppn: Number(body.ppn || 0),
      discount: Number(body.discount || 0),
      payment_method: body.payment_method || "transfer",
      status: body.status || "pending",
      service_status: body.service_status || "pending",
      billing_period: body.billing_period || "Sekali Bayar",
      created_at: body.created_at || new Date().toISOString(),
      paid_at: body.paid_at || null,
      confirmation_requested_at: body.confirmation_requested_at || null,
      items: body.items || [
        {
          domain_name: body.domain_name || body.package_name || "Layanan",
          description: body.service_category || "Layanan",
          price: Number(body.total ?? body.amount ?? 0),
          billing_period: body.billing_period || "Sekali Bayar",
        },
      ],
    };

    // Check if order already exists
    const existingIndex = orders.findIndex(
      (o) =>
        o.order_number.toLowerCase() === orderNumber.toLowerCase() ||
        o.payment_number.toLowerCase() === paymentNumber.toLowerCase() ||
        String(o.id) === String(id)
    );

    if (existingIndex >= 0) {
      orders[existingIndex] = { ...orders[existingIndex], ...newOrder };
    } else {
      orders.unshift(newOrder);
    }

    writeOrders(orders);
    return NextResponse.json({ status: "success", data: newOrder });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Gagal menyimpan pesanan" },
      { status: 500 }
    );
  }
}

// PUT: Update order/payment status
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const orders = readOrders();

    const targetRef = String(body.order_number || body.payment_number || body.id || body.payment_id || body.order_id || "").toLowerCase();
    if (!targetRef) {
      return NextResponse.json({ status: "error", message: "Target ID / order_number / payment_number diperlukan." }, { status: 400 });
    }

    let updated = false;
    const updatedOrders = orders.map((o) => {
      const match =
        String(o.id).toLowerCase() === targetRef ||
        String(o.order_id).toLowerCase() === targetRef ||
        String(o.payment_id).toLowerCase() === targetRef ||
        o.order_number.toLowerCase() === targetRef ||
        o.payment_number.toLowerCase() === targetRef;

      if (match) {
        updated = true;
        const newStatus = body.status || o.status;
        const isPaid = ["paid", "success", "completed"].includes(newStatus.toLowerCase());
        return {
          ...o,
          ...body,
          status: newStatus,
          service_status: isPaid ? "active" : o.service_status,
          paid_at: isPaid ? (o.paid_at || new Date().toISOString()) : o.paid_at,
          confirmation_requested_at: body.confirmation_requested_at !== undefined ? body.confirmation_requested_at : o.confirmation_requested_at,
        };
      }
      return o;
    });

    if (updated) {
      writeOrders(updatedOrders);
      return NextResponse.json({ status: "success", message: "Pesanan berhasil diperbarui" });
    } else {
      return NextResponse.json({ status: "error", message: "Pesanan tidak ditemukan" }, { status: 404 });
    }
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Gagal memperbarui pesanan" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an order
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    const orderNum = searchParams.get("order_number");
    const payNum = searchParams.get("payment_number");

    let bodyData: any = null;
    try {
      bodyData = await req.json();
    } catch {}

    const targetId = idParam || bodyData?.id || bodyData?.order_id || bodyData?.payment_id;
    const targetOrder = orderNum || bodyData?.order_number;
    const targetPay = payNum || bodyData?.payment_number;

    const orders = readOrders();
    const filtered = orders.filter((o) => {
      if (targetId && (String(o.id) === String(targetId) || String(o.order_id) === String(targetId) || String(o.payment_id) === String(targetId))) return false;
      if (targetOrder && o.order_number.toLowerCase() === String(targetOrder).toLowerCase()) return false;
      if (targetPay && o.payment_number.toLowerCase() === String(targetPay).toLowerCase()) return false;
      return true;
    });

    writeOrders(filtered);
    return NextResponse.json({ status: "success", message: "Pesanan berhasil dihapus" });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Gagal menghapus pesanan" },
      { status: 500 }
    );
  }
}
