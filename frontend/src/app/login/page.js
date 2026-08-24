'use client';

import { useState, useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/authSlice.js';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Key, Mail, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { user, error } = useSelector((state) => state.auth);
  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    if (user) {
      if (['Super Admin', 'Manager', 'Staff'].includes(user.role)) {
        router.push(redirect ? `/${redirect}` : '/admin/dashboard');
      } else {
        router.push(redirect ? `/${redirect}` : '/');
      }
    }
    dispatch(clearError());
  }, [user, redirect, router, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    await dispatch(loginUser({ email, password, rememberMe }));
    setIsSubmitting(false);
  };

  return (
    <div style={{
      flex: 1,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      overflow: 'hidden',
    }}>

      {/* Full background image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/auth_bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0
      }} />

      {/* Dark + light green overlay for readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(18, 35, 23, 0.65)',
        zIndex: 1
      }} />

      {/* Glass card */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: '380px',
        background: 'rgba(20, 45, 25, 0.25)',
        backdropFilter: 'blur(26px)',
        WebkitBackdropFilter: 'blur(26px)',
        border: '1px solid rgba(134, 239, 172, 0.25)',
        borderRadius: '20px',
        padding: '1.75rem 1.75rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(134, 239, 172, 0.1) inset',
      }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.4px' }}>
              Sweettree<sup style={{ fontSize: '9px', fontWeight: 600, color: '#a3e4b5' }}>on</sup>
            </span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'rgba(134, 239, 172, 0.15)',
            border: '1px solid rgba(134, 239, 172, 0.3)',
            margin: '0.5rem auto',
            boxShadow: '0 4px 15px rgba(134, 239, 172, 0.15)'
          }}>
            <LogIn size={20} color="#86efac" />
          </div>
          <h3 style={{ fontWeight: 700, color: '#ffffff', fontSize: '1.2rem', marginBottom: '2px', letterSpacing: '-0.2px' }}>
            Welcome Back
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', margin: 0 }}>
            Sign in to continue shopping
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Email */}
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.73rem', fontWeight: 500, marginBottom: '4px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="glass-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '9px',
                  padding: '9px 12px 9px 36px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={e => {
                  e.target.style.border = '1px solid rgba(74,222,128,0.6)';
                  e.target.style.background = 'rgba(255,255,255,0.14)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(74,222,128,0.12)';
                }}
                onBlur={e => {
                  e.target.style.border = '1px solid rgba(255,255,255,0.18)';
                  e.target.style.background = 'rgba(255,255,255,0.09)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <Mail size={15} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.73rem', fontWeight: 500, marginBottom: '4px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="glass-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '9px',
                  padding: '9px 36px 9px 36px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={e => {
                  e.target.style.border = '1px solid rgba(74,222,128,0.6)';
                  e.target.style.background = 'rgba(255,255,255,0.14)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(74,222,128,0.12)';
                }}
                onBlur={e => {
                  e.target.style.border = '1px solid rgba(255,255,255,0.18)';
                  e.target.style.background = 'rgba(255,255,255,0.09)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <Key size={15} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                {showPassword ? <EyeOff size={15} color="rgba(255,255,255,0.4)" /> : <Eye size={15} color="rgba(255,255,255,0.4)" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="rememberMeCheck"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: '14px', height: '14px', accentColor: '#a3e4b5', cursor: 'pointer' }}
            />
            <label htmlFor="rememberMeCheck" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.73rem', cursor: 'pointer', margin: 0 }}>
              Remember me
            </label>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: '9px', padding: '9px 12px', color: '#fca5a5', fontSize: '0.8rem'
            }}>{error}</div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              background: isSubmitting ? 'rgba(74, 222, 128, 0.4)' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              border: '1px solid rgba(134, 239, 172, 0.3)',
              borderRadius: '9px',
              padding: '10px', color: '#ffffff',
              fontWeight: 600, fontSize: '0.85rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              marginTop: '2px'
            }}
            onMouseEnter={e => { if (!isSubmitting) { e.currentTarget.style.boxShadow = '0 6px 20px rgba(22, 163, 74, 0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(22, 163, 74, 0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {isSubmitting
              ? <><span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px' }} /> Signing In...</>
              : <><LogIn size={15} /> Log In</>
            }
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0.9rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', letterSpacing: '1px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', margin: 0 }}>
          Don&apos;t have an account?{' '}
          <Link href={`/register${redirect ? `?redirect=${redirect}` : ''}`}
            style={{ color: '#4ade80', fontWeight: 700, textDecoration: 'none' }}>
            Create one
          </Link>
        </p>

      </div>
    </div>
  );
}
