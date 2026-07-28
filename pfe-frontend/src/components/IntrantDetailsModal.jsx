import React, { useState, useEffect } from "react";
import { X, Pen, Sparkles, AlertCircle } from "lucide-react"; 


const ConfirmPanel = ({ onConfirm, onCancel }) => (
  <div className="panel-container flex flex-col items-center justify-center p-8 h-full">
    <div className="cancel-icon-bg mb-4">
      <AlertCircle className="w-12 h-12 text-orange-500" />
    </div>
    <h3 className="panel-title text-center text-lg font-bold mb-2">Êtes-vous sûr de vouloir désactiver cet intrant ?</h3>
    <p className="panel-text text-center text-gray-500 mb-6">L'intrant sera indisponible dans votre catalogue d'intrants.</p>
    <div className="flex gap-4 w-full max-w-sm">
      <button onClick={onCancel} className="btn-secondary flex-1">Annuler</button>
      <button onClick={onConfirm} className="btn-danger flex-1 bg-red-500 text-white hover:bg-red-600 rounded-md py-2">Oui, désactiver</button>
    </div>
  </div>
);

function IntrantDetailsModal({ isOpen, onClose, intrant, onEditClick , onDesactivate}) {
  const [view, setView] = useState('details'); 

  useEffect(() => {
    if (isOpen) {
      setView('details');
    }
  }, [isOpen]);
  
  if (!isOpen || !intrant) return null;

  const mockDataComplementary = {
    stock: {
      actuel: "12 500 unités",
      seuilAlerte: intrant.seuilAlerte ? `${intrant.seuilAlerte} unités` : "5 000 unités",
      conditionnement: intrant.conditionnement || "Palette",
      emplacement: "Zone A - Allée 3 - Rack 12"
    },
    fournisseurs: {
      principal: { nom: intrant.fournisseur, delai: intrant.delaiIA || "3 jours", prix: "0.02€ / u" },
      alternatif: { nom: "PackIndustrie", delai: "5 jours", prix: "0.025€ / u" }
    },
    ia: {
      tendance: "En hausse (+12% ce mois)",
      dateEpuisement: "28 Avril 2026",
      fiabilite: intrant.fiabilite || "98%",
      recommandation: "Passer commande de 2 palettes avant le 20 Avril pour éviter la rupture."
    }
  };

  
 const handleConfirmDesactivate = () => {
    
    if (onDesactivate) {
      onDesactivate(intrant.id);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="details-modal-container">
        
        <button onClick={onClose} className="btn-close-details">
          <X className="w-5 h-5 text-gray-400" />
        </button>
        
        {view === 'details' ? (
          <div className="details-content">
            <div className="details-sidebar">
              <div className="details-img-wrapper">
                <img src={intrant.image} className="details-img" alt={intrant.nom} />
              </div>

              <div className="details-info">
                <p className="details-title">{intrant.nom}</p>
                <p className="details-subtitle">{intrant.categorie}</p>
                <p className="details-subtitle">REF : {intrant.reference}</p>
              </div>

              <div className="details-actions">
                <button className="btn-edit" onClick={onEditClick}>
                  <Pen className="w-4 h-4" /> Modifier
                </button>
                <button className="btn-deactivate" onClick={() => setView('confirm')}>
                  <X className="w-4 h-4" /> Désactiver
                </button>
              </div>
            </div>
            
            <div className="details-main">
              <div className="details-section-top grid grid-cols-2 gap-4">
                <div>
                  <p className="section-title">Informations Stock</p>
                  <p className="infos">Stock actuel : <span className="info-content">{mockDataComplementary.stock.actuel}</span></p>
                  <p className="infos">Seuil d'alerte : <span className="info-content">{mockDataComplementary.stock.seuilAlerte}</span></p>
                  <p className="infos">Conditionnement : <span className="info-content">{mockDataComplementary.stock.conditionnement}</span></p>
                  <p className="infos">Emplacement physique : <span className="info-content">{mockDataComplementary.stock.emplacement}</span></p>
                </div>
                
                <div>
                  <p className="section-title">Sourcing & Fournisseurs</p>
                  <p className="infos">Fournisseur Principal : <span className="info-content">{mockDataComplementary.fournisseurs.principal.nom}</span></p>
                  <p className="infos-fournisseur">Délai : <span className="info-content">{mockDataComplementary.fournisseurs.principal.delai}</span></p>
                  <p className="infos-fournisseur">Prix : <span className="info-content">{mockDataComplementary.fournisseurs.principal.prix}</span></p>
                  
                  <p className="infos mt-2">Fournisseur alternatif : <span className="info-content">{mockDataComplementary.fournisseurs.alternatif.nom}</span></p>
                  <p className="infos-fournisseur">Délai : <span className="info-content">{mockDataComplementary.fournisseurs.alternatif.delai}</span></p>
                  <p className="infos-fournisseur">Prix : <span className="info-content">{mockDataComplementary.fournisseurs.alternatif.prix}</span></p>
                </div>
              </div>
              
              <div className="details-section-bottom flex flex-col justify-center">
                <div className="flex flex-row gap-2 items-center mb-3">
                  <Sparkles className="w-5 h-5 text-yellow-600 shrink-0" />
                  <p className="section-title mb-0! text-yellow-800">Analyse IA & Prédictions</p>
                </div>
                
                <div>
                  <p className="infos text-yellow-900">Tendance de consommation : <span className="info-content">{mockDataComplementary.ia.tendance}</span></p>
                  <p className="infos text-yellow-900">Date d'épuisement : <span className="info-content">{mockDataComplementary.ia.dateEpuisement}</span></p>
                  <p className="infos text-yellow-900">Fiabilité fournisseur : <span className="info-content">{mockDataComplementary.ia.fiabilite}</span></p>
                  <p className="infos text-yellow-900 col-span-2 mt-1">Recommandation : <span className="info-content font-bold">{mockDataComplementary.ia.recommandation}</span></p>
                </div>
              </div>
            </div>
          </div>
        ) : (

          <ConfirmPanel 
            onConfirm={handleConfirmDesactivate} 
            onCancel={() => setView('details')} 
          />
        )}

      </div>
    </div>
  );
}

export default IntrantDetailsModal;