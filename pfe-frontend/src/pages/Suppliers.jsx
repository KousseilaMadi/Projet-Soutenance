import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import {
  LayoutGrid, ChevronDown, ToggleLeft, Search, X, Plus,
  Trash2, Edit2, Check, XCircle, AlertCircle
} from 'lucide-react';


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


const emptyForm = { name: '', category: '', address: '', contact: '', phone: '' };

function AddFournisseurModal({ isOpen, onClose, onSaved, supplierToEdit }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (isOpen) {
      if (supplierToEdit) {
        setForm({
          name: supplierToEdit.name || '',
          category: supplierToEdit.category || '',
          address: supplierToEdit.address || '',
          contact: supplierToEdit.contact || '',
          phone: supplierToEdit.phone || '',
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [supplierToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!form.name) return;
    try {
      if (supplierToEdit) {
        await api.updateSupplier(
          supplierToEdit.id,
          form.name,
          form.contact || null,
          form.phone || null,
          form.address || null,
          supplierToEdit.is_active,
        );
      } else {
        await api.createSupplier(
          form.name,
          form.contact || null,
          form.phone || null,
          form.address || null,
        );
      }
      onSaved();
      onClose();
    } catch (e) {
      alert('Erreur : ' + e);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {supplierToEdit ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="input-label">Nom du fournisseur</label>
            <input type="text" className="input-field" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Catégorie</label>
            <input type="text" className="input-field" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              placeholder="Ex: Plastiques" />
          </div>
          <div>
            <label className="input-label">Adresse</label>
            <input type="text" className="input-field" value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Contact</label>
            <input type="text" className="input-field" value={form.contact}
              onChange={e => setForm({ ...form, contact: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Téléphone</label>
            <input type="text" className="input-field" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button onClick={handleSubmit} className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#6FB576] hover:bg-[#5da063] shadow-lg shadow-green-100 transition-all">
            {supplierToEdit ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>

      </div>
    </div>
  );
}


const emptyLinkForm = { productId: '', unitPrice: '', deliveryDays: '', reliabilityScore: '' };

function FournisseurPanel({ isOpen, onClose, supplier, allProducts, canManage, onSupplierUpdated, onSupplierDeleted }) {
  const [view, setView] = useState('details'); // 'details' | 'addProduct'
  const [isDeletingGlobal, setIsDeletingGlobal] = useState(false);
  const [deletingLink, setDeletingLink] = useState(null);

  const [isEditingGlobal, setIsEditingGlobal] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState(null);

  const [editGlobalForm, setEditGlobalForm] = useState({});
  const [editLinkForm, setEditLinkForm] = useState({});
  const [newLinkForm, setNewLinkForm] = useState(emptyLinkForm);

  const [productLinks, setProductLinks] = useState([]);

  useEffect(() => {
    if (isOpen && supplier) {
      setView('details');
      setIsDeletingGlobal(false);
      setDeletingLink(null);
      setIsEditingGlobal(false);
      setEditingLinkId(null);
      setNewLinkForm(emptyLinkForm);
      setEditGlobalForm({
        name: supplier.name || '',
        contact: supplier.contact || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
      });
      loadProductLinks(supplier.id);
    }
  }, [isOpen, supplier?.id]);

  async function loadProductLinks(supplierId) {
    try {
      const links = await api.getProductsForSupplier(supplierId);
      setProductLinks(links);
    } catch (e) { console.error(e); }
  }

  if (!isOpen || !supplier) return null;

  const handleSaveGlobal = async () => {
    try {
      await api.updateSupplier(
        supplier.id,
        editGlobalForm.name,
        editGlobalForm.contact || null,
        editGlobalForm.phone || null,
        editGlobalForm.address || null,
        supplier.is_active,
      );
      setIsEditingGlobal(false);
      onSupplierUpdated();
    } catch (e) { alert('Erreur : ' + e); }
  };

  const handleToggleActive = async () => {
    try {
      await api.updateSupplier(
        supplier.id,
        supplier.name,
        supplier.contact,
        supplier.phone,
        supplier.address,
        !supplier.is_active,
      );
      onSupplierUpdated();
    } catch (e) { alert('Erreur : ' + e); }
  };

  const handleConfirmDelete = async () => {
    try {
      await api.deleteSupplier(supplier.id);
      setIsDeletingGlobal(false);
      onSupplierDeleted(supplier.id);
      onClose();
    } catch (e) { alert('Erreur : ' + e); }
  };

  const handleAddLink = async () => {
    if (!newLinkForm.productId) return;
    try {
      await api.addProductToSupplier(
        parseInt(newLinkForm.productId),
        supplier.id,
        parseFloat(newLinkForm.unitPrice),
        parseInt(newLinkForm.deliveryDays),
        parseFloat(newLinkForm.reliabilityScore),
      );
      setNewLinkForm(emptyLinkForm);
      setView('details');
      loadProductLinks(supplier.id);
    } catch (e) { alert('Erreur : ' + e); }
  };

  const handleSaveEditLink = async () => {
    try {
      await api.updateProductSupplier(
        editingLinkId,
        parseFloat(editLinkForm.unit_price),
        parseInt(editLinkForm.delivery_days),
        parseFloat(editLinkForm.reliability_score),
      );
      setEditingLinkId(null);
      loadProductLinks(supplier.id);
    } catch (e) { alert('Erreur : ' + e); }
  };

  const handleConfirmDeleteLink = async () => {
    try {
      await api.removeProductFromSupplier(deletingLink.id);
      setDeletingLink(null);
      loadProductLinks(supplier.id);
    } catch (e) { alert('Erreur : ' + e); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40 transition-opacity backdrop-blur-sm" onClick={onClose} />

      <div className={`fixed top-0 right-0 h-full w-full max-w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {!isDeletingGlobal && !deletingLink && (
          <div className="flex items-start justify-between p-8 pb-4 border-b border-gray-100">
            <div className="w-full">
              {isEditingGlobal
                ? <input type="text" className="input-field text-xl font-bold mb-1 w-11/12"
                    value={editGlobalForm.name} onChange={e => setEditGlobalForm({ ...editGlobalForm, name: e.target.value })} />
                : <h2 className="text-2xl font-bold text-gray-800">{supplier.name}</h2>
              }
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  supplier.is_active ? 'bg-[#E6F4EA] text-[#288140]' : 'bg-[#FCE8E8] text-[#D93025]'
                }`}>
                  {supplier.is_active ? 'Actif' : 'Inactif'}
                </span>
                {canManage && (
                  <button onClick={handleToggleActive}
                    className="text-xs text-gray-400 underline hover:text-gray-600 transition-colors">
                    {supplier.is_active ? 'Désactiver' : 'Activer'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canManage && (
                <button onClick={() => setIsDeletingGlobal(true)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              {canManage && (
                <button onClick={() => isEditingGlobal ? handleSaveGlobal() : setIsEditingGlobal(true)}
                  className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                  {isEditingGlobal ? <Check className="w-5 h-5 text-green-600" /> : <Edit2 className="w-5 h-5" />}
                </button>
              )}
              {isEditingGlobal && (
                <button onClick={() => setIsEditingGlobal(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors">
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

          {isDeletingGlobal ? (
            <ConfirmPanel
              title="Supprimer ce fournisseur ?"
              message={`Êtes-vous sûr de vouloir supprimer définitivement "${supplier.name}" ? Cette action est irréversible.`}
              onConfirm={handleConfirmDelete}
              onCancel={() => setIsDeletingGlobal(false)}
            />

          ) : deletingLink ? (
            <ConfirmPanel
              title="Retirer ce produit ?"
              message={`"${deletingLink.product_name}" sera retiré de la liste des produits de ce fournisseur.`}
              onConfirm={handleConfirmDeleteLink}
              onCancel={() => setDeletingLink(null)}
            />

          ) : view === 'details' ? (
            <div className="p-8 space-y-6">

              <div className="flex items-center gap-4 pt-2">
                <div className="w-16 h-16 bg-[#F28B2A] flex items-center justify-center rounded-2xl flex-shrink-0">
                  <span className="text-white font-bold text-xl">
                    {supplier.name?.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 leading-tight">{supplier.name}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{supplier.contact || '—'}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 text-sm">Informations de contact</h3>
                {isEditingGlobal ? (
                  <div className="space-y-2">
                    <input className="input-field text-sm" value={editGlobalForm.contact}
                      onChange={e => setEditGlobalForm({ ...editGlobalForm, contact: e.target.value })} placeholder="Contact" />
                    <input className="input-field text-sm" value={editGlobalForm.phone}
                      onChange={e => setEditGlobalForm({ ...editGlobalForm, phone: e.target.value })} placeholder="Téléphone" />
                    <input className="input-field text-sm" value={editGlobalForm.address}
                      onChange={e => setEditGlobalForm({ ...editGlobalForm, address: e.target.value })} placeholder="Adresse" />
                  </div>
                ) : (
                  <div className="space-y-1.5 text-sm text-gray-500">
                    <p><span className="font-bold text-gray-700">Contact :</span> {supplier.contact || '—'}</p>
                    <p><span className="font-bold text-gray-700">Téléphone :</span> {supplier.phone || '—'}</p>
                    <p><span className="font-bold text-gray-700">Adresse :</span> {supplier.address || '—'}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-3 text-sm px-1">Catalogue produits fournis</h3>
                <div className="border border-gray-200 rounded-2xl p-2 bg-[#FAFAFA]">
                  {productLinks.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-2">Aucun produit lié.</p>
                  )}
                  {productLinks.map(link => (
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
                          <span className="text-sm text-gray-600 w-28 truncate font-medium">{link.product_name}</span>
                          <span className="text-sm text-gray-500 font-mono w-20 truncate">{link.product_reference}</span>
                          <span className="text-sm text-gray-600 font-semibold">{link.unit_price} DA</span>
                          <span className="text-sm text-gray-500">{link.delivery_days}j</span>
                          {canManage && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => setDeletingLink(link)} className="text-red-400 hover:text-red-600 p-1">
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
                <button onClick={() => setView('addProduct')}
                  className="w-full py-4 bg-[#E2E6FF] text-[#4E54A6] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#D5D9F5] transition-colors">
                  <Plus className="w-5 h-5" /> Lier un produit
                </button>
              )}

            </div>

          ) : (
            <div className="p-8 h-full bg-gray-50/30">
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800">Lier un produit</h3>
                  <button onClick={() => setView('details')} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4 flex-1">
                  <div>
                    <label className="input-label">Produit</label>
                    <select className="input-field bg-white appearance-none"
                      value={newLinkForm.productId}
                      onChange={e => setNewLinkForm({ ...newLinkForm, productId: e.target.value })}>
                      <option value="">Sélectionner un produit</option>
                      {allProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Prix unitaire (DA)</label>
                    <input type="number" className="input-field" value={newLinkForm.unitPrice}
                      onChange={e => setNewLinkForm({ ...newLinkForm, unitPrice: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Délai de livraison (jours)</label>
                    <input type="number" className="input-field" value={newLinkForm.deliveryDays}
                      onChange={e => setNewLinkForm({ ...newLinkForm, deliveryDays: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Fiabilité (0–1)</label>
                    <input type="number" step="0.01" min="0" max="1" className="input-field"
                      value={newLinkForm.reliabilityScore}
                      onChange={e => setNewLinkForm({ ...newLinkForm, reliabilityScore: e.target.value })} />
                  </div>
                </div>

                <div className="p-6 flex items-center justify-end gap-4 bg-white border-t border-gray-100">
                  <button onClick={() => setView('details')} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                    Annuler
                  </button>
                  <button onClick={handleAddLink} className="px-6 py-3 rounded-xl font-bold text-white bg-[#6FB576] hover:bg-[#5da063] shadow-lg shadow-green-100 transition-all">
                    Lier le produit
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


export default function Suppliers({ navigate }) {
  const { canManageProducts } = useAuth();

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [suppliersData, productsData] = await Promise.all([
        api.getAllSuppliers(),
        api.getAllProducts(),
      ]);
      setSuppliers(suppliersData);
      setProducts(productsData);
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
      const data = q.trim() === '' ? await api.getAllSuppliers() : await api.searchSuppliers(q);
      setSuppliers(data);
    } catch (e) { console.error(e); }
  }

  const categoriesUniques = useMemo(() => [...new Set(suppliers.map(s => s.category).filter(Boolean))], [suppliers]);
  const statutsUniques = useMemo(() => [...new Set(suppliers.map(s => s.is_active ? 'Actif' : 'Inactif'))], [suppliers]);

  const filteredSuppliers = suppliers.filter(s => {
    const matchesCategory = categorieFilter === '' || s.category === categorieFilter;
    const matchesStatut = statutFilter === '' || (s.is_active ? 'Actif' : 'Inactif') === statutFilter;
    return matchesCategory && matchesStatut;
  });

  function openPanel(supplier) {
    setSelectedSupplier(supplier);
    setIsPanelOpen(true);
  }

  async function refreshSelectedSupplier() {
    await loadData();
    if (selectedSupplier) {
      const fresh = await api.getAllSuppliers().catch(() => null);
      if (fresh) {
        const updated = fresh.find(s => s.id === selectedSupplier.id);
        if (updated) setSelectedSupplier(updated);
      }
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Chargement des fournisseurs...
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-400 text-sm">
      Erreur : {error}
    </div>
  );

  return (
    <div className="catalog-container">

      <div className="filter-group flex gap-4 flex-wrap items-center justify-between">
        <div className="flex gap-4 flex-wrap items-center">

          <div className="date-filter-container relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input type="text" placeholder="Rechercher..."
              className="select-date w-full pl-10 pr-8"
              value={search} onChange={handleSearch} />
            {search && (
              <X className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 cursor-pointer hover:text-red-400 transition-colors"
                onClick={() => { setSearch(''); loadData(); }} />
            )}
          </div>

          <div className="date-filter-container relative w-44">
            <ToggleLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select className="select-date w-full truncate pl-9" value={statutFilter}
              onChange={e => setStatutFilter(e.target.value)}>
              <option value="">Statut : Tous</option>
              {statutsUniques.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none bg-white pl-1" />
          </div>
 
          {(categorieFilter || statutFilter) && (
            <button onClick={() => { setCategorieFilter(''); setStatutFilter(''); }}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors ml-2">
              <X className="w-4 h-4" /> Réinitialiser
            </button>
          )}
        </div>

        {canManageProducts && canManageProducts() && (
          <button className="btn-add-intrant" onClick={() => { setEditingSupplier(null); setIsAddModalOpen(true); }}>
            <Plus className="w-4 h-4" />
            Ajouter un fournisseur
          </button>
        )}
      </div>

      <div className="table-sec mt-8">
        <div className="table-header-grid grid-fournisseurs">
          <p className="tab-header-title">Nom</p>
          <p className="tab-header-title">Address</p>
          <p className="tab-header-title">Contact</p>
          <p className="tab-header-title">Phone</p>
          <p className="tab-header-title text-center">Statut</p>
        </div>

        {filteredSuppliers.length > 0 ? (
          filteredSuppliers.map(s => (
            <div key={s.id} onClick={() => openPanel(s)}
              className="table-row grid-fournisseurs cursor-pointer hover:bg-gray-50 transition-colors">
              <p className="table-cell-text font-bold text-gray-800">{s.name}</p>
              <p className="table-cell-text text-gray-600">{s.address || '—'}</p>
              <p className="table-cell-text text-gray-600 truncate">{s.contact || '—'}</p>
              <p className="table-cell-text text-gray-600 truncate">{s.phone || '—'}</p>
              <div className="flex justify-center items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  s.is_active ? 'bg-[#E6F4EA] text-[#288140]' : 'bg-[#FCE8E8] text-[#D93025]'
                }`}>
                  {s.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm">
            Aucun résultat trouvé...
          </div>
        )}
      </div>

      <FournisseurPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        supplier={selectedSupplier}
        allProducts={products}
        canManage={canManageProducts ? canManageProducts() : false}
        onSupplierUpdated={refreshSelectedSupplier}
        onSupplierDeleted={(id) => {
          setSuppliers(prev => prev.filter(s => s.id !== id));
          setIsPanelOpen(false);
        }}
      />

      <AddFournisseurModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingSupplier(null); }}
        onSaved={loadData}
        supplierToEdit={editingSupplier}
      />
    </div>
  );
}