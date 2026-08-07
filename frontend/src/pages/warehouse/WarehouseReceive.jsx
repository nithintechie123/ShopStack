import { useState } from 'react';
import styles from './warehouse.module.css';

const initialForm = {
  productName: '',
  category: '',
  quantity: '',
  supplier: '',
  receivedDate: '',
};

export default function WarehouseReceive() {
  const [form, setForm] = useState(initialForm);
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSuccess(true);
    setForm(initialForm);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Receive Inventory</h1>
          <p className={styles.pageSubtitle}>Capture inbound stock and register new products in the warehouse system.</p>
        </div>
      </div>

      <div className={styles.formCard}>
        {success && <div className={styles.alertSuccess}>Inventory received successfully.</div>}
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {[
            { id: 'productName', label: 'Product Name', type: 'text' },
            { id: 'category', label: 'Category', type: 'text' },
            { id: 'quantity', label: 'Quantity', type: 'number' },
            { id: 'supplier', label: 'Supplier', type: 'text' },
            { id: 'receivedDate', label: 'Received Date', type: 'date', full: true },
          ].map((field) => (
            <div key={field.id} className={`${styles.fieldGroup} ${field.full ? styles.fullWidth : ''}`}>
              <label htmlFor={field.id} className={styles.label}>{field.label}</label>
              <input
                id={field.id}
                name={field.id}
                type={field.type}
                value={form[field.id]}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
          ))}

          <div className={styles.formActions} style={{ width: '100%' }}>
            <button type="submit" className={`${styles.actionButton} ${styles.primaryButton}`}>Receive Inventory</button>
          </div>
        </form>
      </div>
    </div>
  );
}
