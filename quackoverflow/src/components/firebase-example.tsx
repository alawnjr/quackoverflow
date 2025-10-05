"use client";

/**
 * Example component demonstrating Firebase usage
 * This shows how to integrate Firebase Auth and Firestore with your app
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCodeStore } from '@/store/codeStore';
import { Button } from '@/components/ui/button';
import { 
  signIn, 
  signUp, 
  signOut,
  saveCodeToFirestore,
  getCodeFromFirestore 
} from '@/lib/firebaseUtils';

export const FirebaseExample = () => {
  const { user, loading } = useAuth();
  const { code, setCode } = useCodeStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      await signUp(email, password);
      console.log('User created successfully');
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
      console.log('User signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('User signed out');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSaveCode = async () => {
    if (!user) {
      console.error('User must be signed in to save code');
      return;
    }

    try {
      await saveCodeToFirestore(user.uid, code);
      console.log('Code saved successfully');
    } catch (error) {
      console.error('Error saving code:', error);
    }
  };

  const handleLoadCode = async () => {
    if (!user) {
      console.error('User must be signed in to load code');
      return;
    }

    try {
      const savedCode = await getCodeFromFirestore(user.uid);
      if (savedCode) {
        setCode(savedCode);
        console.log('Code loaded successfully');
      }
    } catch (error) {
      console.error('Error loading code:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Firebase Integration Example</h2>
      
      {!user ? (
        <div className="space-y-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
          />
          <div className="flex gap-2">
            <Button onClick={handleSignIn}>Sign In</Button>
            <Button onClick={handleSignUp} variant="outline">Sign Up</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p>Signed in as: {user.email}</p>
          <div className="flex gap-2">
            <Button onClick={handleSaveCode}>Save Code</Button>
            <Button onClick={handleLoadCode} variant="outline">Load Code</Button>
            <Button onClick={handleSignOut} variant="destructive">Sign Out</Button>
          </div>
        </div>
      )}
    </div>
  );
};

