/**
 * Firebase utility functions
 * Example usage patterns for Firebase services in your app
 */

import { auth, db, storage } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  getDocs 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';

// ==================== Auth Functions ====================

export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// ==================== Firestore Functions ====================

// Example: Save user code to Firestore
export const saveCodeToFirestore = async (userId: string, code: string) => {
  try {
    const docRef = doc(db, 'userCodes', userId);
    await setDoc(docRef, {
      code,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving code:', error);
    throw error;
  }
};

// Example: Get user code from Firestore
export const getCodeFromFirestore = async (userId: string) => {
  try {
    const docRef = doc(db, 'userCodes', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().code;
    }
    return null;
  } catch (error) {
    console.error('Error getting code:', error);
    throw error;
  }
};

// Example: Save analysis results
export const saveAnalysisResult = async (
  userId: string, 
  code: string, 
  result: any
) => {
  try {
    const analysisRef = collection(db, 'analyses');
    await setDoc(doc(analysisRef), {
      userId,
      code,
      result,
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
};

// Example: Get user's analysis history
export const getUserAnalyses = async (userId: string) => {
  try {
    const analysesRef = collection(db, 'analyses');
    const q = query(analysesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting analyses:', error);
    throw error;
  }
};

// ==================== Storage Functions ====================

// Example: Upload file to Storage
export const uploadFile = async (
  file: File, 
  path: string
): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Example: Delete file from Storage
export const deleteFile = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

