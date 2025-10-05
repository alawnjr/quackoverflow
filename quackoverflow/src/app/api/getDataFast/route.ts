import { NextResponse } from "next/server";
import { convexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

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

    return NextResponse.json({ userCode });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
