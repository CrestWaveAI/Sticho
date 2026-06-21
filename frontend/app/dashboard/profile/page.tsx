'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastProvider';
import styles from './page.module.css';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    businessName: 'Studio M Tailoring',
    bio: 'Specializing in custom bridal wear and men\'s bespoke suits with over 15 years of experience.',
    experience: '15',
    specialty: 'Bridal & Men\'s Bespoke',
    whatsapp: '+91 98765 43210',
    callNumber: '+91 98765 43210',
    address: '123 Fashion Street, Near MG Road',
    city: 'Mumbai',
    locality: 'Bandra West'
  });
  const [categories, setCategories] = useState(['Bridal Wear', 'Men\'s Tailoring', 'Custom Orders', 'Alterations']);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Today at 10:42 AM');
  
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setLastUpdated('Just now');
    addToast('Profile changes saved successfully!', 'success');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory)) {
      addToast('Category already exists', 'error');
      return;
    }
    setCategories([...categories, newCategory]);
    setNewCategory('');
    setIsCategoryModalOpen(false);
    addToast('Category added', 'success');
  };

  const removeCategory = (catToRemove: string) => {
    setCategories(categories.filter(cat => cat !== catToRemove));
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
            <Input label="Business Name" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
            
            <div className={styles.wrapper}>
              <label className={styles.label}>Business Bio</label>
              <textarea 
                className={styles.textarea} 
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                rows={4}
              />
            </div>

            <div className={styles.rowGrid}>
              <Input label="Years of Experience" type="number" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
              <Input label="Specialty" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} />
            </div>
          </Card>

          <Card className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Contact & Location</h2>
            <div className={styles.rowGrid}>
              <Input label="WhatsApp Number" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
              <Input label="Call Number" value={formData.callNumber} onChange={e => setFormData({...formData, callNumber: e.target.value})} />
            </div>
            
            <Input label="Full Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            <div className={styles.rowGrid}>
              <Input label="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              <Input label="Locality" value={formData.locality} onChange={e => setFormData({...formData, locality: e.target.value})} />
            </div>
          </Card>
        </div>

        <div className={styles.sideCol}>
          <Card className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Categories</h2>
            <div className={styles.chipGroup}>
              {categories.map(cat => (
                <StatusChip key={cat} label={cat} status="neutral" onRemove={() => removeCategory(cat)} />
              ))}
            </div>
            <Button variant="secondary" fullWidth className={styles.addCategoryBtn} onClick={() => setIsCategoryModalOpen(true)}>+ Add Category</Button>
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

      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Add Category">
        <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            label="Category Name" 
            placeholder="e.g. Ethnic Wear" 
            value={newCategory} 
            onChange={e => setNewCategory(e.target.value)} 
            required 
          />
          <Button type="submit" fullWidth>Add Category</Button>
        </form>
      </Modal>
    </div>
  );
}
