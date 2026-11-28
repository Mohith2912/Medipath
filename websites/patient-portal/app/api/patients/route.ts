import { NextResponse } from "next/server";
import { getPatients, createPatient } from "../../../src/db/db";

export async function GET() {
  const patients = await getPatients();
  return NextResponse.json({ patients });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await createPatient(body);
    return NextResponse.json({ success: true, patient: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
