import React, { useState, useEffect } from 'react';
import { X, Trash2, Edit2, Plus, Sparkles, Check, XCircle, AlertCircle } from 'lucide-react';

const ConfirmPanel = ({ title, message, onConfirm, onCancel }) => (
  <div className="panel-container flex flex-col items-center justify-center p-8 h-full bg-white/50">
    <div className="cancel-icon-bg mb-4 bg-orange-50 p-4 rounded-full">
      <AlertCircle className="w-12 h-12 text-orange-500" />
    </div>
    <h3 className="panel-title text-center text-xl font-bold mb-2 text-gray-800">{title}</h3>
    <p className="panel-text text-center text-gray-500 mb-8">{message}</p>
    <div className="flex gap-4 w-full max-w-sm">
      <button 
        onClick={onCancel} 
        className="btn-secondary flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-xl py-3 transition-colors"
      >
        Annuler
      </button>
      <button 
        onClick={onConfirm} 
        className="btn-danger flex-1 bg-red-500 text-white hover:bg-red-600 font-bold rounded-xl py-3 shadow-lg shadow-red-100 transition-colors"
      >
        Oui, supprimer
      </button>
    </div>
  </div>
);

function FournisseurPanel({ isOpen, onClose, data, onUpdate, onDelete }) {
  const [view, setView] = useState('details');

  const [isDeletingGlobal, setIsDeletingGlobal] = useState(false);
  const [deletingIntrant, setDeletingIntrant] = useState(null);

  const [isEditingGlobal, setIsEditingGlobal] = useState(false);
  const [editingIntrantId, setEditingIntrantId] = useState(null);

  const [editGlobalForm, setEditGlobalForm] = useState({});
  const [editIntrantForm, setEditIntrantForm] = useState({});
  const [newIntrantForm, setNewIntrantForm] = useState({ nomIntrant: '', sku: '', conditionnement: '', seuil: '', delaiLivraison: '', prixUnitaire: '' });

  useEffect(() => {
    if (isOpen) {
      setView('details');
      setIsEditingGlobal(false);
      setEditingIntrantId(null);
      setIsDeletingGlobal(false);
      setDeletingIntrant(null);
    }
  }, [isOpen, data?.id]);

  useEffect(() => {
    if (data) {
      setEditGlobalForm({ 
        nom: data.nom, 
        email: data.contact.email, 
        telephone: data.contact.telephone, 
        adresse: data.adresse 
      });
    }
  }, [data]);

  if (!isOpen || !data) return null;

  const handleSaveGlobal = () => {
    onUpdate({
      ...data,
      nom: editGlobalForm.nom,
      adresse: editGlobalForm.adresse,
      contact: { ...data.contact, email: editGlobalForm.email, telephone: editGlobalForm.telephone }
    });
    setIsEditingGlobal(false);
  };

  const executeDeleteGlobal = () => {
    onDelete(data.id);
    setIsDeletingGlobal(false);
  };

  const handleAddIntrant = () => {
    if (!newIntrantForm.nomIntrant) return;
    const newProduct = { 
      intrantId: Date.now(), 
      nomIntrant: newIntrantForm.nomIntrant,
      sku: newIntrantForm.sku,
      prixUnitaire: newIntrantForm.prixUnitaire,
      delaiLivraison: newIntrantForm.delaiLivraison,
      devise: "DA" 
    };
    onUpdate({ ...data, produitsFournis: [...data.produitsFournis, newProduct] });
    setNewIntrantForm({ nomIntrant: '', sku: '', conditionnement: '', seuil: '', delaiLivraison: '', prixUnitaire: '' });
    setView('details');
  };

  const executeDeleteIntrant = () => {
    if (!deletingIntrant) return;
    const updatedProducts = data.produitsFournis.filter(p => p.intrantId !== deletingIntrant.intrantId);
    onUpdate({ ...data, produitsFournis: updatedProducts });
    setDeletingIntrant(null);
  };

  const startEditIntrant = (item) => {
    setEditingIntrantId(item.intrantId);
    setEditIntrantForm(item);
  };

  const saveEditIntrant = () => {
    const updatedProducts = data.produitsFournis.map(p => p.intrantId === editingIntrantId ? { ...p, ...editIntrantForm } : p);
    onUpdate({ ...data, produitsFournis: updatedProducts });
    setEditingIntrantId(null);
  };

  const handleCancelConfirm = () => {
    setIsDeletingGlobal(false);
    setDeletingIntrant(null);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40 transition-opacity backdrop-blur-sm" onClick={onClose} />

      <div className={`fixed top-0 right-0 h-full w-full max-w-112.5 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
    
        {!isDeletingGlobal && (
          <div className="flex items-start justify-between p-8 pb-4 border-b border-gray-100">
            <div className="w-full">
              {isEditingGlobal ? (
                 <input type="text" className="input-field text-xl font-bold mb-1 w-11/12" value={editGlobalForm.nom} onChange={e => setEditGlobalForm({...editGlobalForm, nom: e.target.value})} />
              ) : (
                <h2 className="text-2xl font-bold text-gray-800">{data.nom}</h2>
              )}
              <p className="text-gray-500 text-sm mt-1">Catégorie : {data.categorie}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => setIsDeletingGlobal(true)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
              <button onClick={() => isEditingGlobal ? handleSaveGlobal() : setIsEditingGlobal(true)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                {isEditingGlobal ? <Check className="w-5 h-5 text-green-600" /> : <Edit2 className="w-5 h-5" />}
              </button>
              <button onClick={onClose} className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors ml-2"><X className="w-6 h-6" /></button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {isDeletingGlobal ? (
            <ConfirmPanel 
              title="Supprimer ce fournisseur ?"
              message={`Êtes-vous sûr de vouloir supprimer définitivement ${data.nom} ? Cette action est irréversible.`}
              onConfirm={executeDeleteGlobal}
              onCancel={handleCancelConfirm}
            />
          ) : deletingIntrant ? (
            <ConfirmPanel 
              title="Désactiver cet intrant ?"
              message={`L'intrant "${deletingIntrant.nomIntrant}" sera indisponible dans le catalogue de ce fournisseur.`}
              onConfirm={executeDeleteIntrant}
              onCancel={handleCancelConfirm}
            />
          ) : view === 'details' ? (
         
            <div className="p-8 space-y-8">
              
              <div className="flex items-center gap-4 pt-2">
                <div className="w-16 h-16 bg-[#F28B2A] flex items-center justify-center text-white font-bold text-4xl">
                  <span className="block border-l-4 border-white pl-1 ml-1 h-8"></span>
                </div>
                <span className="text-5xl font-bold text-[#4B4B4B] tracking-tight">
                  {data.nom.substring(0, 8).toLowerCase()}<sup className="text-2xl text-gray-400">®</sup>
                </span>
              </div>

              <div className="border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 text-sm">Informations de contact</h3>
                {isEditingGlobal ? (
                  <div className="space-y-2">
                    <input className="input-field text-sm" value={editGlobalForm.email} onChange={e => setEditGlobalForm({...editGlobalForm, email: e.target.value})} placeholder="Email" />
                    <input className="input-field text-sm" value={editGlobalForm.telephone} onChange={e => setEditGlobalForm({...editGlobalForm, telephone: e.target.value})} placeholder="Téléphone" />
                    <input className="input-field text-sm" value={editGlobalForm.adresse} onChange={e => setEditGlobalForm({...editGlobalForm, adresse: e.target.value})} placeholder="Adresse" />
                  </div>
                ) : (
                  <div className="space-y-1.5 text-sm text-gray-500">
                    <p><span className="font-bold text-gray-700">Nom :</span> {data.nom}</p>
                    <p><span className="font-bold text-gray-700">Email :</span> {data.contact.email}</p>
                    <p><span className="font-bold text-gray-700">Telephone :</span> {data.contact.telephone}</p>
                    <p><span className="font-bold text-gray-700">Adresse :</span> {data.adresse}</p>
                  </div>
                )}
              </div>

              <div className="bg-[#F4F6FF] border border-[#E0E5FF] rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <h3 className="font-bold text-gray-800 text-sm">Performances fournisseur (Analyse SMA)</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600 pl-6">
                  <p><span className="font-bold text-gray-700">Fiabilité du fournisseur :</span> {data.performances?.fiabilite}% (calculé sur les {data.performances?.calculSurDernieresLivraisons} dernières livraisons)</p>
                  <p><span className="font-bold text-gray-700">Délai de livraison :</span> {data.performances?.delaiMoyen}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-3 text-sm px-1">Catalogue produits fournis</h3>
                <div className="border border-gray-200 rounded-2xl p-2 bg-[#FAFAFA]">
                  {data.produitsFournis.length === 0 && <p className="text-sm text-gray-400 text-center py-2">Aucun intrant lié.</p>}
                  
                  {data.produitsFournis.map((item) => (
                    <div key={item.intrantId} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 bg-transparent">
                      
                      {editingIntrantId === item.intrantId ? (
                        <div className="flex items-center gap-2 w-full">
                          <input className="input-field text-xs w-20" value={editIntrantForm.nomIntrant} onChange={e => setEditIntrantForm({...editIntrantForm, nomIntrant: e.target.value})} placeholder="Nom" />
                          <input className="input-field text-xs w-15" value={editIntrantForm.sku} onChange={e => setEditIntrantForm({...editIntrantForm, sku: e.target.value})} placeholder="SKU" />
                          <input className="input-field text-xs w-12.5" type="number" value={editIntrantForm.prixUnitaire} onChange={e => setEditIntrantForm({...editIntrantForm, prixUnitaire: e.target.value})} placeholder="Prix" />
                          <div className="flex items-center gap-1 ml-auto">
                            <button onClick={saveEditIntrant} className="text-green-500 p-1"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingIntrantId(null)} className="text-gray-400 p-1"><XCircle className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm text-gray-600 w-28 truncate">{item.nomIntrant}</span>
                          <span className="text-sm text-gray-500 font-mono w-20 truncate">{item.sku}</span>
                          <span className="text-sm text-gray-600 font-semibold">{item.prixUnitaire}{item.devise}</span>
                          <span className="text-sm text-gray-500 truncate w-20">{item.delaiLivraison}</span>
                          <div className="flex items-center gap-1">
                            {/* APPEL DU PANNEAU DE CONFIRMATION */}
                            <button onClick={() => setDeletingIntrant(item)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                            <button onClick={() => startEditIntrant(item)} className="text-gray-400 hover:text-gray-600 p-1"><Edit2 className="w-4 h-4" /></button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setView('form')} className="w-full py-4 bg-[#E2E6FF] text-[#4E54A6] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#D5D9F5] transition-colors">
                <Plus className="w-5 h-5" /> Lier un intrant
              </button>
            </div>
          ) : (
            <div className="p-8 h-full bg-gray-50/30">
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800">Lier un produit</h3>
                  <button onClick={() => setView('details')} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-5 flex-1">
                  <div>
                    <label className="input-label">Nom de l'intrant</label>
                    <input type="text" className="input-field" value={newIntrantForm.nomIntrant} onChange={e => setNewIntrantForm({...newIntrantForm, nomIntrant: e.target.value})} />
                  </div>
                  <div>
                    <label className="input-label">Référence (SKU)</label>
                    <input type="text" className="input-field" value={newIntrantForm.sku} onChange={e => setNewIntrantForm({...newIntrantForm, sku: e.target.value})} />
                  </div>
                  <div>
                    <label className="input-label">Conditionnement / Unité</label>
                    <select className="input-field bg-white appearance-none" value={newIntrantForm.conditionnement} onChange={e => setNewIntrantForm({...newIntrantForm, conditionnement: e.target.value})}>
                      <option></option>
                      <option>Unité</option>
                      <option>Carton</option>
                      <option>Palette</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Seuil d'alerte minimum</label>
                    <input type="number" className="input-field" value={newIntrantForm.seuil} onChange={e => setNewIntrantForm({...newIntrantForm, seuil: e.target.value})} />
                  </div>
                  <div>
                    <label className="input-label">Delai de livraison</label>
                    <select className="input-field bg-white appearance-none" value={newIntrantForm.delaiLivraison} onChange={e => setNewIntrantForm({...newIntrantForm, delaiLivraison: e.target.value})}>
                      <option></option>
                      <option>1 à 3 jours</option>
                      <option>3 à 5 jours</option>
                      <option>+ de 5 jours</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Prix unitaire (DA)</label>
                    <input type="number" className="input-field" value={newIntrantForm.prixUnitaire} onChange={e => setNewIntrantForm({...newIntrantForm, prixUnitaire: e.target.value})} />
                  </div>
                </div>

                <div className="p-6 flex items-center justify-end gap-4 bg-white border-t border-gray-100">
                  <button onClick={() => setView('details')} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">Annuler</button>
                  <button onClick={handleAddIntrant} className="px-6 py-3 rounded-xl font-bold text-white bg-[#6FB576] hover:bg-[#5da063] shadow-lg shadow-green-100 transition-all">Lier l'intrant</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default FournisseurPanel;