import { NextResponse } from "next/server";
import analyzeCodeWithGemini from "./getGeminiFeedback";
import { convexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's code from Convex
    const userCodeData = await convexClient.query(api.userCode.getUserCode, {
      userId,
    });

    const userCode = userCodeData.code;

    console.log(userCode);
    const geminiAdv = await analyzeCodeWithGemini(userCode);

    return NextResponse.json({ geminiAdv, userCode });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
