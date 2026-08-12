import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ticketService } from '../../services/ticketService';

const categories = ['Software', 'Hardware', 'Network', 'Access', 'Other'];

export default function CreateTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    category: categories[0],
    description: '',
    tags: '',
    customerEmail: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required.');
      return;
    }
    setSubmitting(true);
    try {
      await ticketService.createTicket({
        title: form.title,
        category: form.category,
        description: form.description,
        tags: form.tags,
        customerEmail: form.customerEmail,
      });
      toast.success('Ticket submitted successfully!');
      navigate('/employee/tickets');
    } catch {
      toast.error('Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '2rem',
        }}
      >
        <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.3rem', letterSpacing: '-0.5px' }}>
          Create Ticket
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Describe the issue and let the AI agent classify it instantly.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Title + Category row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="sp-input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder=""
              />
            </div>

            <div className="sp-input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={form.category} onChange={handleChange}>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="sp-input-group">
            <label htmlFor="customerEmail">Reply-to email</label>
            <input
              id="customerEmail"
              name="customerEmail"
              type="email"
              value={form.customerEmail}
              onChange={handleChange}
              placeholder="Where support should send updates"
            />
            <small>We use this address to keep email replies linked to the ticket.</small>
          </div>

          {/* Description */}
          <div className="sp-input-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              style={{ minHeight: '120px' }}
            />
          </div>

          {/* Tags */}
          <div className="sp-input-group">
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={form.tags}
              onChange={handleChange}
              placeholder="vpn, remote access, windows"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: 'var(--cyan)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '0.6rem 1.4rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginTop: '0.5rem',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
}
