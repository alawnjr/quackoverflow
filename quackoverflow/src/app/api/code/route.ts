import { NextResponse } from 'next/server';

export async function GET() {
  const javaCode = `public int countHi(String str) {
  
  int count = 0;
  
  // str = str.toLowerCase();
  
  for (int i=0; i < str.length()-1; i++) {
    if (str.charAt(i) == 'h' && str.charAt(i) == 'i')
      count++;
    
  }
  
  return count;
}`;

  return NextResponse.json({ code: javaCode });
}
