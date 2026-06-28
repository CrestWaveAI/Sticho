'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { MapPicker } from '@/components/ui/MapPicker';
import { useToast } from '@/components/ui/ToastProvider';
import { createTailor, updateTailor, autocompleteLocations } from '../api';
import { Upload } from 'lucide-react';
import styles from './page.module.css';

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(['Stitching', 'Bridal Wear']);
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [photosUploaded, setPhotosUploaded] = useState(false);
  
  // State for form fields
  const [businessName, setBusinessName] = useState(() => {
    if (typeof window !== 'undefined') {
      const regInfo = localStorage.getItem('tailor_registration_info');
      if (regInfo) {
        try {
          return JSON.parse(regInfo).name || '';
        } catch (e) {
          console.error(e);
        }
      }
    }
    return '';
  });
  const [bio, setBio] = useState('');
  const [whatsapp, setWhatsapp] = useState(() => {
    if (typeof window !== 'undefined') {
      const regInfo = localStorage.getItem('tailor_registration_info');
      if (regInfo) {
        try {
          return JSON.parse(regInfo).phone || '';
        } catch (e) {
          console.error(e);
        }
      }
    }
    return '';
  });
  const [callNumber, setCallNumber] = useState(() => {
    if (typeof window !== 'undefined') {
      const regInfo = localStorage.getItem('tailor_registration_info');
      if (regInfo) {
        try {
          return JSON.parse(regInfo).phone || '';
        } catch (e) {
          console.error(e);
        }
      }
    }
    return '';
  });
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [experience, setExperience] = useState('');
  const [email] = useState(() => {
    if (typeof window !== 'undefined') {
      const regInfo = localStorage.getItem('tailor_registration_info');
      if (regInfo) {
        try {
          return JSON.parse(regInfo).email || '';
        } catch (e) {
          console.error(e);
        }
      }
    }
    return '';
  });
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  
  // Validation errors
  const [businessNameError, setBusinessNameError] = useState('');
  const [bioError, setBioError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [cityError, setCityError] = useState('');
  const [localityError, setLocalityError] = useState('');
  const [experienceError, setExperienceError] = useState('');
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
    const phoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
    return phoneRegex.test(num.trim());
  };

  const handleCoordsChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setBusinessNameError('');
    setBioError('');
    setAddressError('');
    setCityError('');
    setLocalityError('');
    setExperienceError('');
    setWhatsappError('');
    setCallNumberError('');

    let hasError = false;

    if (!businessName.trim()) {
      setBusinessNameError('Business Name is required.');
      hasError = true;
    }
    if (!bio.trim()) {
      setBioError('Business Bio is required.');
      hasError = true;
    }
    if (!address.trim()) {
      setAddressError('Full Address is required.');
      hasError = true;
    }
    if (!city.trim()) {
      setCityError('City is required.');
      hasError = true;
    }
    if (!locality.trim()) {
      setLocalityError('Locality is required.');
      hasError = true;
    }
    
    const expNum = parseInt(experience);
    if (!experience.trim()) {
      setExperienceError('Years of Experience is required.');
      hasError = true;
    } else if (isNaN(expNum) || expNum < 0) {
      setExperienceError('Please enter a valid number of years.');
      hasError = true;
    }

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
    try {
      // 1. Resolve location_id from database locations
      let matchedLocationId: string | null = null;
      try {
        const suggestions = await autocompleteLocations(locality.trim());
        const match = suggestions.find(
          loc => loc.city.toLowerCase() === city.trim().toLowerCase() &&
                 loc.name.toLowerCase() === locality.trim().toLowerCase()
        );
        if (match) {
          matchedLocationId = match.id;
        } else if (suggestions.length > 0) {
          matchedLocationId = suggestions[0].id;
        }
      } catch (err) {
        console.error('Error fetching location autocomplete:', err);
      }

      // 2. Create Tailor profile (POST)
      const tailorPayload = {
        name: businessName.trim(),
        email: email || undefined,
        bio: bio.trim(),
        address: address.trim(),
        gradient: 'linear-gradient(135deg, #bf91ac 0%, #7d4d68 100%)',
        contact_number: callNumber.trim(),
        location_id: matchedLocationId
      };
      
      const createdTailor = await createTailor(tailorPayload);

      // 3. Save extra details (experience, coordinates) (PUT)
      const updatedTailor = await updateTailor(createdTailor.id, {
        experience: expNum,
        latitude,
        longitude
      });

      // 4. Save to local storage for persistence and dashboard
      const localProfile = {
        id: updatedTailor.id,
        businessName: updatedTailor.name,
        bio: updatedTailor.bio || '',
        experience: String(updatedTailor.experience || 0),
        whatsapp: whatsapp.trim(),
        callNumber: updatedTailor.contact_number,
        address: updatedTailor.address,
        city: city.trim(),
        locality: locality.trim(),
        latitude,
        longitude,
        categories: selectedCategories
      };

      localStorage.setItem('tailor_profile', JSON.stringify(localProfile));
      localStorage.setItem('tailor_profile_id', updatedTailor.id);
      localStorage.setItem('tailor_profile_status', 'pending');

      addToast('Profile setup complete! Welcome to TailorPartner.', 'success');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Failed to complete profile setup. Please try again.';
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
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
          <form onSubmit={handleCompleteSetup} noValidate>
            <h1 className={styles.title}>Let&apos;s set up your profile</h1>
            <p className={styles.subtitle}>Complete these details so customers can find you.</p>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Business Information</h2>
              <Input 
                label="Business Name" 
                placeholder="e.g. Studio M Tailoring" 
                value={businessName}
                onChange={e => {
                  setBusinessName(e.target.value);
                  if (businessNameError) setBusinessNameError('');
                }}
                error={businessNameError}
                required 
              />
              
              <div className={styles.rowGrid}>
                <Input 
                  label="Years of Experience" 
                  type="number"
                  placeholder="e.g. 5" 
                  value={experience}
                  onChange={e => {
                    setExperience(e.target.value);
                    if (experienceError) setExperienceError('');
                  }}
                  error={experienceError}
                  required 
                />
                <Input 
                  label="Specialty/Main Service" 
                  placeholder="e.g. Custom Bridal, Suits" 
                  value={selectedCategories.join(', ')}
                  disabled
                />
              </div>

              <div className={styles.wrapper}>
                <label className={styles.label}>Business Bio</label>
                <textarea 
                  className={`${styles.textarea} ${bioError ? styles.textareaError : ''}`} 
                  placeholder="Tell customers about your expertise, style, and services..." 
                  rows={3} 
                  value={bio}
                  onChange={e => {
                    setBio(e.target.value);
                    if (bioError) setBioError('');
                  }}
                  required 
                />
                {bioError && <span className={styles.errorText}>{bioError}</span>}
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
              
              <div className={styles.rowGrid}>
                <Input 
                  label="City" 
                  placeholder="e.g. Mumbai" 
                  value={city}
                  onChange={e => {
                    setCity(e.target.value);
                    if (cityError) setCityError('');
                  }}
                  error={cityError}
                  required 
                />
                <Input 
                  label="Locality" 
                  placeholder="e.g. Bandra West" 
                  value={locality}
                  onChange={e => {
                    setLocality(e.target.value);
                    if (localityError) setLocalityError('');
                  }}
                  error={localityError}
                  required 
                />
              </div>

              <Input 
                label="Full Address" 
                placeholder="e.g. 123 Fashion Street, Bandra West" 
                value={address}
                onChange={e => {
                  setAddress(e.target.value);
                  if (addressError) setAddressError('');
                }}
                error={addressError}
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
