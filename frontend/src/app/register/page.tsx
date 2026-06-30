'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { sendOtp, verifyOtp } from '../api';
import styles from './page.module.css';

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { addToast } = useToast();

  const handleSendOtp = async (e?: React.FormEvent | React.MouseEvent) => {
    console.log("handleSendOtp triggered!");
    if (e) e.preventDefault();
    console.log("Form data submitted:", formData);
    
    if (!formData.name || !formData.phone || !formData.password) {
      console.log("Validation failed: missing fields");
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    if (formData.password !== formData.confirm) {
      addToast('Passwords do not match.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await sendOtp(formData.phone);
      addToast(`OTP sent to ${formData.phone}. Use code: ${res.otp}`, 'success');
      setStep(2);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Failed to send OTP. Please try again.';
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      addToast('Please enter the 6-digit code.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await verifyOtp(formData.phone, code);
      addToast('Account verified successfully!', 'success');
      
      localStorage.setItem('tailor_registration_info', JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      }));

      router.push('/onboarding');
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'OTP verification failed. Please try again.';
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
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
          <form onSubmit={e => e.preventDefault()}>
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
                type="button" 
                fullWidth 
                className={styles.submitBtn} 
                disabled={isLoading}
                onClick={handleSendOtp}
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>
            </div>
            
            <p className={styles.footerText}>
              Already have an account? <Link href="/login" className={styles.link}>Log in</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={e => e.preventDefault()}>
            <h1 className={styles.title}>Verify your number</h1>
            <p className={styles.subtitle}>We&apos;ve sent a 6-digit code to {formData.phone}.</p>
            
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
            
            <Button 
              type="button" 
              fullWidth 
              className={styles.submitBtn} 
              disabled={isLoading}
              onClick={handleVerify}
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
            
            <p className={styles.footerText}>
              Didn&apos;t receive the code? <button type="button" className={styles.linkBtn} onClick={() => addToast('Code resent.', 'info')}>Resend</button>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}
