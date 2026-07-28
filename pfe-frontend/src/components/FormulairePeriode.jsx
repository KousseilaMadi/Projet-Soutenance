import React, { useState } from 'react';
import { X } from 'lucide-react';

const FormulairePeriode = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({ 
    nom: '', dateDebut: '', dateFin: '', facteur: '' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      id: Date.now(),
      nom: formData.nom,
      dateDebut: formData.dateDebut,
      dateFin: formData.dateFin,
      facteur: parseFloat(formData.facteur)
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Ajouter une période</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom de l'événement</label>
            <input type="text" required placeholder="Ex: Ramadan 2025" 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              onChange={(e) => setFormData({...formData, nom: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date de début</label>
              <input type="date" required 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-gray-700"
                onChange={(e) => setFormData({...formData, dateDebut: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date de fin</label>
              <input type="date" required 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-gray-700"
                onChange={(e) => setFormData({...formData, dateFin: e.target.value})} 
              />
            </div>
          </div>

      
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Facteur multiplicateur</label>
            <div className="relative">
              <input 
                type="number" 
                step="0.1" 
                required 
                placeholder="Ex: 0.3 ou 1.5" 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none pr-8"
                onChange={(e) => setFormData({...formData, facteur: e.target.value})} 
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium font-mono">×</span>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              0 = Arrêt total | &lt; 1 = Baisse | &gt; 1 = Hausse
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} 
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button type="submit" 
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
              Ajouter la période
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default FormulairePeriode;