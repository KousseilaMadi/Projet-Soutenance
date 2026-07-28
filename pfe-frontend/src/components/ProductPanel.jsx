import React, { useState, useEffect } from 'react';
import { X, Trash2, Edit2, Check, XCircle, AlertCircle, Sparkles, Plus } from 'lucide-react';

const ConfirmPanel = ({ title, message, onConfirm, onCancel }) => (
  <div className="flex flex-col items-center justify-center p-8 h-full bg-white/50">
    <div className="mb-4 bg-orange-50 p-4 rounded-full">
      <AlertCircle className="w-12 h-12 text-orange-500" />
    </div>
    <h3 className="text-center text-xl font-bold mb-2 text-gray-800">{title}</h3>
    <p className="text-center text-gray-500 mb-8">{message}</p>
    <div className="flex gap-4 w-full max-w-sm">
      <button
        onClick={onCancel}
        className="btn-secondary flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-xl py-3 transition-colors"
      >
        Annuler
      </button>
      <button
        onClick={onConfirm}
        className="flex-1 bg-red-500 text-white hover:bg-red-600 font-bold rounded-xl py-3 shadow-lg shadow-red-100 transition-colors"
      >
        Oui, désactiver
      </button>
    </div>
  </div>
);

const emptyFournisseurForm = {
  nom: '',
  adresse: '',
  contact: '',
  telephone: '',
  prixUnitaire: '',
  delaiLivraison: '',
};

function IntrantPanel({ isOpen, onClose, data, onUpdate, onDelete }) {
  const [view, setView] = useState('details'); // 'details' | 'form'
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deletingFournisseur, setDeletingFournisseur] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingFournisseurId, setEditingFournisseurId] = useState(null);

  const [editForm, setEditForm] = useState({});
  const [editFournisseurForm, setEditFournisseurForm] = useState({});
  const [newFournisseurForm, setNewFournisseurForm] = useState(emptyFournisseurForm);

  useEffect(() => {
    if (isOpen) {
      setView('details');
      setIsConfirmingDelete(false);
      setDeletingFournisseur(null);
      setIsEditing(false);
      setEditingFournisseurId(null);
    }
  }, [isOpen, data?.id]);

  useEffect(() => {
    if (data) {
      setEditForm({
        nom: data.nom,
        reference: data.reference,
        categorie: data.categorie,
        fournisseur: data.fournisseur,
        conditionnement: data.conditionnement,
        image: data.image,
      });
    }
  }, [data]);

  if (!isOpen || !data) return null;

  const fournisseursLies = data.fournisseursLies || [];

  const handleSave = () => {
    onUpdate({ ...data, ...editForm });
    setIsEditing(false);
  };

  const handleConfirmDelete = () => {
    onDelete(data.id);
    setIsConfirmingDelete(false);
  };

  const handleAddFournisseur = () => {
    if (!newFournisseurForm.nom) return;
    const newEntry = {
      id: Date.now(),
      ...newFournisseurForm,
    };
    onUpdate({ ...data, fournisseursLies: [...fournisseursLies, newEntry] });
    setNewFournisseurForm(emptyFournisseurForm);
    setView('details');
  };

  const executeDeleteFournisseur = () => {
    if (!deletingFournisseur) return;
    onUpdate({
      ...data,
      fournisseursLies: fournisseursLies.filter(f => f.id !== deletingFournisseur.id),
    });
    setDeletingFournisseur(null);
  };

  const startEditFournisseur = (item) => {
    setEditingFournisseurId(item.id);
    setEditFournisseurForm(item);
  };

  const saveEditFournisseur = () => {
    onUpdate({
      ...data,
      fournisseursLies: fournisseursLies.map(f =>
        f.id === editingFournisseurId ? { ...f, ...editFournisseurForm } : f
      ),
    });
    setEditingFournisseurId(null);
  };

  const handleCancelConfirm = () => {
    setIsConfirmingDelete(false);
    setDeletingFournisseur(null);
  };

  const mockStock = {
    actuel: '12 500 unités',
    seuilAlerte: data.seuilAlerte ? `${data.seuilAlerte} unités` : '5 000 unités',
    emplacement: 'Zone A — Allée 3 — Rack 12',
  };

  const mockIA = {
    tendance: 'En hausse (+12% ce mois)',
    dateEpuisement: '28 Avril 2026',
    fiabilite: data.fiabilite || '98%',
    recommandation: 'Passer commande de 2 palettes avant le 20 Avril pour éviter la rupture.',
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {!isConfirmingDelete && !deletingFournisseur && (
          <div className="flex items-start justify-between p-8 pb-4 border-b border-gray-100">
            <div className="w-full">
              {isEditing ? (
                <input
                  type="text"
                  className="input-field text-xl font-bold mb-1 w-11/12"
                  value={editForm.nom}
                  onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-800">{data.nom}</h2>
              )}
              <p className="text-gray-500 text-sm mt-1">Catégorie : {data.categorie}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsConfirmingDelete(true)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                {isEditing ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Edit2 className="w-5 h-5" />
                )}
              </button>
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors ml-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">

          {isConfirmingDelete ? (
            <ConfirmPanel
              title="Désactiver cet intrant ?"
              message={`L'intrant "${data.nom}" sera indisponible dans votre catalogue.`}
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelConfirm}
            />

          ) : deletingFournisseur ? (
            <ConfirmPanel
              title="Retirer ce fournisseur ?"
              message={`"${deletingFournisseur.nom}" sera retiré de la liste des fournisseurs de cet intrant.`}
              onConfirm={executeDeleteFournisseur}
              onCancel={handleCancelConfirm}
            />

          ) : view === 'details' ? (
            <div className="p-8 space-y-6">

              <div className="flex items-center gap-4 pt-2">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                  <img
                    src={editForm.image || data.image}
                    alt={data.nom}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 leading-tight">{data.nom}</p>
                  <p className="text-sm font-mono text-gray-400 mt-0.5">{data.reference}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 text-sm">Informations générales</h3>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      className="input-field text-sm"
                      value={editForm.reference}
                      onChange={(e) => setEditForm({ ...editForm, reference: e.target.value })}
                      placeholder="Référence"
                    />
                    <input
                      className="input-field text-sm"
                      value={editForm.categorie}
                      onChange={(e) => setEditForm({ ...editForm, categorie: e.target.value })}
                      placeholder="Catégorie"
                    />
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">Image</p>
                      <div className="flex items-center gap-3">
                        <img
                          src={editForm.image || data.image}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                        />
                        <label className="input-field text-sm cursor-pointer text-gray-400 flex items-center">
                          Choisir une image...
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const url = URL.createObjectURL(file);
                              setEditForm({ ...editForm, image: url });
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-sm text-gray-500">
                    <p><span className="font-bold text-gray-700">Référence :</span> {data.reference}</p>
                    <p><span className="font-bold text-gray-700">Catégorie :</span> {data.categorie}</p>
                    <p><span className="font-bold text-gray-700">Unitée :</span> {data.unit}</p>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 text-sm">Informations stock</h3>
                <div className="space-y-1.5 text-sm text-gray-500">
                  <p><span className="font-bold text-gray-700">Stock actuel :</span> {mockStock.actuel}</p>
                  <p><span className="font-bold text-gray-700">Seuil d'alerte :</span> {mockStock.seuilAlerte}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-3 text-sm px-1">Fournisseurs liés</h3>
                <div className="border border-gray-200 rounded-2xl p-2 bg-[#FAFAFA]">
                  {fournisseursLies.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-2">Aucun fournisseur lié.</p>
                  )}
                  {fournisseursLies.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0"
                    >
                      {editingFournisseurId === item.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            className="input-field text-xs w-24"
                            value={editFournisseurForm.nom}
                            onChange={(e) => setEditFournisseurForm({ ...editFournisseurForm, nom: e.target.value })}
                            placeholder="Nom"
                          />
                          <input
                            className="input-field text-xs w-16"
                            type="number"
                            value={editFournisseurForm.prixUnitaire}
                            onChange={(e) => setEditFournisseurForm({ ...editFournisseurForm, prixUnitaire: e.target.value })}
                            placeholder="Prix"
                          />
                          <input
                            className="input-field text-xs w-20"
                            value={editFournisseurForm.delaiLivraison}
                            onChange={(e) => setEditFournisseurForm({ ...editFournisseurForm, delaiLivraison: e.target.value })}
                            placeholder="Délai"
                          />
                          <div className="flex items-center gap-1 ml-auto">
                            <button onClick={saveEditFournisseur} className="text-green-500 p-1">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingFournisseurId(null)} className="text-gray-400 p-1">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm text-gray-600 w-28 truncate font-medium">{item.nom}</span>
                          <span className="text-sm text-gray-600 font-semibold">{item.prixUnitaire} DA</span>
                          <span className="text-sm text-gray-500 truncate w-20">{item.delaiLivraison}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setDeletingFournisseur(item)}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => startEditFournisseur(item)}
                              className="text-gray-400 hover:text-gray-600 p-1"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setView('form')}
                className="w-full py-4 bg-[#E2E6FF] text-[#4E54A6] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#D5D9F5] transition-colors"
              >
                <Plus className="w-5 h-5" /> Lier un fournisseur
              </button>

            </div>

          ) : (
            <div className="p-8 h-full bg-gray-50/30">
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800">Lier un fournisseur</h3>
                  <button
                    onClick={() => setView('details')}
                    className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5 flex-1">
                  <div>
                    <label className="input-label">Nom du fournisseur</label>
                    <input
                      type="text"
                      className="input-field"
                      value={newFournisseurForm.nom}
                      onChange={(e) => setNewFournisseurForm({ ...newFournisseurForm, nom: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="input-label">Adresse</label>
                    <input
                      type="text"
                      className="input-field"
                      value={newFournisseurForm.adresse}
                      onChange={(e) => setNewFournisseurForm({ ...newFournisseurForm, adresse: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="input-label">Contact (email)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={newFournisseurForm.contact}
                      onChange={(e) => setNewFournisseurForm({ ...newFournisseurForm, contact: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="input-label">Téléphone</label>
                    <input
                      type="text"
                      className="input-field"
                      value={newFournisseurForm.telephone}
                      onChange={(e) => setNewFournisseurForm({ ...newFournisseurForm, telephone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="input-label">Délai de livraison</label>
                    <select
                      className="input-field bg-white appearance-none"
                      value={newFournisseurForm.delaiLivraison}
                      onChange={(e) => setNewFournisseurForm({ ...newFournisseurForm, delaiLivraison: e.target.value })}
                    >
                      <option value=""></option>
                      <option>1 à 3 jours</option>
                      <option>3 à 5 jours</option>
                      <option>+ de 5 jours</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Prix unitaire (DA)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={newFournisseurForm.prixUnitaire}
                      onChange={(e) => setNewFournisseurForm({ ...newFournisseurForm, prixUnitaire: e.target.value })}
                    />
                  </div>
                </div>

                <div className="p-6 flex items-center justify-end gap-4 bg-white border-t border-gray-100">
                  <button
                    onClick={() => setView('details')}
                    className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddFournisseur}
                    className="px-6 py-3 rounded-xl font-bold text-white bg-[#6FB576] hover:bg-[#5da063] shadow-lg shadow-green-100 transition-all"
                  >
                    Lier le fournisseur
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default IntrantPanel;