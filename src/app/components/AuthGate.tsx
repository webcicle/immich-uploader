"use client"

import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userName: string | null;
}

const AuthGate = ({ children }: AuthGateProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    userName: null
  });
  const [invitationCode, setInvitationCode] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/share/api/auth');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            userName: data.userName
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            userName: null
          });
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          userName: null
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        userName: null
      });
    }
  };

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitationCode.trim() || !userName.trim()) {
      setError('Please enter both invitation code and your name');
      return;
    }

    setIsAuthenticating(true);
    setError('');

    try {
      const response = await fetch('/share/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationCode: invitationCode.trim(),
          userName: userName.trim()
        }),
      });

      if (response.ok) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          userName: userName.trim()
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Authentication failed');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
      console.error('Authentication error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto mt-16">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Lock className="w-12 h-12 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">Access Required</h1>
            </div>
            <p className="text-gray-600">Enter the invitation code to upload photos</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleAuthentication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isAuthenticating}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invitation Code
                </label>
                <input
                  type="password"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  placeholder="Enter invitation code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isAuthenticating}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {isAuthenticating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Enter Photo Share
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">For friends & family:</h3>
              <p className="text-sm text-blue-700">
                Ask the person who shared this link for the invitation code. 
                This helps keep the photo sharing private and secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, show the main app
  return (
    <>
      {children}
    </>
  );
};

export default AuthGate;