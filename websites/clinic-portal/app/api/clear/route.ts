import { NextResponse } from "next/server";
import { clearAllLiveData } from "../../../src/db/db";

export async function POST() {
  await clearAllLiveData();
  return NextResponse.json({ success: true, message: "Live database cleared." });
}
