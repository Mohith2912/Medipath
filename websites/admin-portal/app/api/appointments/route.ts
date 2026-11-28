import { NextResponse } from "next/server";
import { getAppointments, createAppointment, updateAppointmentStatus } from "../../../src/db/db";

export async function GET() {
  const appointments = await getAppointments();
  return NextResponse.json({ appointments });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await createAppointment(body);
    return NextResponse.json({ success: true, appointment: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, type } = await request.json();
    await updateAppointmentStatus(id, status, type);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
