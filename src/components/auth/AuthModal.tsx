'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
  preventClose?: boolean;
}

export function AuthModal({
  isOpen,
  onClose,
  defaultMode = 'signin',
  onSuccess,
  title,
  subtitle,
  preventClose = false,
}: AuthModalProps) {
  const { 
    signInWithGoogle, 
    signInWithEmailOrUsername, 
    signUpWithEmail, 
    sendResetPasswordEmail 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(defaultMode);
  
  // Sign In / Sign Up Form States
  const [identifier, setIdentifier] = useState(''); // email or username
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Status & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
          setErrorMessage('Google Sign-In is not enabled yet in your Firebase Console. Please go to Firebase Console > Authentication > Sign-in method and enable Google.');
        } else {
          setErrorMessage(err.message || 'Failed to sign in with Google. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (mode === 'signin') {
        if (!identifier.trim()) throw new Error('Please enter your email or username');
        if (!password) throw new Error('Please enter your password');
        
        await signInWithEmailOrUsername(identifier, password);
        if (onSuccess) onSuccess();
        onClose();
      } else if (mode === 'signup') {
        if (!username.trim()) throw new Error('Please enter a username');
        if (!email.trim()) throw new Error('Please enter your email');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');

        await signUpWithEmail(email, password, username, fullName);
        setVerificationSent(true);
        if (onSuccess) onSuccess();
      } else if (mode === 'forgot') {
        if (!resetEmail.trim()) throw new Error('Please enter your email address');
        await sendResetPasswordEmail(resetEmail);
        setResetSuccess(true);
      }
    } catch (err: any) {
      console.error('Auth action error:', err);
      let msg = err.message || 'An error occurred during authentication.';
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        msg = 'Firebase Authentication is not yet enabled for this project. Please go to Firebase Console > Authentication > Sign-in method and enable "Email/Password".';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Incorrect email/username or password. Please check your credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalNode = (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto"
      onClick={preventClose ? undefined : onClose}
    >
      <div 
        className="relative w-full max-w-md my-auto bg-card border border-border/80 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden text-foreground animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {!preventClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-3 shadow-xs">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {title || (mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create an Account' : 'Reset Password')}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {subtitle || (
              mode === 'signin' 
                ? 'Sign in to access and sync your invoices across all devices' 
                : mode === 'signup' 
                ? 'Sign up for free to create and store your invoices securely' 
                : 'Enter your email to receive a password reset link'
            )}
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Verification Email Sent Notice */}
        {verificationSent ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold">Verification Link Sent!</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We have sent a verification link to <strong className="text-foreground">{email}</strong>. 
              Please click the link in your email to verify your account.
            </p>
            <button
              type="button"
              onClick={() => {
                setVerificationSent(false);
                onClose();
              }}
              className="w-full py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all cursor-pointer"
            >
              Continue to Billing
            </button>
          </div>
        ) : resetSuccess ? (
          /* Password Reset Sent Notice */
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-blue-500/10 text-primary rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold">Password Reset Link Sent!</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We sent a direct reset link to <strong className="text-foreground">{resetEmail}</strong>. 
              Check your inbox and click the link to choose a new password.
            </p>
            <button
              type="button"
              onClick={() => {
                setResetSuccess(false);
                setMode('signin');
              }}
              className="w-full py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            {/* Google One-Click Button */}
            {mode !== 'forgot' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-background hover:bg-secondary border border-border/80 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-2xs hover:shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold text-muted-foreground">
                    <span className="bg-card px-2">Or continue with email / username</span>
                  </div>
                </div>
              </>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Sign In Mode: Identifier (Email or Username) */}
              {mode === 'signin' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="e.g. rahul123 or rahul@gmail.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      className="w-full h-11 pl-10 pr-3.5 bg-background border border-border/80 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
                    />
                  </div>
                </div>
              )}

              {/* Sign Up Mode: Full Name (Optional), Username, Email */}
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name / Business Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="e.g. rahul123 (letters, numbers, underscores)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        required
                        className="w-full h-11 pl-10 pr-3.5 bg-background border border-border/80 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="rahul@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-11 pl-10 pr-3.5 bg-background border border-border/80 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Password field with Show / Hide Toggle (Requirement 4) */}
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password <span className="text-red-500">*</span>
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMessage('');
                        }}
                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={mode === 'signup' ? 'Create a secure password (min 6 chars)' : 'Enter your password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full h-11 pl-10 pr-11 bg-background border border-border/80 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Forgot Password Mode */}
              {mode === 'forgot' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="w-full h-11 pl-10 pr-3.5 bg-background border border-border/80 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-primary text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-4"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'signin' 
                        ? 'Sign In to BillWebz' 
                        : mode === 'signup' 
                        ? 'Create Free Account' 
                        : 'Send Password Reset Link'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Modes Footer */}
            <div className="mt-5 pt-4 border-t border-border/60 text-center text-xs text-muted-foreground">
              {mode === 'signin' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMessage('');
                    }}
                    className="font-bold text-primary hover:underline cursor-pointer"
                  >
                    Sign up free
                  </button>
                </p>
              ) : mode === 'signup' ? (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMessage('');
                    }}
                    className="font-bold text-primary hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage('');
                  }}
                  className="font-bold text-primary hover:underline cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
