import React, { useState } from 'react';
import { X } from 'lucide-react';

function DeclarationMouvement({ onClose, onAdd, produits }) {
  const [movementForm, setMovementForm] = useState({
      productId: '', movementType: 'exit', quantity: '', note: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(movementForm)
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        
        <div className="form-header">
          <h2 className="panel-title mb-0">Déclarer un mouvement</h2>
          <button onClick={onClose} className="btn-close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="form-body">
            <div>
              <label className="input-label">Intrant</label>
              <select 
                value={movementForm.productId} 
                onChange={(e) => setMovementForm({ ...movementForm, productId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Sélectionner un produit...</option>
                {produits.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Opération</label>
              <select 
                value={movementForm.movementType} 
                onChange={(e) => setMovementForm({ ...movementForm, movementType: e.target.value })}
                className="input-field"
              >
                <option value="entry">Entrée (+)</option>
                <option value="exit">Sortie (-)</option>
              </select>
            </div>

            <div>
              <label className="input-label">Quantité</label>
              <input 
                type="number" 
                min="1"
                value={movementForm.quantity} 
                onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })}
                className="input-field"
                placeholder="Ex: 200"
                required
              />
            </div>

            <div>
              <label className="input-label">Note</label>
              <input 
                type="text" 
                value={movementForm.note} 
                onChange={(e) => setMovementForm({ ...movementForm, note: e.target.value })}
                className="input-field"
                placeholder="Note..."
              />
            </div>
          </div>

          <div className="form-footer">
            <button 
              type="button" 
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="btn-primary flex-1"
            >
              Valider
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default DeclarationMouvement;