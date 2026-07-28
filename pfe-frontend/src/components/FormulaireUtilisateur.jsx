import React, { useState } from 'react';
import { X } from 'lucide-react';

function FormulaireUtilisateur({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    role: 'Opérateur'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nom || !formData.prenom || !formData.email) return;

    const initiales = `${formData.prenom.charAt(0)}${formData.nom.charAt(0)}`.toUpperCase();
    const colors = ["bg-indigo-600", "bg-emerald-500", "bg-orange-500", "bg-blue-500", "bg-purple-500"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const nouvelUser = {
      id: Date.now(),
      nom: `${formData.prenom} ${formData.nom}`,
      email: formData.email,
      role: formData.role,
      statut: "Actif",
      initiales: initiales,
      color: randomColor
    };

    onAdd(nouvelUser);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        
        <div className="form-header">
          <h2 className="text-xl font-bold text-gray-800">Ajouter un utilisateur</h2>
          <button onClick={onClose} className="btn-close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Prénom</label>
              <input required type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="input-label">Nom</label>
              <input required type="text" name="nom" value={formData.nom} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div>
            <label className="input-label">Adresse Email</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" />
          </div>

          <div>
            <label className="input-label">Rôle assigné</label>
            <select name="role" value={formData.role} onChange={handleChange} className="input-field">
              <option value="Opérateur">Opérateur</option>
              <option value="Gestionnaire">Gestionnaire</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Annuler
            </button>
            <button type="submit" className="btn-primary flex-1">
              Créer l'accès
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default FormulaireUtilisateur;