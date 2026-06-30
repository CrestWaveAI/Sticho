'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { Button } from '@/components/ui/Button';
import styles from './profile.module.css';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'info' | 'verification' | 'portfolio'>('info');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Tailor Profile</h1>
          <p className={styles.subtitle}>Manage your business presence on the marketplace.</p>
        </div>
        <div className={styles.statusCard}>
          <span className={styles.statusLabel}>Account Status:</span>
          <StatusChip label="Pending Review" status="warning" />
        </div>
      </header>

      <nav className={styles.tabs}>
        <button 
          className={activeTab === 'info' ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab('info')}
        >
          Business Info
        </button>
        <button 
          className={activeTab === 'verification' ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab('verification')}
        >
          Verification
        </button>
        <button 
          className={activeTab === 'portfolio' ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab('portfolio')}
        >
          Portfolio
        </button>
      </nav>

      <main className={styles.content}>
        {activeTab === 'info' && (
          <Card className={styles.sectionCard}>
            <h2>Business Details</h2>
            <div className={styles.grid}>
              <div className={styles.inputGroup}>
                <label>Business Name</label>
                <input type="text" defaultValue="Elite Stitches" />
              </div>
              <div className={styles.inputGroup}>
                <label>Years of Experience</label>
                <input type="text" defaultValue="12 Years" />
              </div>
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label>Business Bio</label>
                <textarea rows={4} defaultValue="Specializing in bespoke bridal wear and luxury men's suits with a focus on precision fit." />
              </div>
            </div>
            <Button className={styles.saveBtn}>Save Changes</Button>
          </Card>
        )}

        {activeTab === 'verification' && (
          <Card className={styles.sectionCard}>
            <h2>Trust & Verification</h2>
            <p className={styles.verificationHint}>Verified profiles get 3x more leads from customers.</p>
            
            <div className={styles.verificationList}>
              <div className={styles.verificationItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>Phone Verification</span>
                  <span className={styles.itemDesc}>Verified via OTP during registration</span>
                </div>
                <StatusChip label="Verified" status="success" />
              </div>

              <div className={styles.verificationItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>Identity Verification</span>
                  <span className={styles.itemDesc}>Upload government issued ID</span>
                </div>
                <div className={styles.actionArea}>
                  <StatusChip label="Pending" status="warning" />
                  <Button variant="secondary">View Document</Button>
                </div>
              </div>

              <div className={styles.verificationItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>Address Verification</span>
                  <span className={styles.itemDesc}>Verify your shop location</span>
                </div>
                <div className={styles.actionArea}>
                  <StatusChip label="Not Started" status="neutral" />
                  <Button variant="secondary">Upload Proof</Button>
                </div>
              </div>

              <div className={styles.verificationItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>Bank Details</span>
                  <span className={styles.itemDesc}>Required for payouts</span>
                </div>
                <div className={styles.actionArea}>
                  <StatusChip label="Missing" status="danger" />
                  <Button variant="secondary">Add Account</Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'portfolio' && (
          <div className={styles.portfolioGrid}>
            <Card className={styles.uploadCard}>
              <div className={styles.uploadPlaceholder}>
                <span className={styles.plusIcon}>+</span>
                <p>Add Portfolio Image</p>
                <span className={styles.hint}>Tag by category for better visibility</span>
              </div>
            </Card>
            {/* Sample items */}
            {[1, 2, 3].map(i => (
              <Card key={i} className={styles.imageCard}>
                <div className={styles.imagePlaceholder}>Image {i}</div>
                <div className={styles.imageFooter}>
                  <StatusChip label="Bridal Wear" status="neutral" />
                  <Button variant="danger" className={styles.removeBtn}>Remove</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
