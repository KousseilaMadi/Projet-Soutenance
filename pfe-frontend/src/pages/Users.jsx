import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import { formatDate } from '../utils/format';
import { ChevronDown, LayoutGrid, Plus, Search, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';


const getRoleColors = (role) => {
  if (role === 'manager') return 'bg-orange-50 text-orange-700';
  if (role === 'operator') return 'bg-[#F6E0FF] text-[#732993]';
  return 'bg-indigo-50 text-indigo-700'; // admin or other
};

const getInitials = (username) =>
  username ? username.substring(0, 2).toUpperCase() : '??';

const AVATAR_COLORS = [
  'bg-indigo-600', 'bg-emerald-500', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500'
];

const getAvatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];


function FormulaireUtilisateur({ onClose, onSaved }) {
  const [formData, setFormData] = useState({ username: '', password: '', role: 'operator' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return;
    try {
      await api.createUser(formData.username, formData.password, formData.role);
      onSaved();
      onClose();
    } catch (err) {
      alert('Erreur : ' + err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="form-header">
          <h2 className="text-xl font-bold text-gray-800">Ajouter un utilisateur</h2>
          <button onClick={onClose} className="btn-close"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="input-label">Nom d'utilisateur</label>
            <input required type="text" value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              className="input-field" placeholder="Ex: k.madi" />
          </div>

          <div>
            <label className="input-label">Mot de passe</label>
            <input required type="password" value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="input-field" placeholder="••••••••" />
          </div>

          <div>
            <label className="input-label">Rôle assigné</label>
            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="input-field">
              <option value="operator">Opérateur</option>
              <option value="manager">Gestionnaire</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
            <button type="submit" className="btn-primary flex-1">Créer l'accès</button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default function Users({ navigate }) {
  const { user, canManageUsers } = useAuth();

  const [activeTab, setActiveTab] = useState('moncompte');

  const [username, setUsername] = useState(user.username);
  const [usernameForm, setUsernameForm] = useState({ newUsername: '' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [usernameMsg, setUsernameMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [successConfig, setSuccessConfig] = useState(null);

  useEffect(() => {
    if (canManageUsers && canManageUsers()) loadUsers();
    else setLoading(false);
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (e) {
      setError(e.toString());
    } finally {
      setLoading(false);
    }
  }


  async function handleUpdateUsername(e) {
    e.preventDefault();
    setUsernameMsg('');
    try {
      await api.updateUsername(user.id, usernameForm.newUsername);
      setUsername(usernameForm.newUsername);
      setUsernameForm({ newUsername: '' });
      setSuccessConfig({ title: 'Modifications enregistrées !', text: 'Votre nom d\'utilisateur a été mis à jour.' });
    } catch (err) {
      setUsernameMsg('Erreur : ' + err);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordMsg('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg('Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      await api.changePassword(user.id, passwordForm.oldPassword, passwordForm.newPassword);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessConfig({ title: 'Mot de passe modifié !', text: 'Votre mot de passe a été mis à jour avec succès.' });
    } catch (err) {
      setPasswordMsg('Erreur : ' + err);
    }
  }


  async function handleUpdateRole(id, role) {
    try {
      await api.updateRole(id, role);
      loadUsers();
    } catch (e) {
      alert('Erreur : ' + e);
    }
  }

  async function handleConfirmDelete() {
    try {
      await api.deleteUser(userToDelete.id);
      setUserToDelete(null);
      await loadUsers();
      setSuccessConfig({ title: 'Utilisateur supprimé !', text: 'L\'accès de cet utilisateur a été révoqué avec succès.' });
    } catch (e) {
      alert('Erreur : ' + e);
    }
  }


  const rolesUniques = [...new Set(users.map(u => u.role))];

  const usersFiltres = users
    .filter(u => u.id !== user.id)
    .filter(u =>
      (roleFilter === '' || u.role === roleFilter) &&
      (searchFilter === '' || u.username.toLowerCase().includes(searchFilter.toLowerCase()))
    );

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Chargement...
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-400 text-sm">
      Erreur : {error}
    </div>
  );

  return (
    <div className="catalog-container relative">
      <div className="table-container">

        <div className="onglets">
          <button onClick={() => setActiveTab('moncompte')} className={activeTab === 'moncompte' ? 'selected-tab' : 'unselected-tab'}>
            Mon compte
          </button>
          {canManageUsers && canManageUsers() && (
            <button onClick={() => setActiveTab('gestionusers')} className={activeTab === 'gestionusers' ? 'selected-tab' : 'unselected-tab'}>
              Gestion des utilisateurs
            </button>
          )}
        </div>

        <div className="table">

          {activeTab === 'moncompte' && (
            <div className="max-w-4xl">

              {/* Avatar + name */}
              <div className="flex items-center gap-6 mb-10">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow-inner ${getAvatarColor(user.id)}`}>
                  {getInitials(username)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{username}</h3>
                  <p className="text-gray-500 text-sm">{user.role}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateUsername} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="input-label">Nouveau nom d'utilisateur</label>
                  <input type="text" value={usernameForm.newUsername} required
                    onChange={e => setUsernameForm({ newUsername: e.target.value })}
                    className="input-field" placeholder="Votre nouveau nom d'utilisateur" />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="btn-primary w-full">Mettre à jour</button>
                </div>
                {usernameMsg && <p className="col-span-2 text-sm text-red-500">{usernameMsg}</p>}
              </form>

              <div className="border-t border-gray-100 pt-8 mb-8">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Changer le mot de passe</p>
                <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="input-label">Mot de passe actuel</label>
                    <input type="password" required value={passwordForm.oldPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      className="input-field" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="input-label">Nouveau mot de passe</label>
                    <input type="password" required value={passwordForm.newPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="input-field" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="input-label">Confirmer le mot de passe</label>
                    <input type="password" required value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="input-field" placeholder="••••••••" />
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="btn-primary w-full">Changer le mot de passe</button>
                  </div>
                  {passwordMsg && <p className="col-span-2 text-sm text-red-500">{passwordMsg}</p>}
                </form>
              </div>

            </div>
          )}

          {activeTab === 'gestionusers' && canManageUsers && canManageUsers() && (
            <>
              <div className="tab-filter">
                <div className="filter-group">
                  <div className="date-filter-container w-64 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input type="text" placeholder="Rechercher par nom..." value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)} className="select-date pl-9" />
                  </div>
                  <div className="date-filter-container w-56 relative">
                    <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="select-date pl-9">
                      <option value="">Rôle : Tous</option>
                      {rolesUniques.map((role, i) => <option key={i} value={role}>{role}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="btn-add-intrant">
                  <Plus className="w-4 h-4" /> Ajouter un utilisateur
                </button>
              </div>

              <div className="table-sec">
                <div className="table-header-grid grid-users">
                  <p className="tab-header-title">Utilisateur</p>
                  <p className="tab-header-title text-center">Rôle</p>
                  <p className="tab-header-title text-center">Créé le</p>
                  <p className="tab-header-title text-center">Actions</p>
                </div>

                <div className="scrollable-list">
                  {usersFiltres.map(u => (
                    <div key={u.id} className="table-row grid-users">

                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(u.id)}`}>
                          {getInitials(u.username)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{u.username}</p>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs min-w-[110px] ${getRoleColors(u.role)}`}>
                          <select className="role-select text-center bg-transparent border-none outline-none"
                            value={u.role} onChange={e => handleUpdateRole(u.id, e.target.value)}>
                            <option value="manager">Gestionnaire</option>
                            <option value="operator">Opérateur</option>
                          </select>
                          <ChevronDown className="w-3 h-3 ml-1 opacity-60" />
                        </span>
                      </div>

                      <div className="flex justify-center">
                        <p className="text-sm text-gray-500">{formatDate(u.created_at)}</p>
                      </div>

                      <div className="flex justify-center">
                        <button onClick={() => setUserToDelete(u)}
                          className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                    </div>
                  ))}

                  {usersFiltres.length === 0 && (
                    <div className="text-center py-10 text-gray-500 italic">Aucun utilisateur trouvé...</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <FormulaireUtilisateur
          onClose={() => setIsAddModalOpen(false)}
          onSaved={async () => {
            await loadUsers();
            setSuccessConfig({ title: 'Utilisateur ajouté !', text: 'Le nouvel utilisateur a été enregistré avec succès.' });
          }}
        />
      )}

      {userToDelete && (
        <div className="modal-overlay">
          <div className="modal-container panel-container">
            <div className="cancel-icon-bg"><AlertCircle className="w-12 h-12 text-orange-500" /></div>
            <h3 className="panel-title">Supprimer cet utilisateur ?</h3>
            <p className="panel-text">Êtes-vous sûr de vouloir supprimer "{userToDelete.username}" ? Son accès sera révoqué définitivement.</p>
            <div className="flex gap-4 w-full max-w-sm">
              <button onClick={() => setUserToDelete(null)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleConfirmDelete} className="btn-danger flex-1">Oui, supprimer</button>
            </div>
          </div>
        </div>
      )}

      {successConfig && (
        <div className="modal-overlay">
          <div className="modal-container panel-container">
            <div className="success-icon-bg"><CheckCircle2 className="w-12 h-12 text-[#76B379]" /></div>
            <h3 className="panel-title">{successConfig.title}</h3>
            <p className="panel-text">{successConfig.text}</p>
            <button onClick={() => setSuccessConfig(null)} className="btn-primary w-full max-w-xs">Continuer</button>
          </div>
        </div>
      )}
    </div>
  );
}