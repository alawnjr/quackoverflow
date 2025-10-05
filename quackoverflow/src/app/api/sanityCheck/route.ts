import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

/**
 * API Route for Firebase Sanity Check
 * GET /api/sanityCheck - Returns what's currently stored in Firebase
 */
export async function GET() {
  try {
    // Check the specific document: code/code
    const codeDocRef = doc(db, 'code', 'code');
    const docSnap = await getDoc(codeDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Also list all documents in the collection
      const codeCollectionRef = collection(db, 'code');
      const querySnapshot = await getDocs(codeCollectionRef);
      
      const allDocuments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }));
      
      return NextResponse.json({
        success: true,
        documentExists: true,
        document: {
          id: 'code',
          data: {
            code: data.code,
            codeLength: data.code?.length || 0,
            lineCount: data.lineCount,
            characterCount: data.characterCount,
            updatedAt: data.updatedAt
          }
        },
        allDocumentsInCollection: allDocuments,
        totalDocuments: querySnapshot.size
      });
    } else {
      return NextResponse.json({
        success: true,
        documentExists: false,
        message: 'Document code/code does not exist in Firebase'
      });
    }
  } catch (error: any) {
    console.error('Sanity check error:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
      message: 'Failed to read from Firebase'
    }, { status: 500 });
  }
}

