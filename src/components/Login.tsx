import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import { 
  auth,
  signInWithGoogle, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from '../firebase';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Google sign in error:", err);
      if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('auth/unauthorized-domain'))) {
        const hostname = window.location.hostname;
        setError(
          `Unauthorized domain! Please whitelist "${hostname}" in your Firebase Console: Firebase Console > Authentication > Settings > Authorized domains.`
        );
      } else {
        setError(err.message || 'An error occurred during Google sign-in.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <h1 className="text-8xl font-bold neon-text-glow mb-2 tracking-tighter">KAKEIBO</h1>
        <p className="text-xl mb-12 opacity-60 italic">The mindful way to track your spending.</p>

        <div className="neon-border p-8 bg-neon-green/5 space-y-6">
          <h2 className="text-2xl font-bold uppercase tracking-widest">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>

          <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest opacity-60 font-bold flex items-center gap-2">
                <Mail size={14} /> Email
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neon-input w-full"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest opacity-60 font-bold flex items-center gap-2">
                <Lock size={14} /> Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neon-input w-full"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-3 border border-red-500/20">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {resetSent && (
              <div className="text-neon-green text-xs bg-neon-green/10 p-3 border border-neon-green/20">
                Password reset email sent! Check your inbox.
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="neon-button w-full flex items-center justify-center gap-2 py-4"
            >
              {loading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          {!isSignUp && (
            <button 
              onClick={handleForgotPassword}
              className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
            >
              Forgot Password?
            </button>
          )}

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neon-green/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-neon-green/40">Or continue with</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleSignIn} 
            className="w-full border border-neon-green/40 hover:bg-neon-green/10 transition-all py-4 flex items-center justify-center gap-3 group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-bold uppercase tracking-widest text-sm">Google</span>
          </button>

          <div className="pt-4">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-neon-green/60 hover:text-neon-green transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
