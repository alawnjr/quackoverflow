import { NextResponse } from "next/server";
import analyzeCodeWithGemini from "./getGeminiFeedback";
import { useCodeStore } from "@/store/codeStore";

export async function GET() {
  try {
    const userCode = useCodeStore.getState().code;
    console.log(userCode);
    const geminiAdv = await analyzeCodeWithGemini(userCode);

    return NextResponse.json({geminiAdv, userCode});
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
    //if there is an error, start catch block
  }
}
