import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWarehouse } from '../../data/warehouseData';
import styles from '../warehouse/warehouse.module.css';

const initialState = {
  warehouseName: '',
  warehouseCode: '',
  address: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  capacity: '',
  managerName: '',
  managerEmail: '',
  contactNumber: '',
  status: 'Active',
};

export default function WarehouseCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    createWarehouse(form);
    setSuccess(true);
    setTimeout(() => navigate('/admin/warehouses'), 1100);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Create Warehouse</h1>
          <p className={styles.pageSubtitle}>Add a new warehouse location to the fulfillment network.</p>
        </div>
      </div>

      <div className={styles.formCard}>
        {success && <div className={styles.alertSuccess}>Warehouse created successfully. Redirecting to the warehouse list…</div>}

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {[
            { id: 'warehouseName', label: 'Warehouse Name', type: 'text' },
            { id: 'warehouseCode', label: 'Warehouse Code', type: 'text' },
            { id: 'address', label: 'Address', type: 'text', full: true },
            { id: 'city', label: 'City', type: 'text' },
            { id: 'state', label: 'State', type: 'text' },
            { id: 'country', label: 'Country', type: 'text' },
            { id: 'pincode', label: 'Pincode', type: 'text' },
            { id: 'capacity', label: 'Capacity', type: 'text' },
            { id: 'managerName', label: 'Manager Name', type: 'text' },
            { id: 'managerEmail', label: 'Manager Email', type: 'email' },
            { id: 'contactNumber', label: 'Contact Number', type: 'text' },
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

          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <label htmlFor="status" className={styles.label}>Status</label>
            <select id="status" name="status" value={form.status} onChange={handleChange} className={styles.select}>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className={styles.formActions} style={{ width: '100%' }}>
            <button type="submit" className={`${styles.actionButton} ${styles.primaryButton}`}>Create Warehouse</button>
            <button type="button" className={`${styles.actionButton} ${styles.secondaryButton}`} onClick={() => navigate('/admin/warehouses')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
