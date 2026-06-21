import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import styles from './quote.module.css';

const QUOTE_TEMPLATES = [
  { name: 'Standard Shirt', items: [{ desc: 'Basic Shirt Stitching', price: 400 }, { desc: 'Custom Collar', price: 100 }] },
  { name: 'Bridal Blouse', items: [{ desc: 'Bridal Blouse Base', price: 1200 }, { desc: 'Zardosi Work', price: 800 }] },
  { name: 'Basic Alteration', items: [{ desc: 'Hemming/Sizing', price: 200 }] },
];

export default function QuotePage() {
  const [quoteItems, setQuoteItems] = useState([{ desc: '', price: '' }]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const applyTemplate = (templateName: string) => {
    const template = QUOTE_TEMPLATES.find(t => t.name === templateName);
    if (template) {
      setQuoteItems(template.items.map(i => ({ desc: i.desc, price: i.price.toString() })));
      setSelectedTemplate(templateName);
    }
  };

  const addItem = () => setQuoteItems([...quoteItems, { desc: '', price: '' }]);
  const removeItem = (index: number) => setQuoteItems(quoteItems.filter((_, i) => i !== index));
  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...quoteItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setQuoteItems(newItems);
  };

  const total = quoteItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Create Quote</h1>
          <p className={styles.subtitle}>Convert Lead #L1 (Priya Das) into a professional quote.</p>
        </div>
        <StatusChip label="Draft" status="neutral" />
      </header>

      <div className={styles.mainGrid}>
        <section className={styles.formSection}>
          <Card className={styles.card}>
            <div className={styles.templateSection}>
              <label className={styles.sectionLabel}>Quick Templates</label>
              <div className={styles.templateGrid}>
                {QUOTE_TEMPLATES.map(t => (
                  <button 
                    key={t.name} 
                    className={`${styles.templateBtn} ${selectedTemplate === t.name ? styles.activeTemplate : ''}`}
                    onClick={() => applyTemplate(t.name)}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.itemsSection}>
              <label className={styles.sectionLabel}>Line Items</label>
              <div className={styles.itemsList}>
                {quoteItems.map((item, index) => (
                  <div key={index} className={styles.itemRow}>
                    <input 
                      type="text" 
                      placeholder="Service description" 
                      value={item.desc} 
                      onChange={(e) => updateItem(index, 'desc', e.target.value)}
                      className={styles.descInput}
                    />
                    <div className={styles.priceGroup}>
                      <span>₹</span>
                      <input 
                        type="number" 
                        placeholder="0" 
                        value={item.price} 
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                        className={styles.priceInput}
                      />
                    </div>
                    <button onClick={() => removeItem(index)} className={styles.removeBtn}>&times;</button>
                  </div>
                ))}
              </div>
              <Button variant="secondary" onClick={addItem} className={styles.addBtn}>+ Add Line Item</Button>
            </div>

            <div className={styles.deliverySection}>
              <label className={styles.sectionLabel}>Estimated Delivery</label>
              <input type="date" className={styles.dateInput} />
            </div>
          </Card>
        </section>

        <section className={styles.summarySection}>
          <Card className={styles.summaryCard}>
            <h2>Quote Summary</h2>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span className="tabular-nums">₹{total}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Platform Fee (0%)</span>
                <span className="tabular-nums">₹0</span>
              </div>
              <div className={styles.totalRow}>
                <span>Total Amount</span>
                <span className={`${styles.totalValue} tabular-nums`}>₹{total}</span>
              </div>
            </div>
            <div className={styles.footerActions}>
              <Button variant="secondary" fullWidth className={styles.saveDraft}>Save as Draft</Button>
              <Button fullWidth className={styles.sendQuote}>Send to Customer</Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
