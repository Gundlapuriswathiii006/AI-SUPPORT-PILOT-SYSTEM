import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const EMPTY_FORM = { title: '', category: '', content: '' };

function KnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await adminService.getKnowledgeBaseArticles();
      setArticles(data);
    } catch (err) {
      console.error('Failed to load knowledge base articles', err);
      setError('Failed to load knowledge base articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const openCreateModal = () => {
    setEditingArticle(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (article) => {
    setEditingArticle(article);
    setForm({ title: article.title, category: article.category, content: article.content });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingArticle) {
        await adminService.updateKnowledgeBaseArticle(editingArticle.id, form);
      } else {
        await adminService.createKnowledgeBaseArticle(form);
      }
      setIsModalOpen(false);
      await loadArticles();
    } catch (err) {
      console.error('Failed to save article', err);
      setError('Failed to save article.');
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await adminService.deleteKnowledgeBaseArticle(confirmDeleteId);
      setConfirmDeleteId(null);
      await loadArticles();
    } catch (err) {
      console.error('Failed to delete article', err);
      setError('Failed to delete article.');
    }
  };

  if (loading) {
    return <Loader text="Loading knowledge base..." />;
  }

  return (
    <div className="knowledge-base">
      <div className="section-header">
        <h1>Knowledge Base</h1>
        <Button onClick={openCreateModal}>+ New Article</Button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="kb-list">
        {articles.length > 0 ? (
          articles.map((article) => (
            <div key={article.id} className="kb-card">
              <h3>{article.title}</h3>
              <p className="kb-category">{article.category}</p>
              <p className="kb-excerpt">{article.content?.slice(0, 120)}...</p>
              <div className="action-cell">
                <Button variant="secondary" onClick={() => openEditModal(article)}>Edit</Button>
                <Button variant="danger" onClick={() => setConfirmDeleteId(article.id)}>Delete</Button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">No knowledge base articles found.</p>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingArticle ? 'Edit Article' : 'New Article'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
          <Input label="Category" name="category" value={form.category} onChange={handleChange} required />

          <div className="input-group">
            <label>Content</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={6}
              required
            />
          </div>

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingArticle ? 'Save Changes' : 'Create Article'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        title="Delete Article"
        message="Are you sure you want to delete this article? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}

export default KnowledgeBase;