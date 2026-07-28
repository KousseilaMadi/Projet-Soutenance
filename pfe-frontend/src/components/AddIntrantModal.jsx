import React, { useState, useRef, useEffect } from 'react'; 
import { X, ChevronDown, Upload, Check, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

const SuccessPanel = ({ onConfirm, isEditMode }) => (
  <div className="panel-container">
    <div className="success-icon-bg">
      <CheckCircle2 className="w-12 h-12 text-[#76B379]" />
    </div>
    <h3 className="panel-title">{isEditMode ? "Modifications enregistrées !" : "Intrant ajouté !"}</h3>
    <p className="panel-text">
      {isEditMode 
        ? "La fiche de cet intrant a été mise à jour avec succès." 
        : "Votre nouvel intrant a été enregistré avec succès dans le catalogue."}
    </p>
    <button onClick={onConfirm} className="btn-primary w-full">
      Continuer
    </button>
  </div>
);

const CancelConfirmPanel = ({ onStay, onLeave }) => (
  <div className="panel-container">
    <div className="cancel-icon-bg">
      <AlertCircle className="w-12 h-12 text-orange-500" />
    </div>
    <h3 className="panel-title">Êtes-vous sûr ?</h3>
    <p className="panel-text">Toutes les informations saisies seront perdues de manière définitive.</p>
    <div className="flex gap-4 w-full">
      <button onClick={onStay} className="btn-secondary flex-1">Rester</button>
      <button onClick={onLeave} className="btn-danger flex-1">Quitter</button>
    </div>
  </div>
);

function IntrantModal({ isOpen, onClose, intrantToEdit, onSave }) {
  const [view, setView] = useState('form');
  
  const [nom, setNom] = useState('');
  const [seuil, setSeuil] = useState('');
  const [reference, setReference] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // States pour Fournisseur Principal
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFournisseur, setSelectedFournisseur] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // fournisseur alternatif
  const [searchTermAlternatif, setSearchTermAlternatif] = useState('');
  const [selectedFournisseurAlternatif, setSelectedFournisseurAlternatif] = useState('');
  const [isDropdownOpenAlternatif, setIsDropdownOpenAlternatif] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUnite, setSelectedUnite] = useState('');

  const unites = ["Carton", "Palette", "Unité individuelle"];
  const allFournisseurs = ["Plastico Pro", "PrintSolutions", "ChimieExpress", "PackIndustrie", "EcoEmballage Ltd", "Logistique Nord"];
  const categories = [
    { id: "Plastiques", label: "Plastiques" },
    { id: "Emballages", label: "Emballages" },
    { id: "Produits chimiques", label: "Produits chimiques" }
  ];

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null); 
  const dropdownRefAlternatif = useRef(null);

  const isEditMode = !!intrantToEdit;

  const filteredFournisseurs = allFournisseurs.filter(f => f.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredFournisseursAlternatifs = allFournisseurs.filter(f => f.toLowerCase().includes(searchTermAlternatif.toLowerCase()));

  useEffect(() => {
    if (isOpen) {
      if (intrantToEdit) {
        setNom(intrantToEdit.nom || '');
        setReference(intrantToEdit.reference || '');
        setSelectedCategory(intrantToEdit.categorie || '');
        
        setSelectedFournisseur(intrantToEdit.fournisseur || '');
        setSearchTerm(intrantToEdit.fournisseur || '');

        setSelectedFournisseurAlternatif(intrantToEdit.fournisseurAlternatif || '');
        setSearchTermAlternatif(intrantToEdit.fournisseurAlternatif || '');
        
        setSeuil(intrantToEdit.seuilAlerte || '500'); 
        
        let matchedUnite = "Unité individuelle";
        if (intrantToEdit.conditionnement) {
          const cond = intrantToEdit.conditionnement.toLowerCase();
          if (cond.includes('palette')) matchedUnite = "Palette";
          else if (cond.includes('carton')) matchedUnite = "Carton";
        }
        setSelectedUnite(matchedUnite);
        
        setPreviewUrl(intrantToEdit.image || null);
      } else {
        setNom('');
        setReference('');
        setSelectedCategory('');
        setSelectedFournisseur('');
        setSearchTerm('');
        setSelectedFournisseurAlternatif(''); 
        setSearchTermAlternatif('');
        setSeuil('');
        setSelectedUnite('');
        setPreviewUrl(null);
        setSelectedFile(null);
      }
      setView('form');
    }
  }, [isOpen, intrantToEdit]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (dropdownRefAlternatif.current && !dropdownRefAlternatif.current.contains(event.target)) {
        setIsDropdownOpenAlternatif(false);
      }
    };
    if (isDropdownOpen || isDropdownOpenAlternatif) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, isDropdownOpenAlternatif]);

  const handleGenerateRef = () => {
    const randomID = Math.floor(1000 + Math.random() * 9000);
    setReference(`SKU-${randomID}-PET`);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedFile && !isEditMode && !previewUrl) {
      alert("Veuillez ajouter une photo de produit.");
      return;
    }

    const formData = { 
      nom: nom, 
      reference: reference, 
      categorie: selectedCategory, 
      fournisseur: selectedFournisseur, 
      fournisseurAlternatif: selectedFournisseurAlternatif, 
      seuilAlerte: seuil, 
      conditionnement: selectedUnite,
      image: previewUrl 
    };
    
    if (onSave) {
      onSave(formData);
    }
    
    setView('success');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        
        {view === 'form' && (
          <>
            <div className="form-header">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditMode ? "Modifier l'intrant" : "Ajouter un intrant"}
              </h2>
              <button onClick={() => setView('confirmCancel')} className="btn-close">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-body custom-scrollbar">
              <div>
                <label className="input-label">Nom de l'intrant</label>
                <input required type="text" value={nom} onChange={(e) => setNom(e.target.value)} className="input-field" placeholder="Ex: Préformes PET" />
              </div>

              <div>
                <label className="input-label">Référence (SKU)</label>
                <div className="relative">
                  <input required type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="input-field" />
                  <button type="button" onClick={handleGenerateRef} className="btn-generate">Générer</button>
                </div>
              </div>

              <div className="relative">
                <label className="input-label">Catégorie</label>
                <div className="relative">
                  <select required value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input-field appearance-none">
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="relative">
                <label className="input-label">Fournisseur principal</label>
                <div className="relative" ref={dropdownRef}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                   <input
                    type="text"
                    required
                    className="input-field pl-11! pr-10 text-sm" 
                    placeholder="Rechercher un fournisseur..."
                    value={isDropdownOpen ? searchTerm : (selectedFournisseur || searchTerm)}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => {setSearchTerm(e.target.value); setSelectedFournisseur('');}}
                  />
                  {isDropdownOpen && filteredFournisseurs.length > 0 && (
                    <div className="dropdown-menu">
                      {filteredFournisseurs.map((f, i) => (
                        <button key={i} type="button" className="dropdown-item"
                          onClick={() => { setSelectedFournisseur(f); setSearchTerm(f); setIsDropdownOpen(false); }}>
                          <span>{f}</span>
                          {selectedFournisseur === f && <Check className="w-4 h-4 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <label className="input-label">Fournisseur alternatif <span className="text-gray-400 font-normal text-xs">(Optionnel)</span></label>
                <div className="relative" ref={dropdownRefAlternatif}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                   <input
                    type="text"
                    className="input-field pl-11! pr-10 text-sm" 
                    placeholder="Rechercher un fournisseur alternatif..."
                    value={isDropdownOpenAlternatif ? searchTermAlternatif : (selectedFournisseurAlternatif || searchTermAlternatif)}
                    onFocus={() => setIsDropdownOpenAlternatif(true)}
                    onChange={(e) => {setSearchTermAlternatif(e.target.value); setSelectedFournisseurAlternatif('');}}
                  />
                  {isDropdownOpenAlternatif && filteredFournisseursAlternatifs.length > 0 && (
                    <div className="dropdown-menu">
                      {filteredFournisseursAlternatifs.map((f, i) => (
                        <button key={i} type="button" className="dropdown-item"
                          onClick={() => { setSelectedFournisseurAlternatif(f); setSearchTermAlternatif(f); setIsDropdownOpenAlternatif(false); }}>
                          <span>{f}</span>
                          {selectedFournisseurAlternatif === f && <Check className="w-4 h-4 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="input-label">Seuil d'alerte minimum</label>
                <input required type="number" value={seuil} onChange={(e) => setSeuil(e.target.value)} className="input-field" placeholder="Ex: 500" />
              </div>

              <div className="relative">
                <label className="input-label">Conditionnement / Unité</label>
                <div className="relative">
                  <select required value={selectedUnite} onChange={(e) => setSelectedUnite(e.target.value)} className="input-field appearance-none">
                    <option value="">Sélectionner une unité</option>
                    {unites.map((u, i) => <option key={i} value={u}>{u}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="input-label">Photo de produit</label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                
                <div onClick={() => fileInputRef.current.click()} className={`file-upload-box ${selectedFile || previewUrl ? "border-green-400 bg-green-50/30" : "border-gray-200 hover:bg-gray-50"}`}>
                  {previewUrl ? <img src={previewUrl} className="h-16 w-16 object-cover rounded-lg shadow-sm" alt="Preview" /> : (
                    <>
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <p className="text-[11px] text-gray-400">glisser-déposer ou <span className="text-blue-500 font-bold underline">parcourir</span></p>
                    </>
                  )}
                </div>
              </div>
            

            <div className="form-footer flex gap-4 mt-6">
              <button type="button" onClick={() => setView('confirmCancel')} className="btn-secondary flex-1 text-sm">Annuler</button>
              <button type="submit" className="btn-primary flex-1 text-sm">
                {isEditMode ? "Enregistrer les modifications" : "Ajouter l'intrant"}
              </button>
            </div>
            </form>
          </>
        )}

        {view === 'success' && (
          <SuccessPanel onConfirm={() => { setView('form'); onClose(); }} isEditMode={isEditMode} />
        )}

        {view === 'confirmCancel' && (
          <CancelConfirmPanel onStay={() => setView('form')} onLeave={() => { setView('form'); onClose(); }} />
        )}

      </div>
    </div>
  );
}

export default IntrantModal;