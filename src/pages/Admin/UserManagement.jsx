import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'employee' };

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const { password: _pw, ...rest } = form;
        await adminService.updateUser(editingUser.id, rest);
        toast.success('User updated.');
      } else {
        await adminService.createUser(form);
        toast.success('User created.');
      }
      setIsModalOpen(false);
      await loadUsers();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save user.';
      toast.error(message);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminService.toggleUserStatus(user.id);
      toast.success(user.disabled ? 'User re-enabled.' : 'User disabled.');
      await loadUsers();
    } catch {
      toast.error('Failed to update user status.');
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await adminService.deleteUser(confirmDeleteId);
      toast.success('User deleted.');
      setConfirmDeleteId(null);
      await loadUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
      toast.error('Failed to delete user.');
    }
  };

  if (loading) {
    return <Loader text="Loading users..." />;
  }

  return (
    <div className="user-management">
      <div className="section-header">
        <h1>User Management</h1>
        <Button onClick={openCreateModal}>+ New User</Button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="table-wrapper">
        <table className="ticket-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="priority-badge" style={{ textTransform: 'capitalize' }}>{user.role}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.disabled ? 'closed' : 'resolved'}`}>
                      {user.disabled ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td className="action-cell">
                    <Button variant="secondary" onClick={() => openEditModal(user)}>Edit</Button>
                    <Button variant="secondary" onClick={() => handleToggleStatus(user)}>
                      {user.disabled ? 'Enable' : 'Disable'}
                    </Button>
                    <Button variant="danger" onClick={() => setConfirmDeleteId(user.id)}>Delete</Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingUser ? 'Edit User' : 'New User'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          {!editingUser && (
            <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
          )}

          <div className="sp-input-group">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="employee">Employee</option>
              <option value="support">Support Engineer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingUser ? 'Save Changes' : 'Create User'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}

export default UserManagement;
