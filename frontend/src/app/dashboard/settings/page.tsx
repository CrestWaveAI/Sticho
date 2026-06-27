'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastProvider';
import styles from './page.module.css';

export default function SettingsPage() {
  const [availability, setAvailability] = useState<'open' | 'closed' | 'unavailable'>('open');
  const [contactInfo, setContactInfo] = useState({ email: 'studiom@example.com', phone: '+91 98765 43210' });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [hours, setHours] = useState([
    { day: 'Mon - Fri', time: '10:00 AM - 8:00 PM' },
    { day: 'Saturday', time: '10:00 AM - 9:00 PM' },
    { day: 'Sunday', time: 'Closed' }
  ]);
  const [tempHours, setTempHours] = useState(hours);
  const { addToast } = useToast();

  const handleAvailabilityChange = (val: 'open' | 'closed' | 'unavailable') => {
    setAvailability(val);
    addToast(`Business status updated to ${val}`, 'success');
  };

  const handleUpdateContact = () => {
    addToast('Contact info updated successfully', 'success');
  };

  const handleChangePassword = () => {
    if (!password.current || !password.new || !password.confirm) {
      addToast('Please fill all password fields', 'error');
      return;
    }
    if (password.new !== password.confirm) {
      addToast('New passwords do not match', 'error');
      return;
    }
    addToast('Password changed successfully', 'success');
    setPassword({ current: '', new: '', confirm: '' });
  };

  const handleSaveHours = () => {
    setHours(tempHours);
    setIsHoursModalOpen(false);
    addToast('Business hours updated', 'success');
  };

  const handleTempHourChange = (index: number, newTime: string) => {
    const newTemp = [...tempHours];
    newTemp[index].time = newTime;
    setTempHours(newTemp);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Settings</h1>
      </div>

      <div className={styles.settingsLayout}>
        <div className={styles.mainCol}>
          <Card className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Account Settings</h2>
            <div className={styles.formGroup}>
              <h3 className={styles.subTitle}>Contact Information</h3>
              <Input label="Email Address" value={contactInfo.email} onChange={e => setContactInfo({...contactInfo, email: e.target.value})} />
              <Input label="Phone Number" value={contactInfo.phone} onChange={e => setContactInfo({...contactInfo, phone: e.target.value})} />
              <Button variant="secondary" className={styles.updateBtn} onClick={handleUpdateContact}>Update Contact Info</Button>
            </div>
            
            <hr className={styles.divider} />
            
            <div className={styles.formGroup}>
              <h3 className={styles.subTitle}>Security</h3>
              <Input label="Current Password" type="password" placeholder="••••••••" value={password.current} onChange={e => setPassword({...password, current: e.target.value})} />
              <Input label="New Password" type="password" placeholder="••••••••" value={password.new} onChange={e => setPassword({...password, new: e.target.value})} />
              <Input label="Confirm New Password" type="password" placeholder="••••••••" value={password.confirm} onChange={e => setPassword({...password, confirm: e.target.value})} />
              <Button variant="secondary" className={styles.updateBtn} onClick={handleChangePassword}>Change Password</Button>
            </div>
          </Card>
        </div>

        <div className={styles.sideCol}>
          <Card className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Business Status</h2>
            
            <div className={styles.availabilitySection}>
              <label className={styles.label}>Current Availability</label>
              
              <div className={styles.toggleGroup}>
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="availability" 
                    value="open" 
                    checked={availability === 'open'}
                    onChange={() => handleAvailabilityChange('open')}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>Open</span>
                  {availability === 'open' && <StatusChip label="Active" status="success" className={styles.statusChip} />}
                </label>
                
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="availability" 
                    value="closed" 
                    checked={availability === 'closed'}
                    onChange={() => handleAvailabilityChange('closed')}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>Closed (Outside Hours)</span>
                  {availability === 'closed' && <StatusChip label="Inactive" status="neutral" className={styles.statusChip} />}
                </label>

                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="availability" 
                    value="unavailable" 
                    checked={availability === 'unavailable'}
                    onChange={() => handleAvailabilityChange('unavailable')}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>Temporarily Unavailable</span>
                  {availability === 'unavailable' && <StatusChip label="Away" status="warning" className={styles.statusChip} />}
                </label>
              </div>
            </div>
          </Card>

          <Card className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Business Hours</h2>
            <div className={styles.hoursList}>
              {hours.map((h, i) => (
                <div key={i} className={styles.hourRow}>
                  <span className={styles.day}>{h.day}</span>
                  <span className={styles.time}>{h.time}</span>
                </div>
              ))}
            </div>
            <Button variant="secondary" fullWidth className={styles.editHoursBtn} onClick={() => { setTempHours(hours); setIsHoursModalOpen(true); }}>Edit Hours</Button>
          </Card>
        </div>
      </div>

      <Modal isOpen={isHoursModalOpen} onClose={() => setIsHoursModalOpen(false)} title="Edit Business Hours">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tempHours.map((h, i) => (
            <Input 
              key={i} 
              label={h.day} 
              value={h.time} 
              onChange={e => handleTempHourChange(i, e.target.value)} 
            />
          ))}
          <Button fullWidth onClick={handleSaveHours}>Save Hours</Button>
        </div>
      </Modal>
    </div>
  );
}
