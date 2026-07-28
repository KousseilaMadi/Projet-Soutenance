import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import {
  Plus, Search, X, ChevronDown, Upload, Check, AlertCircle,
  CheckCircle2, Trash2, Edit2, XCircle, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';

const SuccessPanel = ({ onConfirm, isEditMode }) => (
  <div className="panel-container">
    <div className="success-icon-bg">
      <CheckCircle2 className="w-12 h-12 text-[#76B379]" />
    </div>
    <h3 className="panel-title">
      {isEditMode ? 'Modifications enregistrées !' : 'Intrant ajouté !'}
    </h3>
    <p className="panel-text">
      {isEditMode
        ? 'La fiche de cet intrant a été mise à jour avec succès.'
        : 'Votre nouvel intrant a été enregistré avec succès dans le catalogue.'}
    </p>
    <button onClick={onConfirm} className="btn-primary w-full">Continuer</button>
  </div>
);

const ConfirmPanel = ({ title, message, onConfirm, onCancel }) => (
  <div className="flex flex-col items-center justify-center p-8 h-full bg-white/50">
    <div className="mb-4 bg-orange-50 p-4 rounded-full">
      <AlertCircle className="w-12 h-12 text-orange-500" />
    </div>
    <h3 className="text-center text-xl font-bold mb-2 text-gray-800">{title}</h3>
    <p className="text-center text-gray-500 mb-8">{message}</p>
    <div className="flex gap-4 w-full max-w-sm">
      <button onClick={onCancel} className="btn-secondary flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-xl py-3 transition-colors">
        Annuler
      </button>
      <button onClick={onConfirm} className="flex-1 bg-red-500 text-white hover:bg-red-600 font-bold rounded-xl py-3 shadow-lg shadow-red-100 transition-colors">
        Supprimer
      </button>
    </div>
  </div>
);


function AddIntrantModal({ isOpen, onClose, productToEdit, onSaved, allSuppliers }) {
  const [view, setView] = useState('form');

  const [nom, setNom] = useState('');
  const [reference, setReference] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUnite, setSelectedUnite] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [searchTermAlt, setSearchTermAlt] = useState('');
  const [isDropdownOpenAlt, setIsDropdownOpenAlt] = useState(false);
  const dropdownRefAlt = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const isEditMode = !!productToEdit;

  const filteredF = allSuppliers.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    if (isOpen) {
      setView('form');
      if (productToEdit) {
        setNom(productToEdit.name || '');
        setReference(productToEdit.reference || '');
        setSelectedCategory(productToEdit.category || '');
        setSelectedUnite(productToEdit.unit || '');
        setAlertThreshold(String(productToEdit.alert_threshold ?? ''));
        setMaxCapacity('');
        setSearchTerm('');
        setSearchTermAlt('');
        setPreviewUrl(productToEdit.image_path ? api.getImageUrl(productToEdit.image_path) : null);
        setSelectedFile(null);
      } else {
        setNom(''); setReference(''); setSelectedCategory(''); setSelectedUnite('');
        setAlertThreshold(''); setMaxCapacity('');
        setSearchTerm('');
        setSearchTermAlt('');
        setPreviewUrl(null); setSelectedFile(null);
      }
    }
  }, [isOpen, productToEdit]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
      if (dropdownRefAlt.current && !dropdownRefAlt.current.contains(e.target)) setIsDropdownOpenAlt(false);
    };
    if (isDropdownOpen || isDropdownOpenAlt) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isDropdownOpen, isDropdownOpenAlt]);

  const handleGenerateRef = () => {
    setReference(`SKU-${Math.floor(1000 + Math.random() * 9000)}-PET`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.updateProduct(
          productToEdit.id,
          reference, nom, selectedCategory, selectedUnite,
          parseFloat(alertThreshold),
        );
        if (selectedFile) await api.uploadProductImage(productToEdit.id, selectedFile);
      } else {
        const created = await api.createProduct(
          reference, nom, selectedCategory, selectedUnite,
          parseFloat(alertThreshold),
          maxCapacity ? parseFloat(maxCapacity) : null,
        );
        if (selectedFile && created?.id) await api.uploadProductImage(created.id, selectedFile);
      }
      setView('success');
    } catch (err) {
      alert('Erreur : ' + err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">

        {view === 'form' && (
          <>
            <div className="form-header">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditMode ? "Modifier l'intrant" : 'Ajouter un intrant'}
              </h2>
              <button onClick={onClose} className="btn-close">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-body custom-scrollbar">

              {/* Nom */}
              <div>
                <label className="input-label">Nom de l'intrant</label>
                <input required type="text" value={nom} onChange={e => setNom(e.target.value)}
                  className="input-field" placeholder="Ex: Préformes PET" />
              </div>

              {/* Reference */}
              <div>
                <label className="input-label">Référence (SKU)</label>
                <div className="relative">
                  <input required type="text" value={reference} onChange={e => setReference(e.target.value)}
                    className="input-field" />
                  <button type="button" onClick={handleGenerateRef} className="btn-generate">Générer</button>
                </div>
              </div>

              {/* Category */}
              <div className="relative">
                <label className="input-label">Catégorie</label>
                <input
                required
                type="text"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="input-field"
                placeholder="Ex: Plastiques"
                />
              </div>

              {/* Alert threshold */}
              <div>
                <label className="input-label">Seuil d'alerte minimum</label>
                <input required type="number" value={alertThreshold} onChange={e => setAlertThreshold(e.target.value)}
                  className="input-field" placeholder="Ex: 500" />
              </div>

              {/* Max capacity — only on create */}
              {!isEditMode && (
                <div>
                  <label className="input-label">Capacité maximale <span className="text-gray-400 font-normal text-xs">(Optionnel)</span></label>
                  <input type="number" value={maxCapacity} onChange={e => setMaxCapacity(e.target.value)}
                    className="input-field" placeholder="Ex: 50000" />
                </div>
              )}

              {/* Unit */}
              <div>
                <label className="input-label">Unité</label>
                <input
                    required
                    type="text"
                    value={selectedUnite}
                    onChange={e => setSelectedUnite(e.target.value)}
                    className="input-field"
                    placeholder="Ex: Palette"
                />
                </div>

              {/* Image upload */}
              <div>
                <label className="input-label">Photo de produit</label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange}
                  className="hidden" accept="image/jpeg,image/png,image/webp" />
                <div onClick={() => fileInputRef.current.click()}
                  className={`file-upload-box ${selectedFile || previewUrl ? 'border-green-400 bg-green-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                  {previewUrl
                    ? <img src={previewUrl} className="h-16 w-16 object-cover rounded-lg shadow-sm" alt="Preview" />
                    : <>
                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-[11px] text-gray-400">
                          glisser-déposer ou <span className="text-blue-500 font-bold underline">parcourir</span>
                        </p>
                      </>
                  }
                </div>
              </div>

              <div className="form-footer flex gap-4 mt-6">
                <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm">Annuler</button>
                <button type="submit" className="btn-primary flex-1 text-sm">
                  {isEditMode ? 'Enregistrer les modifications' : "Ajouter l'intrant"}
                </button>
              </div>

            </form>
          </>
        )}

        {view === 'success' && (
          <SuccessPanel onConfirm={() => { setView('form'); onSaved(); onClose(); }} isEditMode={isEditMode} />
        )}

      </div>
    </div>
  );
}


const emptySupplierForm = { supplierId: '', unitPrice: '', deliveryDays: '', reliabilityScore: '' };

function IntrantPanel({ isOpen, onClose, product, allSuppliers, canManage, onProductUpdated, onProductDeleted }) {
  const [view, setView] = useState('details'); // 'details' | 'addSupplier'
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deletingSupplierLink, setDeletingSupplierLink] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState(null);

  const [editForm, setEditForm] = useState({});
  const [editLinkForm, setEditLinkForm] = useState({});
  const [newSupplierForm, setNewSupplierForm] = useState(emptySupplierForm);

  const [supplierLinks, setSupplierLinks] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && product) {
      setView('details');
      setIsConfirmingDelete(false);
      setDeletingSupplierLink(null);
      setIsEditing(false);
      setEditingLinkId(null);
      setNewSupplierForm(emptySupplierForm);
      setEditForm({
        name: product.name,
        reference: product.reference,
        category: product.category,
        unit: product.unit,
        alert_threshold: product.alert_threshold,
        image_path: product.image_path,
      });
      loadSupplierLinks(product.id);
    }
  }, [isOpen, product?.id]);

  async function loadSupplierLinks(productId) {
    try {
      const links = await api.getSuppliersForProduct(productId);
      setSupplierLinks(links);
    } catch (e) { console.error(e); }
  }

  if (!isOpen || !product) return null;

  // --- Product save ---
  const handleSaveEdit = async () => {
    try {
      await api.updateProduct(
        product.id,
        editForm.reference,
        editForm.name,
        editForm.category,
        editForm.unit,
        parseFloat(editForm.alert_threshold),
      );
      setIsEditing(false);
      onProductUpdated();
    } catch (e) { alert('Erreur : ' + e); }
  };

  // --- Product delete ---
  const handleConfirmDelete = async () => {
    try {
      await api.deleteProduct(product.id);
      setIsConfirmingDelete(false);
      onProductDeleted(product.id);
      onClose();
    } catch (e) { alert('Erreur : ' + e); }
  };

  // --- Image upload ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      flushSync(() => setUploadingImage(true));
      await api.uploadProductImage(product.id, file);
      onProductUpdated();
    } catch (err) { alert('Upload échoué : ' + err); }
    finally { setUploadingImage(false); }
  };

  // --- Supplier link: add ---
  const handleAddSupplierLink = async () => {
    if (!newSupplierForm.supplierId) return;
    try {
      await api.addProductToSupplier(
        product.id,
        parseInt(newSupplierForm.supplierId),
        parseFloat(newSupplierForm.unitPrice),
        parseInt(newSupplierForm.deliveryDays),
        parseFloat(newSupplierForm.reliabilityScore),
      );
      setNewSupplierForm(emptySupplierForm);
      setView('details');
      loadSupplierLinks(product.id);
    } catch (e) { alert('Erreur : ' + e); }
  };

  // --- Supplier link: edit save ---
  const handleSaveEditLink = async () => {
    try {
      await api.updateProductSupplier(
        editingLinkId,
        parseFloat(editLinkForm.unit_price),
        parseInt(editLinkForm.delivery_days),
        parseFloat(editLinkForm.reliability_score),
      );
      setEditingLinkId(null);
      loadSupplierLinks(product.id);
    } catch (e) { alert('Erreur : ' + e); }
  };

  // --- Supplier link: delete ---
  const handleDeleteLink = async () => {
    if (!deletingSupplierLink) return;
    try {
      await api.removeProductFromSupplier(deletingSupplierLink.id);
      setDeletingSupplierLink(null);
      loadSupplierLinks(product.id);
    } catch (e) { alert('Erreur : ' + e); }
  };

  const imageUrl = product.image_path ? api.getImageUrl(product.image_path) : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40 transition-opacity backdrop-blur-sm" onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full max-w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        {!isConfirmingDelete && !deletingSupplierLink && (
          <div className="flex items-start justify-between p-8 pb-4 border-b border-gray-100">
            <div className="w-full">
              {isEditing
                ? <input type="text" className="input-field text-xl font-bold mb-1 w-11/12"
                    value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                : <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
              }
              <p className="text-gray-500 text-sm mt-1">Catégorie : {product.category}</p>
            </div>
            <div className="flex items-center gap-2">
              {canManage && (
                <button onClick={() => setIsConfirmingDelete(true)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              {canManage && (
                <button onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                  {isEditing ? <Check className="w-5 h-5 text-green-600" /> : <Edit2 className="w-5 h-5" />}
                </button>
              )}
              {isEditing && (
                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                  <XCircle className="w-5 h-5" />
                </button>
              )}
              <button onClick={onClose} className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors ml-2">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">

          {isConfirmingDelete ? (
            <ConfirmPanel
              title="Supprimer cet intrant ?"
              message={`L'intrant "${product.name}" sera indisponible dans votre catalogue.`}
              onConfirm={handleConfirmDelete}
              onCancel={() => setIsConfirmingDelete(false)}
            />

          ) : deletingSupplierLink ? (
            <ConfirmPanel
              title="Retirer ce fournisseur ?"
              message={`Ce fournisseur sera retiré de la liste des fournisseurs de cet intrant.`}
              onConfirm={handleDeleteLink}
              onCancel={() => setDeletingSupplierLink(null)}
            />

          ) : view === 'details' ? (
            <div className="p-8 space-y-6">

              <div className="flex items-center gap-4 pt-2">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50 flex items-center justify-center">
                  {imageUrl
                    ? <img src={imageUrl} alt={product.name} className="w-full h-full object-contain"
                        onError={e => e.target.style.display = 'none'} />
                    : <span className="text-2xl">📦</span>
                  }
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 leading-tight">{product.name}</p>
                  <p className="text-sm font-mono text-gray-400 mt-0.5">{product.reference}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 text-sm">Informations générales</h3>
                {isEditing ? (
                  <div className="space-y-2">
                    <input className="input-field text-sm" value={editForm.reference}
                      onChange={e => setEditForm({ ...editForm, reference: e.target.value })} placeholder="Référence" />
                    <input className="input-field text-sm" value={editForm.category}
                      onChange={e => setEditForm({ ...editForm, category: e.target.value })} placeholder="Catégorie" />
                    <input className="input-field text-sm" value={editForm.unit}
                      onChange={e => setEditForm({ ...editForm, unit: e.target.value })} placeholder="Unité" />
                    <input type="number" className="input-field text-sm" value={editForm.alert_threshold}
                      onChange={e => setEditForm({ ...editForm, alert_threshold: e.target.value })} placeholder="Seuil d'alerte" />
                  </div>
                ) : (
                  <div className="space-y-1.5 text-sm text-gray-500">
                    <p><span className="font-bold text-gray-700">Référence :</span> {product.reference}</p>
                    <p><span className="font-bold text-gray-700">Catégorie :</span> {product.category}</p>
                    <p><span className="font-bold text-gray-700">Unité :</span> {product.unit}</p>
                    <p><span className="font-bold text-gray-700">Seuil d'alerte :</span> {product.alert_threshold}</p>
                  </div>
                )}
              </div>

              {canManage && (
                <div className="border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-3 text-sm">Photo de produit</h3>
                  {uploadingImage
                    ? <p className="text-sm text-gray-400">Téléchargement en cours...</p>
                    : imageUrl
                      ? <img src={imageUrl} alt={product.name} className="max-w-[120px] max-h-[120px] object-contain rounded-xl mb-3" />
                      : <p className="text-sm text-gray-400 mb-2">Aucune image</p>
                  }
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">
                      <Upload className="w-4 h-4" />
                      {imageUrl ? 'Changer l\'image' : 'Ajouter une image'}
                    </span>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                      disabled={uploadingImage} className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              )}

              {/* Fournisseurs liés */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 text-sm px-1">Fournisseurs liés</h3>
                <div className="border border-gray-200 rounded-2xl p-2 bg-[#FAFAFA]">
                  {supplierLinks.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-2">Aucun fournisseur lié.</p>
                  )}
                  {supplierLinks.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
                      {editingLinkId === link.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input className="input-field text-xs w-20" type="number"
                            value={editLinkForm.unit_price}
                            onChange={e => setEditLinkForm({ ...editLinkForm, unit_price: e.target.value })}
                            placeholder="Prix" />
                          <input className="input-field text-xs w-16" type="number"
                            value={editLinkForm.delivery_days}
                            onChange={e => setEditLinkForm({ ...editLinkForm, delivery_days: e.target.value })}
                            placeholder="Jours" />
                          <input className="input-field text-xs w-20" type="number" step="0.01" min="0" max="1"
                            value={editLinkForm.reliability_score}
                            onChange={e => setEditLinkForm({ ...editLinkForm, reliability_score: e.target.value })}
                            placeholder="Fiabilité" />
                          <div className="flex items-center gap-1 ml-auto">
                            <button onClick={handleSaveEditLink} className="text-green-500 p-1"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingLinkId(null)} className="text-gray-400 p-1"><XCircle className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm text-gray-600 w-28 truncate font-medium">
                            {allSuppliers.find(s => s.id === link.supplier_id)?.name || `#${link.supplier_id}`}
                          </span>
                          <span className="text-sm text-gray-600 font-semibold">{link.unit_price} DA</span>
                          <span className="text-sm text-gray-500">{link.delivery_days}j</span>
                          <span className="text-xs text-gray-400">{(link.reliability_score * 100).toFixed(0)}%</span>
                          {canManage && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => setDeletingSupplierLink(link)} className="text-red-400 hover:text-red-600 p-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => { setEditingLinkId(link.id); setEditLinkForm(link); }} className="text-gray-400 hover:text-gray-600 p-1">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {canManage && (
                <button onClick={() => setView('addSupplier')}
                  className="w-full py-4 bg-[#E2E6FF] text-[#4E54A6] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#D5D9F5] transition-colors">
                  <Plus className="w-5 h-5" /> Lier un fournisseur
                </button>
              )}

            </div>

          ) : (
            <div className="p-8 h-full bg-gray-50/30">
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800">Lier un fournisseur</h3>
                  <button onClick={() => setView('details')} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4 flex-1">
                  <div>
                    <label className="input-label">Fournisseur</label>
                    <select className="input-field bg-white appearance-none"
                      value={newSupplierForm.supplierId}
                      onChange={e => setNewSupplierForm({ ...newSupplierForm, supplierId: e.target.value })}>
                      <option value="">Sélectionner un fournisseur</option>
                      {allSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Prix unitaire (DA)</label>
                    <input type="number" className="input-field"
                      value={newSupplierForm.unitPrice}
                      onChange={e => setNewSupplierForm({ ...newSupplierForm, unitPrice: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Délai de livraison (jours)</label>
                    <input type="number" className="input-field"
                      value={newSupplierForm.deliveryDays}
                      onChange={e => setNewSupplierForm({ ...newSupplierForm, deliveryDays: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Fiabilité (0–1)</label>
                    <input type="number" step="0.01" min="0" max="1" className="input-field"
                      value={newSupplierForm.reliabilityScore}
                      onChange={e => setNewSupplierForm({ ...newSupplierForm, reliabilityScore: e.target.value })} />
                  </div>
                </div>
                <div className="p-6 flex items-center justify-end gap-4 bg-white border-t border-gray-100">
                  <button onClick={() => setView('details')} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                    Annuler
                  </button>
                  <button onClick={handleAddSupplierLink} className="px-6 py-3 rounded-xl font-bold text-white bg-[#6FB576] hover:bg-[#5da063] shadow-lg shadow-green-100 transition-all">
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


export default function Products({ navigate }) {
  const { canManageProducts } = useAuth();

  const [products, setProducts] = useState([]);
  const [storage, setStorage] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('tous');

  // AddIntrantModal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // IntrantPanel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [productsData, storageData, suppliersData] = await Promise.all([
        api.getAllProducts(),
        api.getAllStorage(),
        api.getAllSuppliers(),
      ]);
      setProducts(productsData);
      setStorage(storageData);
      setSuppliers(suppliersData);
    } catch (e) {
      setError(e.toString());
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    const q = e.target.value;
    setSearch(q);
    try {
      const data = q.trim() === '' ? await api.getAllProducts() : await api.searchProducts(q);
      setProducts(data);
    } catch (e) { console.error(e); }
  }

  function getStock(productId) { return storage.find(s => s.product_id === productId); }

  function openAddModal() { setEditingProduct(null); setIsAddModalOpen(true); }

  function openPanel(product) { setSelectedProduct(product); setIsPanelOpen(true); }

  function handlePanelEdit(product) {
    setIsPanelOpen(false);
    setEditingProduct(product);
    setIsAddModalOpen(true);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Chargement du catalogue...
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-400 text-sm">
      Erreur : {error}
    </div>
  );

  return (
    <div className="catalog-container">

      <div className="catalog-header">
        <div className="flex flex-wrap items-center gap-3">
          <div className="date-filter-container w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="select-date w-full pl-10 pr-8"
              value={search}
              onChange={handleSearch}
            />
            {search && (
              <X
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 cursor-pointer hover:text-red-400 transition-colors"
                onClick={() => { setSearch(''); loadData(); }}
              />
            )}
          </div>
        </div>

        {canManageProducts && canManageProducts() && (
          <button className="btn-add-intrant" onClick={openAddModal}>
            <Plus className="w-4 h-4" />
            Ajouter un intrant
          </button>
        )}
      </div>

      <div className="catalog-grid">
        {products.map(p => {
          const stock = getStock(p.id);
          const isLow = stock && stock.quantity <= p.alert_threshold;
          const imageUrl = p.image_path ? api.getImageUrl(p.image_path) : null;

          return (
            <div key={p.id} onClick={() => openPanel(p)} className="catalog-card">
              <div className="card-img-wrapper">
                {imageUrl
                  ? <img src={imageUrl} className="card-img" alt={p.name}
                      onError={e => e.target.style.display = 'none'} />
                  : <div className="card-img flex items-center justify-center text-4xl bg-white">📦</div>
                }
              </div>

              <div>
                <h3 className="card-title">{p.name}</h3>
                <p className="card-category">{p.category}</p>
              </div>

              <div className="card-details">
                <p><span className="font-medium">Référence :</span> {p.reference}</p>
                <p className={isLow ? 'text-red-500 font-semibold' : ''}>
                  <span className="font-medium text-gray-600">Stock :</span>{' '}
                  {stock ? stock.quantity : '—'} {p.unit}
                  {isLow && ' ⚠'}
                </p>
              </div>
            </div>
          );
        })}

        {products.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-400">
            Aucun résultat trouvé...
          </div>
        )}
      </div>

      <AddIntrantModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
        productToEdit={editingProduct}
        onSaved={loadData}
        allSuppliers={suppliers}
      />

      <IntrantPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        product={selectedProduct}
        allSuppliers={suppliers}
        canManage={canManageProducts ? canManageProducts() : false}
        onProductUpdated={async () => {
          await loadData();
          if (selectedProduct) {
            const updated = await api.getProductById(selectedProduct.id).catch(() => null);
            if (updated) setSelectedProduct(updated);
          }
        }}
        onProductDeleted={(id) => {
          setProducts(prev => prev.filter(p => p.id !== id));
          setIsPanelOpen(false);
        }}
      />
    </div>
  );
}