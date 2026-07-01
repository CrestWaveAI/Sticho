'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { MapPicker } from '@/components/ui/MapPicker';
import { useToast } from '@/components/ui/ToastProvider';
import { updateTailor, autocompleteLocations, fetchCategories, fetchTailorDetail, createService, deleteService, Category, ServiceDetail } from '../../api';
import styles from './page.module.css';

export default function ProfilePage() {
  const [formData, setFormData] = useState(() => {
    const defaults = {
      businessName: 'Studio M Tailoring',
      bio: 'Specializing in custom bridal wear and men\'s bespoke suits with over 15 years of experience.',
      experience: '15',
      specialty: 'Bridal & Men\'s Bespoke',
      whatsapp: '9876543210',
      callNumber: '9876543210',
      address: '123 Fashion Street, Near MG Road',
      city: 'Mumbai',
      locality: 'Bandra West',
      latitude: 12.9716 as number | null,
      longitude: 77.5946 as number | null,
    };
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('tailor_profile');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          return {
            businessName: parsed.businessName || defaults.businessName,
            bio: parsed.bio || defaults.bio,
            experience: parsed.experience || defaults.experience,
            whatsapp: parsed.whatsapp || defaults.whatsapp,
            callNumber: parsed.callNumber || defaults.callNumber,
            address: parsed.address || defaults.address,
            city: parsed.city || defaults.city,
            locality: parsed.locality || defaults.locality,
            latitude: parsed.latitude !== undefined ? parsed.latitude : defaults.latitude,
            longitude: parsed.longitude !== undefined ? parsed.longitude : defaults.longitude,
            specialty: parsed.specialty || defaults.specialty,
          };
        } catch (e) {
          console.error(e);
        }
      }
    }
    return defaults;
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [originalServices, setOriginalServices] = useState<ServiceDetail[]>([]);

  useEffect(() => {
    async function loadData() {
      const id = localStorage.getItem('tailor_profile_id') || 'e6ae71c7-c5be-43a9-a9a3-a7d0cb74431e';
      try {
        // Fetch all categories from backend
        const cats = await fetchCategories();
        if (cats && cats.length > 0) {
          setDbCategories(cats);
        } else {
          setDbCategories([
            { id: '5607f519-33a9-4346-b10f-40326245bc8b', name: "Men's" },
            { id: '1ea1e215-ca20-4e6c-815b-10de20789f51', name: "Women's" },
            { id: 'a575e192-c79b-47fa-87b3-4c58b2c6bf44', name: "Boutique" },
            { id: '01b205ff-8de0-4219-b5e7-7adcb94020df', name: "Alterations" },
            { id: 'fd0a02a6-7e8c-47b8-8fd9-005a0bd7b627', name: "Uniforms" }
          ]);
        }

        // Fetch tailor details
        const tailor = await fetchTailorDetail(id);
        if (tailor) {
          if (tailor.services) {
            setOriginalServices(tailor.services);
            const serviceCats = tailor.services
              .map(s => s.category?.name)
              .filter(Boolean) as string[];
            setCategories(serviceCats);
          }
          setFormData(prev => ({
            ...prev,
            businessName: tailor.name || prev.businessName,
            bio: tailor.bio || prev.bio,
            address: tailor.address || prev.address,
            experience: tailor.experience !== undefined ? String(tailor.experience) : prev.experience,
            latitude: tailor.latitude !== undefined ? tailor.latitude : prev.latitude,
            longitude: tailor.longitude !== undefined ? tailor.longitude : prev.longitude,
            whatsapp: tailor.whatsapp_number || prev.whatsapp,
            callNumber: tailor.contact_number || prev.callNumber,
          }));
        }
      } catch (err) {
        console.error("Failed to load profile data from backend:", err);
      }
    }
    loadData();
  }, []);

  const toggleCategory = (cat: string) => {
    setCategories(prev => {
      const isSelected = prev.includes(cat);
      if (isSelected) {
        if (prev.length === 1) {
          addToast('At least one category is required.', 'error');
          return prev;
        }
        return prev.filter(c => c !== cat);
      } else {
        return [...prev, cat];
      }
    });
  };
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Today at 10:42 AM');
  
  // Validation errors
  const [businessNameError, setBusinessNameError] = useState('');
  const [bioError, setBioError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [cityError, setCityError] = useState('');
  const [localityError, setLocalityError] = useState('');
  const [experienceError, setExperienceError] = useState('');
  const [whatsappError, setWhatsappError] = useState('');
  const [callNumberError, setCallNumberError] = useState('');

  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validatePhone = (num: string) => {
    const phoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
    return phoneRegex.test(num.trim());
  };

  const handleCoordsChange = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleSave = async () => {
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

    if (!formData.businessName.trim()) {
      setBusinessNameError('Business Name is required.');
      hasError = true;
    }
    if (!formData.bio.trim()) {
      setBioError('Business Bio is required.');
      hasError = true;
    }
    if (!formData.address.trim()) {
      setAddressError('Full Address is required.');
      hasError = true;
    }
    if (!formData.city.trim()) {
      setCityError('City is required.');
      hasError = true;
    }
    if (!formData.locality.trim()) {
      setLocalityError('Locality is required.');
      hasError = true;
    }

    const expNum = parseInt(formData.experience);
    if (!formData.experience.trim()) {
      setExperienceError('Years of Experience is required.');
      hasError = true;
    } else if (isNaN(expNum) || expNum < 0) {
      setExperienceError('Please enter a valid number of years.');
      hasError = true;
    }

    if (!validatePhone(formData.whatsapp)) {
      setWhatsappError('Please enter a valid WhatsApp number (e.g. +91 98765 43210 or 9876543210).');
      hasError = true;
    }

    if (!validatePhone(formData.callNumber)) {
      setCallNumberError('Please enter a valid call number (e.g. +91 98765 43210 or 9876543210).');
      hasError = true;
    }

    if (formData.latitude === null || formData.longitude === null) {
      addToast('Please set your location coordinates on the map.', 'error');
      hasError = true;
    }

    if (categories.length === 0) {
      addToast('At least one category is required.', 'error');
      return;
    }

    if (hasError) {
      addToast('Please correct the validation errors in the form.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const tailorId = localStorage.getItem('tailor_profile_id') || 'e6ae71c7-c5be-43a9-a9a3-a7d0cb74431e'; // Fallback to Indiranagar dummy tailor if none exists

      // 1. Resolve location ID
      let matchedLocationId: string | null = null;
      try {
        const suggestions = await autocompleteLocations(formData.locality.trim());
        const match = suggestions.find(
          loc => loc.city.toLowerCase() === formData.city.trim().toLowerCase() &&
                 loc.name.toLowerCase() === formData.locality.trim().toLowerCase()
        );
        if (match) {
          matchedLocationId = match.id;
        } else if (suggestions.length > 0) {
          matchedLocationId = suggestions[0].id;
        }
      } catch (err) {
        console.error('Error fetching location autocomplete:', err);
      }

      // 2. Call backend PUT to update database
      await updateTailor(tailorId, {
        name: formData.businessName.trim(),
        bio: formData.bio.trim(),
        address: formData.address.trim(),
        contact_number: formData.callNumber.trim(),
        whatsapp_number: formData.whatsapp.trim(),
        location_id: matchedLocationId,
        experience: expNum,
        latitude: formData.latitude,
        longitude: formData.longitude
      });

      // 2b. Sync categories (services) with the backend
      const originalCatNames = originalServices.map(s => s.category?.name).filter(Boolean) as string[];
      const catsToAdd = categories.filter(cat => !originalCatNames.includes(cat));
      const servicesToDelete = originalServices.filter(s => s.category && !categories.includes(s.category.name));

      for (const catName of catsToAdd) {
        const catObj = dbCategories.find(c => c.name.toLowerCase() === catName.toLowerCase());
        if (catObj) {
          try {
            await createService({
              tailor_id: tailorId,
              category_id: catObj.id
            });
          } catch (err) {
            console.error(`Failed to create service for category ${catName}:`, err);
          }
        }
      }

      for (const service of servicesToDelete) {
        try {
          await deleteService(service.id);
        } catch (err) {
          console.error(`Failed to delete service ${service.id}:`, err);
        }
      }

      // Refetch tailor details to refresh originalServices and categories from DB
      try {
        const freshTailor = await fetchTailorDetail(tailorId);
        if (freshTailor && freshTailor.services) {
          setOriginalServices(freshTailor.services);
          const serviceCats = freshTailor.services
            .map(s => s.category?.name)
            .filter(Boolean) as string[];
          setCategories(serviceCats);
        }
      } catch (refetchErr) {
        console.error("Failed to refetch profile details after sync:", refetchErr);
      }

      // 3. Update localStorage copy
      const localProfile = {
        id: tailorId,
        businessName: formData.businessName.trim(),
        bio: formData.bio.trim(),
        experience: formData.experience.trim(),
        whatsapp: formData.whatsapp.trim(),
        callNumber: formData.callNumber.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        locality: formData.locality.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        categories
      };
      
      localStorage.setItem('tailor_profile', JSON.stringify(localProfile));

      setLastUpdated('Just now');
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Failed to save profile changes. Please try again.';
      addToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addToast(`Logo updated to ${e.target.files[0].name}`, 'success');
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1>Profile Management</h1>
          <p className={styles.subtitle}>Update your business details and portfolio.</p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.lastUpdated}>Last updated: {lastUpdated}</span>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <Card className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Business Details</h2>
            <Input 
              label="Business Name" 
              value={formData.businessName} 
              onChange={e => {
                setFormData({...formData, businessName: e.target.value});
                if (businessNameError) setBusinessNameError('');
              }} 
              error={businessNameError}
            />
            
            <div className={styles.wrapper}>
              <label className={styles.label}>Business Bio</label>
              <textarea 
                className={`${styles.textarea} ${bioError ? styles.textareaError : ''}`} 
                value={formData.bio}
                onChange={e => {
                  setFormData({...formData, bio: e.target.value});
                  if (bioError) setBioError('');
                }}
                rows={4}
              />
              {bioError && <span className={styles.errorText}>{bioError}</span>}
            </div>

            <div className={styles.rowGrid}>
              <Input 
                label="Years of Experience" 
                type="number" 
                value={formData.experience} 
                onChange={e => {
                  setFormData({...formData, experience: e.target.value});
                  if (experienceError) setExperienceError('');
                }} 
                error={experienceError}
              />
              <Input label="Specialty" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} />
            </div>
          </Card>

          <Card className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Contact & Location</h2>
            <div className={styles.rowGrid}>
              <Input 
                label="WhatsApp Number" 
                value={formData.whatsapp} 
                onChange={e => {
                  setFormData({...formData, whatsapp: e.target.value});
                  if (whatsappError) setWhatsappError('');
                }} 
                error={whatsappError}
              />
              <Input 
                label="Call Number" 
                value={formData.callNumber} 
                onChange={e => {
                  setFormData({...formData, callNumber: e.target.value});
                  if (callNumberError) setCallNumberError('');
                }} 
                error={callNumberError}
              />
            </div>
            
            <Input 
              label="Full Address" 
              value={formData.address} 
              onChange={e => {
                setFormData({...formData, address: e.target.value});
                if (addressError) setAddressError('');
              }} 
              error={addressError}
            />
            
            <div className={styles.rowGrid}>
              <Input 
                label="City" 
                value={formData.city} 
                onChange={e => {
                  setFormData({...formData, city: e.target.value});
                  if (cityError) setCityError('');
                }} 
                error={cityError}
              />
              <Input 
                label="Locality" 
                value={formData.locality} 
                onChange={e => {
                  setFormData({...formData, locality: e.target.value});
                  if (localityError) setLocalityError('');
                }} 
                error={localityError}
              />
            </div>

            <div className={styles.wrapper} style={{ marginTop: '1rem' }}>
              <label className={styles.label}>Map Location Pin</label>
              <MapPicker 
                latitude={formData.latitude} 
                longitude={formData.longitude} 
                onChange={handleCoordsChange} 
              />
            </div>
          </Card>
        </div>

        <div className={styles.sideCol}>
          <Card className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Categories</h2>
            <div className={styles.chipGroup} style={{ gap: '0.5rem', display: 'flex', flexWrap: 'wrap' }}>
              {dbCategories.map(cat => {
                const isSelected = categories.includes(cat.name);
                return (
                  <span 
                    key={cat.id} 
                    onClick={() => toggleCategory(cat.name)} 
                    style={{ cursor: 'pointer' }}
                  >
                    <StatusChip 
                      label={cat.name} 
                      status={isSelected ? 'accent' : 'neutral'} 
                    />
                  </span>
                );
              })}
            </div>
          </Card>

          <Card className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Business Logo</h2>
            <div className={styles.logoUpload}>
              <div className={styles.logoPreview}>
                {formData.businessName.charAt(0).toUpperCase()}
              </div>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleLogoUpload} />
              <Button variant="secondary" className={styles.changeLogoBtn} onClick={() => fileInputRef.current?.click()}>
                Change Logo
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
