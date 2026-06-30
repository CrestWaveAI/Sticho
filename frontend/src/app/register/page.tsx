'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { registerTailorActual } from '../api';
import styles from './page.module.css';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const router = useRouter();
  const { addToast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email || !formData.password) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    if (formData.password !== formData.confirm) {
      addToast('Passwords do not match.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await registerTailorActual({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        contact_number: formData.phone
      });

      addToast('Account created successfully!', 'success');
      
      // Save tailor session and identity details
      if (res.access_token) {
        localStorage.setItem('tailor_token', res.access_token);
      }
      if (res.tailor_id) {
        localStorage.setItem('tailor_profile_id', res.tailor_id);
      }
      
      localStorage.setItem('tailor_registration_info', JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      }));

      router.push('/onboarding');
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>TailorPartner</div>
      
      <Card className={styles.authCard}>
        <form onSubmit={handleRegister}>
          <h1 className={styles.title}>Create your account</h1>
          <p className={styles.subtitle}>Join TailorPartner to manage your tailoring business.</p>
          
          <div className={styles.form}>
            <Input 
              label="Full Name" 
              placeholder="e.g. Rahul Sharma" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
            <Input 
              label="Business Email" 
              type="email" 
              placeholder="rahul@example.com" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              required
            />
            <Input 
              label="Phone Number" 
              type="tel" 
              placeholder="+91 98765 43210" 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
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
            <Input 
              label="Confirm Password" 
              type="password" 
              placeholder="••••••••" 
              value={formData.confirm} 
              onChange={e => setFormData({...formData, confirm: e.target.value})} 
              required 
            />
            
            <Button 
              type="submit" 
              fullWidth 
              className={styles.submitBtn} 
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
          
          <p className={styles.footerText}>
            Already have an account? <Link href="/login" className={styles.link}>Log in</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
