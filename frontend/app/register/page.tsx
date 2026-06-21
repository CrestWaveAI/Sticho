'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import styles from './page.module.css';

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { addToast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.password) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    if (formData.password !== formData.confirm) {
      addToast('Passwords do not match.', 'error');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    addToast('OTP sent to ' + formData.phone, 'success');
    setStep(2);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('').length < 6) {
      addToast('Please enter the 6-digit code.', 'error');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    addToast('Account verified successfully!', 'success');
    router.push('/onboarding');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>TailorPartner</div>
      
      <Card className={styles.authCard}>
        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <h1 className={styles.title}>Create your account</h1>
            <p className={styles.subtitle}>Join TailorPartner to manage your tailoring business.</p>
            
            <div className={styles.form}>
              <Input label="Full Name" placeholder="e.g. Rahul Sharma" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <Input label="Business Email" type="email" placeholder="rahul@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <Input label="Phone Number" type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              <Input label="Password" type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
              <Input label="Confirm Password" type="password" placeholder="••••••••" value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})} required />
              
              <Button type="submit" fullWidth className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>
            </div>
            
            <p className={styles.footerText}>
              Already have an account? <Link href="/login" className={styles.link}>Log in</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <h1 className={styles.title}>Verify your number</h1>
            <p className={styles.subtitle}>We've sent a 6-digit code to {formData.phone}.</p>
            
            <div className={styles.otpContainer}>
              {otp.map((digit, index) => (
                <input 
                  key={index} 
                  type="text" 
                  maxLength={1} 
                  className={styles.otpInput} 
                  value={digit}
                  onChange={e => handleOtpChange(index, e.target.value)}
                  ref={el => { otpRefs.current[index] = el; }}
                />
              ))}
            </div>
            
            <Button type="submit" fullWidth className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
            
            <p className={styles.footerText}>
              Didn't receive the code? <button type="button" className={styles.linkBtn} onClick={() => addToast('Code resent.', 'info')}>Resend</button>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}
