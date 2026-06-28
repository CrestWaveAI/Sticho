'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { MapPicker } from '@/components/ui/MapPicker';
import { useToast } from '@/components/ui/ToastProvider';
import { Upload } from 'lucide-react';
import styles from './page.module.css';

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(['Stitching', 'Bridal Wear']);
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [photosUploaded, setPhotosUploaded] = useState(false);
  
  // State for form fields
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [callNumber, setCallNumber] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  
  // Validation errors
  const [whatsappError, setWhatsappError] = useState('');
  const [callNumberError, setCallNumberError] = useState('');

  const router = useRouter();
  const { addToast } = useToast();

  const allCategories = ['Stitching', 'Alterations', 'Bridal Wear', 'Men\'s Tailoring', 'Custom Orders'];

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const validatePhone = (num: string) => {
    // Regex for Indian phone numbers (10 digits, optional +91 or 0 prefix)
    const phoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
    return phoneRegex.test(num.trim());
  };

  const handleCoordsChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setWhatsappError('');
    setCallNumberError('');

    let hasError = false;

    if (!validatePhone(whatsapp)) {
      setWhatsappError('Please enter a valid WhatsApp number (e.g. +91 98765 43210 or 9876543210).');
      hasError = true;
    }

    if (!validatePhone(callNumber)) {
      setCallNumberError('Please enter a valid call number (e.g. +91 98765 43210 or 9876543210).');
      hasError = true;
    }

    if (latitude === null || longitude === null) {
      addToast('Please set your location coordinates on the map.', 'error');
      hasError = true;
    }

    if (hasError) {
      addToast('Please correct the validation errors in the form.', 'error');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    addToast('Profile setup complete! Welcome to TailorPartner.', 'success');
    router.push('/dashboard');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>TailorPartner</div>
        <div className={styles.progressContainer}>
          <div className={styles.progressText}>Profile Setup: {selectedCategories.length > 0 ? '50%' : '30%'}</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: selectedCategories.length > 0 ? '50%' : '30%' }}></div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <Card className={styles.onboardingCard}>
          <form onSubmit={handleCompleteSetup}>
            <h1 className={styles.title}>Let&apos;s set up your profile</h1>
            <p className={styles.subtitle}>Complete these details so customers can find you.</p>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Business Information</h2>
              <Input 
                label="Business Name" 
                placeholder="e.g. Studio M Tailoring" 
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                required 
              />
              <div className={styles.wrapper}>
                <label className={styles.label}>Business Bio</label>
                <textarea 
                  className={styles.textarea} 
                  placeholder="Tell customers about your expertise..." 
                  rows={3} 
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Contact & Location Details</h2>
              <div className={styles.rowGrid}>
                <Input 
                  label="WhatsApp Number" 
                  placeholder="e.g. 9876543210" 
                  value={whatsapp}
                  onChange={e => {
                    setWhatsapp(e.target.value);
                    if (whatsappError) setWhatsappError('');
                  }}
                  error={whatsappError}
                  required 
                />
                <Input 
                  label="Call Number" 
                  placeholder="e.g. 9876543210" 
                  value={callNumber}
                  onChange={e => {
                    setCallNumber(e.target.value);
                    if (callNumberError) setCallNumberError('');
                  }}
                  error={callNumberError}
                  required 
                />
              </div>
              <Input 
                label="Full Address" 
                placeholder="e.g. 123 Fashion Street, Bandra West" 
                value={address}
                onChange={e => setAddress(e.target.value)}
                required 
              />
              <div className={styles.wrapper}>
                <label className={styles.label}>Map Location Pin</label>
                <MapPicker 
                  latitude={latitude} 
                  longitude={longitude} 
                  onChange={handleCoordsChange} 
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Services & Categories</h2>
              <p className={styles.helpText}>Select the services you offer. You can add more later.</p>
              <div className={styles.categoryChips}>
                {allCategories.map(cat => (
                  <span key={cat} onClick={() => toggleCategory(cat)} style={{ cursor: 'pointer' }}>
                    <StatusChip 
                      label={cat} 
                      status={selectedCategories.includes(cat) ? 'accent' : 'neutral'} 
                    />
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Profile Media</h2>
              <div className={styles.mediaUpload}>
                <div className={styles.uploadBox} onClick={() => setLogoUploaded(true)} style={{ cursor: 'pointer', background: logoUploaded ? 'var(--color-success-bg)' : undefined }}>
                  {logoUploaded ? <StatusChip label="Logo Uploaded" status="success" /> : (
                    <>
                      <Upload size={24} className={styles.uploadIcon} />
                      <span className={styles.uploadText}>Upload Logo</span>
                    </>
                  )}
                </div>
                <div className={styles.uploadBox} onClick={() => setPhotosUploaded(true)} style={{ cursor: 'pointer', background: photosUploaded ? 'var(--color-success-bg)' : undefined }}>
                  {photosUploaded ? <StatusChip label="Photos Uploaded" status="success" /> : (
                    <>
                      <Upload size={24} className={styles.uploadIcon} />
                      <span className={styles.uploadText}>Upload Shop Photos</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <Button type="submit" fullWidth disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
