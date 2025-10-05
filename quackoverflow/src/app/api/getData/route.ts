import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import analyzeCodeWithGemini from "./getGeminiFeedback";
import { convexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
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
