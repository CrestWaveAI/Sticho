'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { useToast } from '@/components/ui/ToastProvider';
import { Upload } from 'lucide-react';
import styles from './page.module.css';

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(['Stitching', 'Bridal Wear']);
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [photosUploaded, setPhotosUploaded] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const allCategories = ['Stitching', 'Alterations', 'Bridal Wear', 'Men\'s Tailoring', 'Custom Orders'];

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
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
            <h1 className={styles.title}>Let's set up your profile</h1>
            <p className={styles.subtitle}>Complete these details so customers can find you.</p>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Business Information</h2>
              <Input label="Business Name" placeholder="e.g. Studio M Tailoring" required />
              <div className={styles.wrapper}>
                <label className={styles.label}>Business Bio</label>
                <textarea className={styles.textarea} placeholder="Tell customers about your expertise..." rows={3} required />
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
