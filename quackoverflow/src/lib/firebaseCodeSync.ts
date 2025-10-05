/**
 * Firebase Code Sync utilities
 * Functions to load and save code to Firestore
 */

import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

/**
 * Load code from Firestore
 * @returns The saved code or null if not found
 */
export const loadCodeFromFirestore = async (): Promise<string | null> => {
  try {
    const codeDocRef = doc(db, 'code', 'code');
    const docSnap = await getDoc(codeDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.code || null;
    }
    return null;
  } catch (error) {
    console.error('Error loading code from Firestore:', error);
    return null;
  }
};

/**
 * Save code to Firestore
 * @param code - The code to save
 */
export const saveCodeToFirestoreSync = async (code: string): Promise<void> => {
  try {
    const codeDocRef = doc(db, 'code', 'code');
    await setDoc(codeDocRef, {
      code,
      updatedAt: new Date().toISOString(),
      lineCount: code.split('\n').length,
      characterCount: code.length
    });
  } catch (error) {
    console.error('Error saving code to Firestore:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time code updates from Firestore
 * @param callback - Function to call when code changes
 * @returns Unsubscribe function
 */
export const subscribeToCodeChanges = (callback: (code: string) => void) => {
  const codeDocRef = doc(db, 'code', 'code');
  
  return onSnapshot(codeDocRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      if (data.code) {
        callback(data.code);
      }
    }
  }, (error) => {
    console.error('Error in code subscription:', error);
  });
};

