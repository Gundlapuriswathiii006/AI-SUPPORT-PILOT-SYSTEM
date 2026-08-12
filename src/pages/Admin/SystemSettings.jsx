import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

function SystemSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminService.getSystemSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await adminService.updateSystemSettings(settings);
      setSettings(updated);
      toast.success('Settings saved.');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return <Loader text="Loading settings..." />;

  return (
    <div className="system-settings">
      <div className="section-header">
        <h1>System Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <Input label="Site Name" name="siteName" value={settings.siteName} onChange={handleChange} required />
        <Input label="Support Email" name="supportEmail" type="email" value={settings.supportEmail} onChange={handleChange} required />

        <div className="sp-input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.6rem' }}>
          <input
            id="autoAssignTickets"
            type="checkbox"
            name="autoAssignTickets"
            checked={!!settings.autoAssignTickets}
            onChange={handleChange}
            style={{ width: 'auto' }}
          />
          <label htmlFor="autoAssignTickets" style={{ marginBottom: 0 }}>Auto-assign new tickets to available agents</label>
        </div>

        <div className="sp-input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.6rem' }}>
          <input
            id="aiClassificationEnabled"
            type="checkbox"
            name="aiClassificationEnabled"
            checked={!!settings.aiClassificationEnabled}
            onChange={handleChange}
            style={{ width: 'auto' }}
          />
          <label htmlFor="aiClassificationEnabled" style={{ marginBottom: 0 }}>Enable AI ticket classification</label>
        </div>

        <Button type="submit" disabled={saving} className="mt-2">
          {saving ? 'Saving…' : 'Save Settings'}
        </Button>
      </form>
    </div>
  );
}

export default SystemSettings;
