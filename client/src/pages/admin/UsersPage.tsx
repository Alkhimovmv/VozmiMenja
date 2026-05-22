import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../api/admin/client';

interface AdminUser {
  id: number;
  phone: string;
  role: 'superadmin' | 'admin';
  name: string | null;
  created_at: string;
}

const UsersPage: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ phone: '', password: '', role: 'admin', name: '' });

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await apiClient.get('/users');
      return res.data;
    },
    enabled: isSuperAdmin,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => apiClient.post('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowForm(false);
      setForm({ phone: '', password: '', role: 'admin', name: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<typeof form> }) =>
      apiClient.put(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditUser(null);
      setForm({ phone: '', password: '', role: 'admin', name: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center text-gray-500">
        Доступ только для суперадмина
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editUser) {
      const data: any = { role: form.role, name: form.name };
      if (form.password) data.password = form.password;
      updateMutation.mutate({ id: editUser.id, data });
    } else {
      createMutation.mutate(form);
    }
  };

  const openEdit = (user: AdminUser) => {
    setEditUser(user);
    setForm({ phone: user.phone, password: '', role: user.role, name: user.name || '' });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditUser(null);
    setForm({ phone: '', password: '', role: 'admin', name: '' });
    setShowForm(true);
  };

  const error = (createMutation.error || updateMutation.error) as any;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
        <button
          onClick={openCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          + Добавить
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            {editUser ? 'Редактировать пользователя' : 'Новый пользователь'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Номер телефона</label>
              <input
                type="tel"
                required={!editUser}
                disabled={!!editUser}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-50"
                placeholder="+79001234567"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Пароль {editUser && <span className="text-gray-400">(оставьте пустым чтобы не менять)</span>}
              </label>
              <input
                type="password"
                required={!editUser}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Пароль"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Имя администратора"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              >
                <option value="admin">Администратор</option>
                <option value="superadmin">Супер-администратор</option>
              </select>
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error?.response?.data?.error || 'Ошибка'}</div>
            )}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {editUser ? 'Сохранить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-500 text-sm">Загрузка...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Телефон</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Имя</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Роль</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-800">+{user.phone}</td>
                  <td className="px-4 py-3 text-gray-700">{user.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      user.role === 'superadmin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'superadmin' ? 'Супер-админ' : 'Администратор'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(user)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Удалить пользователя +${user.phone}?`)) {
                          deleteMutation.mutate(user.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
