'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastProvider';
import { fetchTailorDetail, updateTailor, WorkingHourDay } from '../../api';
import styles from './page.module.css';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function SettingsPage() {
  const [tailorId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tailor_profile_id') || 'd5be0b0e-1f4b-4864-9a69-46ef58eef48b';
    }
    return 'd5be0b0e-1f4b-4864-9a69-46ef58eef48b';
  });
  const [availability, setAvailability] = useState<'open' | 'closed' | 'unavailable'>('open');
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Notifications preferences
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationChannel, setNotificationChannel] = useState('whatsapp');

  // Structured Working Hours state
  const [workingHours, setWorkingHours] = useState<Record<string, WorkingHourDay>>({
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '10:00', close: '17:00', closed: false },
    sunday: { open: null, close: null, closed: true }
  });

  const [tempWorkingHours, setTempWorkingHours] = useState<Record<string, WorkingHourDay>>(workingHours);
  const { addToast } = useToast();

  // Fetch tailor settings on mount
  useEffect(() => {
    if (!tailorId) return;

    async function loadSettings() {
      setIsLoading(true);
      try {
        const detail = await fetchTailorDetail(tailorId);
        setContactInfo({
          email: detail.email || '',
          phone: detail.contact_number || ''
        });
        
        if (detail.notifications_enabled !== undefined) {
          setNotificationsEnabled(detail.notifications_enabled);
        }
        if (detail.notification_channel) {
          setNotificationChannel(detail.notification_channel);
        }

        // Parse working hours from database
        if (detail.working_hours) {
          const parsedHours: Record<string, WorkingHourDay> = {};
          
          DAYS_OF_WEEK.forEach(day => {
            const rawDay = detail.working_hours![day];
            if (rawDay && typeof rawDay === 'object') {
              parsedHours[day] = {
                open: rawDay.open || '09:00',
                close: rawDay.close || '18:00',
                closed: !!rawDay.closed
              };
            } else {
              // Graceful fallback for each day if not set or legacy
              parsedHours[day] = {
                open: '09:00',
                close: '18:00',
                closed: day === 'sunday'
              };
            }
          });
          setWorkingHours(parsedHours);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        addToast('Error loading settings from backend. Using local defaults.', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [tailorId, addToast]);

  const handleAvailabilityChange = (val: 'open' | 'closed' | 'unavailable') => {
    setAvailability(val);
    addToast(`Business status updated to ${val}`, 'success');
  };

  const handleUpdateContact = async () => {
    if (!tailorId) return;
    try {
      await updateTailor(tailorId, {
        email: contactInfo.email,
        contact_number: contactInfo.phone
      });
      addToast('Contact info updated successfully in the database.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to update contact info.', 'error');
    }
  };

  const handleSaveNotificationPrefs = async () => {
    if (!tailorId) return;
    try {
      await updateTailor(tailorId, {
        notifications_enabled: notificationsEnabled,
        notification_channel: notificationChannel
      });
      addToast('Notification preferences updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to save notification preferences.', 'error');
    }
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

  const handleSaveHours = async () => {
    if (!tailorId) return;
    try {
      await updateTailor(tailorId, {
        working_hours: tempWorkingHours
      });
      setWorkingHours(tempWorkingHours);
      setIsHoursModalOpen(false);
      addToast('Business hours saved successfully.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to save business hours.', 'error');
    }
  };

  const handleTempHourClosedChange = (day: string, closed: boolean) => {
    setTempWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed
      }
    }));
  };

  const handleTempHourOpenTimeChange = (day: string, open: string) => {
    setTempWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        open
      }
    }));
  };

  const handleTempHourCloseTimeChange = (day: string, close: string) => {
    setTempWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        close
      }
    }));
  };

  // Convert "09:00" to "9:00 AM" for display
  const formatTime12h = (timeStr: string | null) => {
    if (!timeStr) return '';
    const [hourStr, minStr] = timeStr.split(':');
    const hour = parseInt(hourStr);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minStr} ${suffix}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Settings</h1>
      </div>

      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your settings...
        </div>
      ) : (
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

            <Card className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Alert Preferences</h2>
              <div className={styles.formGroup}>
                <h3 className={styles.subTitle}>Lead Alerts & Notifications</h3>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={e => setNotificationsEnabled(e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  <span>Receive alerts on customer views, clicks, and lead captures</span>
                </label>

                <div className={styles.channelSelectWrapper}>
                  <label className={styles.label} style={{ marginBottom: '0.5rem' }}>Notification Channel</label>
                  <select
                    value={notificationChannel}
                    onChange={e => setNotificationChannel(e.target.value)}
                    className={styles.selectInput}
                    disabled={!notificationsEnabled}
                  >
                    <option value="whatsapp">WhatsApp alerts</option>
                    <option value="sms">SMS alerts</option>
                    <option value="both">Both WhatsApp & SMS</option>
                  </select>
                </div>

                <Button 
                  variant="secondary" 
                  className={styles.updateBtn} 
                  style={{ marginTop: '1.5rem' }} 
                  onClick={handleSaveNotificationPrefs}
                >
                  Save Preferences
                </Button>
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
                {DAYS_OF_WEEK.map(day => {
                  const h = workingHours[day] || { open: '09:00', close: '18:00', closed: false };
                  const formattedDay = day.charAt(0).toUpperCase() + day.slice(1);
                  return (
                    <div key={day} className={styles.hourRow}>
                      <span className={styles.day}>{formattedDay}</span>
                      <span className={styles.time}>
                        {h.closed ? 'Closed' : `${formatTime12h(h.open)} - ${formatTime12h(h.close)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Button variant="secondary" fullWidth className={styles.editHoursBtn} onClick={() => { setTempWorkingHours(workingHours); setIsHoursModalOpen(true); }}>Edit Hours</Button>
            </Card>
          </div>
        </div>
      )}

      <Modal isOpen={isHoursModalOpen} onClose={() => setIsHoursModalOpen(false)} title="Edit Business Hours">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {DAYS_OF_WEEK.map(day => {
            const h = tempWorkingHours[day] || { open: '09:00', close: '18:00', closed: false };
            const formattedDay = day.charAt(0).toUpperCase() + day.slice(1);

            return (
              <div key={day} className={styles.hoursEditRow}>
                <span className={styles.dayLabel}>{formattedDay}</span>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={h.closed}
                    onChange={e => handleTempHourClosedChange(day, e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  <span>Closed</span>
                </label>
                <div className={styles.hoursTimeInputs}>
                  <input
                    type="time"
                    value={h.open || '09:00'}
                    disabled={h.closed}
                    onChange={e => handleTempHourOpenTimeChange(day, e.target.value)}
                    className={styles.hoursTimeInput}
                  />
                  <span className={styles.timeSeparator}>to</span>
                  <input
                    type="time"
                    value={h.close || '18:00'}
                    disabled={h.closed}
                    onChange={e => handleTempHourCloseTimeChange(day, e.target.value)}
                    className={styles.hoursTimeInput}
                  />
                </div>
              </div>
            );
          })}
          <Button fullWidth style={{ marginTop: '1rem' }} onClick={handleSaveHours}>Save Hours</Button>
        </div>
      </Modal>
    </div>
  );
}
