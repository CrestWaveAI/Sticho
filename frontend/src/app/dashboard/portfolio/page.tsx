'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastProvider';
import styles from './page.module.css';

const initialItems = [
  {
    id: 1,
    title: 'Bridal Lehenga',
    description: 'Custom designed heavy embroidery bridal lehenga with intricate zari work.',
    price: '₹25,000',
    category: 'Bridal',
  },
  {
    id: 2,
    title: 'Bespoke Men\'s Suit',
    description: 'Three-piece tailored suit in premium Italian wool.',
    price: '₹18,000',
    category: 'Men\'s Wear',
  },
  {
    id: 3,
    title: 'Designer Saree Blouse',
    description: 'Contemporary deep-back blouse with hand-stitched detailing.',
    price: '₹3,500',
    category: 'Womenswear',
  },
  {
    id: 4,
    title: 'Sherwani Set',
    description: 'Traditional men\'s sherwani with matching mojari and safa.',
    price: '₹22,000',
    category: 'Men\'s Wear',
  }
];

export default function PortfolioPage() {
  const [items, setItems] = useState(initialItems);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', description: '', price: '', category: '' });
  const { addToast } = useToast();

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title || !newItem.price) {
      addToast('Title and Price are required.', 'error');
      return;
    }
    const item = {
      id: Date.now(),
      title: newItem.title,
      description: newItem.description || 'No description provided.',
      price: newItem.price,
      category: newItem.category || 'Other'
    };
    setItems([item, ...items]);
    setIsAddOpen(false);
    setNewItem({ title: '', description: '', price: '', category: '' });
    addToast('Portfolio item added!', 'success');
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>My Portfolio</h1>
        <Button variant="primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={18} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'text-bottom' }} />
          Add Item
        </Button>
      </div>

      <div className={styles.grid}>
        {items.map(item => (
          <Card key={item.id} interactive className={styles.portfolioItem} style={{ padding: 0 }}>
            <div className={styles.imagePlaceholder}>
              <ImageIcon size={48} opacity={0.5} />
            </div>
            <div className={styles.content}>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.description}>{item.description}</p>
              <div className={styles.meta}>
                <StatusChip label={item.category} status="neutral" />
                <span className={styles.price}>{item.price}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Portfolio Item">
        <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            label="Title" 
            placeholder="e.g. Wedding Gown" 
            value={newItem.title} 
            onChange={e => setNewItem({...newItem, title: e.target.value})} 
            required 
          />
          <Input 
            label="Price" 
            placeholder="e.g. ₹15,000" 
            value={newItem.price} 
            onChange={e => setNewItem({...newItem, price: e.target.value})} 
            required 
          />
          <Input 
            label="Category" 
            placeholder="e.g. Bridal" 
            value={newItem.category} 
            onChange={e => setNewItem({...newItem, category: e.target.value})} 
          />
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Description</label>
            <textarea 
              rows={3} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
              placeholder="Describe the fabric, work, etc."
              value={newItem.description}
              onChange={e => setNewItem({...newItem, description: e.target.value})}
            />
          </div>
          <Button type="submit" fullWidth>Add Item</Button>
        </form>
      </Modal>
    </div>
  );
}
