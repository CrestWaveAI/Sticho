'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, ArrowLeft, ArrowRight, Upload } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastProvider';
import { 
  fetchTailorDetail, 
  uploadPortfolioImage, 
  deletePortfolioImage, 
  reorderPortfolioImages, 
  PortfolioImage,
  API_BASE_URL
} from '../../api';
import styles from './page.module.css';

export default function PortfolioPage() {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const tailorProfileId = typeof window !== 'undefined' 
    ? localStorage.getItem('tailor_profile_id') || 'd5be0b0e-1f4b-4864-9a69-46ef58eef48b'
    : 'd5be0b0e-1f4b-4864-9a69-46ef58eef48b';

  // Load portfolio images on mount
  useEffect(() => {
    async function loadPortfolio() {
      setIsLoading(true);
      try {
        const tailor = await fetchTailorDetail(tailorProfileId);
        if (tailor && tailor.portfolio_images) {
          // Sort by position
          const sorted = [...tailor.portfolio_images].sort((a, b) => a.position - b.position);
          setImages(sorted);
        }
      } catch (e) {
        console.error('Failed to load portfolio:', e);
        addToast('Failed to load portfolio images.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadPortfolio();
  }, [tailorProfileId, addToast]);

  // Handle file selection and validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const newUrls: string[] = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 1. Check limit
      if (images.length + selectedFiles.length + newFiles.length >= 20) {
        addToast('Maximum limit of 20 portfolio images reached. Skipping remaining files.', 'error');
        break;
      }

      // 2. Validate Type (JPEG, PNG, WEBP)
      if (!allowedTypes.includes(file.type)) {
        addToast(`Unsupported file type for "${file.name}". Only JPEG, PNG, and WEBP are allowed.`, 'error');
        continue;
      }

      // 3. Validate Size (max 5MB)
      if (file.size > maxSize) {
        addToast(`File size for "${file.name}" exceeds the 5MB limit.`, 'error');
        continue;
      }

      newFiles.push(file);
      newUrls.push(URL.createObjectURL(file));
    }

    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Handle upload submit (sequential batch uploads)
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      addToast('Please select at least one image file to upload.', 'error');
      return;
    }

    if (images.length >= 20) {
      addToast('Maximum limit of 20 portfolio images reached.', 'error');
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    const currentImages = [...images];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (currentImages.length >= 20) {
          addToast('Upload stopped: Limit of 20 images reached.', 'error');
          break;
        }
        
        // Single common caption or dynamic label index
        const fileCaption = selectedFiles.length > 1 
          ? (caption.trim() ? `${caption.trim()} (${i + 1})` : undefined)
          : (caption.trim() || undefined);

        const uploadedImage = await uploadPortfolioImage(tailorProfileId, file, fileCaption);
        currentImages.push(uploadedImage);
        successCount++;
      }
      
      // Sort and update
      const sortedImages = currentImages.sort((a, b) => a.position - b.position);
      setImages(sortedImages);
      
      // Reset state
      setIsAddOpen(false);
      setSelectedFiles([]);
      setCaption('');
      setPreviewUrls([]);
      
      addToast(`Successfully uploaded ${successCount} image${successCount !== 1 ? 's' : ''}!`, 'success');
    } catch (e) {
      console.error(e);
      const errMsg = e instanceof Error ? e.message : 'Failed to upload portfolio images.';
      addToast(errMsg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete image
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio image?')) return;
    
    // Optimistic delete
    const previousImages = [...images];
    const filteredImages = images.filter(img => img.id !== imageId);
    // Recalculate sequential positions
    const reindexedImages = filteredImages.map((img, idx) => ({
      ...img,
      position: idx
    }));
    setImages(reindexedImages);

    try {
      await deletePortfolioImage(tailorProfileId, imageId);
      addToast('Portfolio image deleted successfully.', 'success');
    } catch (e) {
      console.error(e);
      setImages(previousImages); // Rollback
      addToast('Failed to delete portfolio image.', 'error');
    }
  };

  // Handle image reordering (moving left/right in array grid)
  const handleMoveImage = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    // Swap positions
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    // Recalculate position indexes
    const updatedImages = newImages.map((img, idx) => ({
      ...img,
      position: idx
    }));

    setImages(updatedImages);

    try {
      const reorderPayload = updatedImages.map(img => ({
        id: img.id,
        position: img.position
      }));
      await reorderPortfolioImages(tailorProfileId, reorderPayload);
    } catch (e) {
      console.error(e);
      addToast('Failed to save updated reordering position.', 'error');
    }
  };

  // Helper to resolve full image url
  const getFullImageUrl = (path: string) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${API_BASE_URL}${path}`;
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1>My Portfolio</h1>
          <p className={styles.subheader}>
            Upload up to 20 images of your bespoke designs and work ({images.length}/20)
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsAddOpen(true)}
          disabled={images.length >= 20}
        >
          <Plus size={18} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'text-bottom' }} />
          Upload Work
        </Button>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading your portfolio...</p>
        </div>
      ) : images.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📷</div>
          <h3>No Portfolio Images</h3>
          <p>Add some high-quality photos of your work to showcase on your public boutique profile.</p>
          <Button variant="secondary" onClick={() => setIsAddOpen(true)}>
            Upload your first photo
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {images.map((img, index) => (
            <Card key={img.id} className={styles.portfolioItem} style={{ padding: 0 }}>
              <div className={styles.imageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={getFullImageUrl(img.image_url)} 
                  alt={img.caption || 'Portfolio work'} 
                  className={styles.portfolioImage}
                />
                
                {/* Actions overlay panel */}
                <div className={styles.cardOverlay}>
                  <div className={styles.reorderPanel}>
                    <button 
                      onClick={() => handleMoveImage(index, -1)} 
                      disabled={index === 0}
                      className={styles.reorderBtn}
                      title="Move Left"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <button 
                      onClick={() => handleMoveImage(index, 1)} 
                      disabled={index === images.length - 1}
                      className={styles.reorderBtn}
                      title="Move Right"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteImage(img.id)}
                    className={styles.deleteBtn}
                    title="Delete Image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className={styles.content}>
                <p className={styles.caption}>
                  {img.caption || <span className={styles.noCaption}>No caption provided</span>}
                </p>
                <div className={styles.positionBadge}>
                  Order: #{index + 1}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isAddOpen} 
        onClose={() => {
          setIsAddOpen(false);
          setSelectedFiles([]);
          setPreviewUrls([]);
          setCaption('');
        }} 
        title="Upload Portfolio Image"
      >
        <form onSubmit={handleUploadSubmit} className={styles.uploadForm}>
          <div className={styles.fileUploadArea} onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg, image/png, image/webp"
              multiple
              style={{ display: 'none' }}
            />
            {previewUrls.length > 0 ? (
              <div className={styles.previewGrid}>
                {previewUrls.map((url, idx) => (
                  <div key={idx} className={styles.previewItem}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Upload preview ${idx}`} className={styles.previewImg} />
                  </div>
                ))}
                <div className={styles.changeLabel}>
                  {previewUrls.length} file{previewUrls.length !== 1 ? 's' : ''} selected. Click to add/change.
                </div>
              </div>
            ) : (
              <div className={styles.uploadPrompt}>
                <Upload size={32} className={styles.uploadIcon} />
                <span className={styles.uploadTitle}>Choose files or drag here</span>
                <span className={styles.uploadFormats}>Supported: JPEG, PNG, WEBP (Max 5MB per file)</span>
              </div>
            )}
          </div>

          <Input 
            label="Caption / Description" 
            placeholder="e.g. Silk Zari embroidered bridal blouse" 
            value={caption} 
            onChange={e => setCaption(e.target.value)} 
          />

          <div className={styles.formActions}>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setIsAddOpen(false);
                setSelectedFiles([]);
                setPreviewUrls([]);
                setCaption('');
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={selectedFiles.length === 0 || isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Work'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
