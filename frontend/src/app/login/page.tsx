'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { loginTailor } from '../api';
import styles from '../register/page.module.css';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const router = useRouter();
  const { addToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      addToast('Please fill in all fields.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginTailor({
        email: formData.email,
        password: formData.password
      });

      addToast('Welcome back!', 'success');

      if (res.access_token) {
        localStorage.setItem('tailor_token', res.access_token);
      }
      if (res.tailor_id) {
        localStorage.setItem('tailor_profile_id', res.tailor_id);
      }

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Invalid email or password.';
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>TailorPartner</div>
      
      <Card className={styles.authCard}>
        <form onSubmit={handleLogin}>
          <h1 className={styles.title}>Sign in to your account</h1>
          <p className={styles.subtitle}>Welcome back! Enter your email and password to log in.</p>
          
          <div className={styles.form}>
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="rahul@example.com" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              required 
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              required 
            />
            
            <Button 
              type="submit" 
              fullWidth 
              className={styles.submitBtn} 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
          
          <p className={styles.footerText}>
            Don&apos;t have an account? <Link href="/register" className={styles.link}>Sign up</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
