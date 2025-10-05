/**
 * Firebase Sanity Check - utility to verify what's stored in Firebase
 */

import { db } from './firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

export async function sanityCheckFirebase() {
  console.log('🔍 Running Firebase Sanity Check...\n');
  
  try {
    // Check the specific document: code/code
    console.log('📄 Checking document: code/code');
    const codeDocRef = doc(db, 'code', 'code');
    const docSnap = await getDoc(codeDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('✅ Document exists!');
      console.log('Data:', {
        code: data.code ? `${data.code.substring(0, 100)}${data.code.length > 100 ? '...' : ''}` : 'null',
        codeLength: data.code?.length || 0,
        lineCount: data.lineCount,
        characterCount: data.characterCount,
        updatedAt: data.updatedAt
      });
      return {
        success: true,
        exists: true,
        data
      };
    } else {
      console.log('❌ Document does not exist');
      return {
        success: true,
        exists: false,
        data: null
      };
    }
  } catch (error) {
    console.error('❌ Error during sanity check:', error);
    return {
      success: false,
      error: String(error)
    };
  }
}

export async function listAllCodeCollection() {
  console.log('📚 Listing all documents in "code" collection...\n');
  
  try {
    const codeCollectionRef = collection(db, 'code');
    const querySnapshot = await getDocs(codeCollectionRef);
    
    console.log(`Found ${querySnapshot.size} document(s)`);
    
    const documents: any[] = [];
    querySnapshot.forEach((doc) => {
      console.log(`\n📄 Document ID: ${doc.id}`);
      console.log('Data:', doc.data());
      documents.push({
        id: doc.id,
        data: doc.data()
      });
    });
    
    return {
      success: true,
      count: querySnapshot.size,
      documents
    };
  } catch (error) {
    console.error('❌ Error listing collection:', error);
    return {
      success: false,
      error: String(error)
    };
  }
}

