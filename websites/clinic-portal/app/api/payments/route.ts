import { NextResponse } from "next/server";
import { getPayments, createPayment } from "../../../src/db/db";

export async function GET() {
  const payments = await getPayments();
  return NextResponse.json({ payments });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await createPayment(body);
    return NextResponse.json({ success: true, payment: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
