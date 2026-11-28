import { NextResponse } from "next/server";
import { getQueue, createQueueToken, updateQueueToken } from "../../../src/db/db";

export async function GET() {
  const queue = await getQueue();
  return NextResponse.json({ queue });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await createQueueToken(body);
    return NextResponse.json({ success: true, item: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { token, status, kind } = await request.json();
    await updateQueueToken(token, status, kind);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
