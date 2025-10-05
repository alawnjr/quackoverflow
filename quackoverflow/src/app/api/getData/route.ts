import { NextResponse } from "next/server";
import analyzeCodeWithGemini from "./getGeminiFeedback";
function getUserCode() {
  return `print("Hello world")`;
}

export async function GET() {
  try {
    const userCode = getUserCode();
    const result = await analyzeCodeWithGemini(userCode);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
    //if there is an error, start catch block
  }
}
