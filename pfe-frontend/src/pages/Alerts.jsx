
import { Box, ToggleLeft, ChevronDown, Calendar, X, MoreHorizontal, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import { Sparkles } from 'lucide-react';

function parseAlertAnalysis(alert) {
    const msg = alert.message;

    switch (alert.alert_type) {
        case 'low_stock': {
            const currentMatch = msg.match(/critical: ([\d.]+) units remaining/);
            const thresholdMatch = msg.match(/threshold is ([\d.]+)/);
            const current = currentMatch ? parseFloat(currentMatch[1]) : null;
            const threshold = thresholdMatch ? parseFloat(thresholdMatch[1]) : null;
            const deficit = current !== null && threshold !== null ? (threshold - current).toFixed(2) : null;
            return [
                { title: 'Niveau actuel', value: current !== null ? `${current} unités` : '—' },
                { title: 'Seuil critique', value: threshold !== null ? `${threshold} unités` : '—' },
                { title: 'Déficit', value: deficit !== null ? `${deficit} unités` : '—' },
                { title: 'Recommandation', value: 'Passer une commande immédiatement', bold: true },
            ];
        }
        case 'forecast': {
            const daysMatch = msg.match(/run out in ([\d.]+) days/);
            const dailyMatch = msg.match(/daily consumption: ([\d.]+) units/);
            const adjustedMatch = msg.match(/adjusted: ([\d.]+) units/);
            const days = daysMatch ? parseFloat(daysMatch[1]) : null;
            const daily = dailyMatch ? parseFloat(dailyMatch[1]) : null;
            const adjusted = adjustedMatch ? parseFloat(adjustedMatch[1]) : null;
            const isAdjusted = adjusted !== null && daily !== null && adjusted !== daily;
            return [
                { title: 'Consommation journalière', value: daily !== null ? `${daily} unités/jour` : '—' },
                ...(isAdjusted ? [{ title: 'Consommation ajustée', value: `${adjusted} unités/jour (période exceptionnelle)` }] : []),
                { title: 'Rupture prévue dans', value: days !== null ? `${days} jours` : '—' },
                { title: 'Recommandation', value: 'Commande en cours de traitement', bold: true },
            ];
        }
        case 'anomaly': {
            const exitMatch = msg.match(/detected: ([\d.]+) units/);
            const meanMatch = msg.match(/mean: ([\d.]+)/);
            const stdMatch = msg.match(/std dev: ([\d.]+)/);
            const zMatch = msg.match(/z-score: ([\d.]+)/);
            const z = zMatch ? parseFloat(zMatch[1]) : null;
            const severity = z !== null ? (z > 10 ? 'Anomalie critique' : z > 5 ? 'Anomalie élevée' : 'Anomalie modérée') : '—';
            return [
                { title: 'Sortie détectée', value: exitMatch ? `${exitMatch[1]} unités` : '—' },
                { title: 'Moyenne habituelle', value: meanMatch ? `${meanMatch[1]} unités` : '—' },
                { title: 'Écart type', value: stdMatch ? `${stdMatch[1]} unités` : '—' },
                { title: 'Z-score', value: z !== null ? `${z} — ${severity}` : '—', bold: true },
            ];
        }
        case 'capacity': {
            const capacityMatch = msg.match(/max capacity of ([\d.]+) units/);
            return [
                { title: 'Capacité maximale', value: capacityMatch ? `${capacityMatch[1]} unités` : '—' },
                { title: 'Recommandation', value: 'Réduire la quantité ou augmenter la capacité de stockage', bold: true },
            ];
        }
        default:
            return [];
    }
}

function Alerts({ navigate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const { canManageProducts } = useAuth();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const resetFilters = () => {
    setFilterType('');
    setFilterStatus('');
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'active': return 'badge-red';
      case 'acknowledged': return 'badge-yellow';
      case 'resolved': return 'badge-green';
      default: return 'badge-gray';
    }
  };

  const getTypeStyle = (type) => {
    switch(type) {
      case 'low_stock': return 'badge-orange';
      case 'out_of_stock': return 'badge-red';
      case 'delivery_delayed': return 'badge-purple';
      case 'quality_issue': return 'badge-blue';
      default: return 'badge-gray';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };


  const handleOpenModal = (alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAlert(null);
  };


    useEffect(() => {
        loadAlerts();
    }, []);

    async function loadAlerts() {
        try {
            setLoading(true);
            const data = await api.getAllAlerts();
            setAlerts(data);
        } catch (e) {
            setError(e.toString());
        } finally {
            setLoading(false);
        }
    }

    async function handleAcknowledge(id) {
        try {
            await api.acknowledgeAlert(id);
            loadAlerts();
            handleCloseModal()
        } catch (e) {
            alert('Error: ' + e);
        }
    }

    async function handleResolve(id) {
        try {
            await api.resolveAlert(id);
            loadAlerts();
        } catch (e) {
            alert('Error: ' + e);
        }
    }

    const filtered = alerts
        .filter(a => filterType ? a.alert_type === filterType : true)
        .filter(a => filterStatus ? a.status === filterStatus : true);

    if (loading) return <div>Loading alerts...</div>;
    if (error) return <div>Error: {error}</div>;

  return (
    <div className="catalog-container">
      
      <div className="filter-group alert-filters">
        <div className="date-filter-container filter-select-box">
          <Box className="filter-icon" />
          <select 
            className="select-date filter-select-input" 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Type : Tous</option>
            <option value="low_stock">Low stock</option>
            <option value="forecast">Forecast</option>
            <option value="anomaly">Anomaly</option>
            <option value="capacity">Capacity</option>
          </select>
          <ChevronDown className="filter-chevron" />
        </div>

        <div className="date-filter-container filter-select-box">
          <ToggleLeft className="filter-icon" />
          <select 
            className="select-date filter-select-input" 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Statut : Tous</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
          <ChevronDown className="filter-chevron" />
        </div>
        <button className="btn-reset" onClick={loadAlerts}>Refresh</button>

        {(filterType || filterStatus) && (
          <button onClick={resetFilters} className="btn-reset">
            <X className="w-4 h-4" />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="table-sec alert-table-sec">
        <div className="table-header-grid-alerts">
          <p className="tab-header-title">Date & Heure</p>
          <p className="tab-header-title">Intrant</p>
          <p className="tab-header-title">Type</p>
          <p className="tab-header-title">Statut</p>
          <p className="tab-header-title">Commande liée</p>
          <p className="tab-header-title">Actions</p>
        </div>
        
        <div className="table-scroll-area">
          {filtered.map((a, index) => (
            <div key={index} className={`table-row-grid ${index % 2 === 0 ? 'row-even' : 'row-odd'}`}>
              
              <p className="text-date">{formatDate(a.created_at)}</p>
              <p className="text-product">{a.product_name}</p>
              
              <div>
                <span className={`badge-fixed ${getTypeStyle(a.alert_type)}`}>
                  {a.alert_type.replace('_', ' ')}
                </span>
              </div>
              
              <div>
                <span className={`badge-fixed ${getStatusStyle(a.status)}`}>
                  {a.status}
                </span>
              </div>
              
              <div>
                {a.order_id && a.order_id !== "—" ? (
                  <button onClick={() => navigate('orders')} className="link-order">
                    <span className="text-empty-order">#{a.order_id}</span>
                  </button>
                ) : (
                  <span className="text-empty-order">—</span>
                )}
              </div>
              
              {canManageProducts() && (
                <div className="action-buttons">
                  <button 
                    onClick={() => handleOpenModal(a)} 
                    className={`btn-icon ${a.status !== 'active' ? 'btn-icon-ack' : 'btn-icon-default'}`} 
                    title={a.status === 'active' ? "Acquitter l'alerte" : "Voir les détails d'acquittement"}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  
                  {a.status !== 'resolved' && (
                    <button 
                      onClick={() => handleResolve(a.id)} 
                      className="btn-icon-resolve" 
                      title="Marquer comme résolue"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
              </div>
            )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="table-empty-state">
              Aucune alerte trouvée pour ces filtres...
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedAlert && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <button onClick={handleCloseModal} className="modal-close">
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="modal-title">
              Acquitter l'alerte : {selectedAlert.product_name} 
            </h2>
            <p className="modal-subtitle">Confirmez votre prise en charge du problème.</p>
            
            <div className="modal-info-panel">
              <div className="modal-info-header">
                <Calendar className="w-4 h-4 text-gray-400" />
                {formatDate(selectedAlert.created_at)}
              </div>
              <div className="modal-info-grid">
                <div className="modal-label-col">Intrant :</div>
                <div className="modal-value-col">{selectedAlert.product_name}</div>
                
                <div className="modal-label-col">Type :</div>
                <div className="modal-value-col-flex">
                  <span className={`status-dot ${selectedAlert.alert_type === 'out_of_stock' ? 'dot-red' : 'dot-orange'}`}></span>
                  {selectedAlert.alert_type.replace('_', ' ')}
                </div>
                
                <div className="modal-label-col">Statut Actuel :</div>
                <div className="modal-value-col-flex">
                  <span className={`status-dot ${selectedAlert.status === 'active' ? 'dot-red' : (selectedAlert.status === 'acknowledged' ? 'dot-yellow' : 'dot-green')}`}></span>
                  {selectedAlert.status}
                </div>
              </div>
            </div>

            {selectedAlert.status === 'active' ? (
              <>
                <div className="modal-form-group">
                  <label className="modal-form-label">
                    Message :
                  </label>
                  <div className="modal-comment-box">
                    "{selectedAlert.message || 'Aucun commentaire renseigné.'}"
                  </div>
                </div>
                  <div className="bg-[#F4F6FF] border border-[#E0E5FF] rounded-2xl p-5 relative overflow-hidden mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <h3 className="font-bold text-gray-800 text-sm">Analyse IA & Prédictions</h3>
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-600 pl-6">
                      {parseAlertAnalysis(selectedAlert).map((item, idx) => (
                          <p key={idx} className={idx === parseAlertAnalysis(selectedAlert).length - 1 ? 'mt-1' : ''}>
                              <span className="font-bold text-gray-700">{item.title} : </span>
                              <span className={item.bold ? 'font-bold' : ''}>{item.value}</span>
                          </p>
                      ))}
                  </div>
                </div>

                <p className="modal-desc">
                  En acquittant cette alerte, vous confirmez que vous avez pris connaissance du risque critique et que vous assurez le suivi opérationnel. Le statut passera de "active" à "acknowledged" et cette action sera tracée dans l'historique de l'intrant.
                </p>

                <div className="modal-actions-bar">
                  <button onClick={handleCloseModal} className="btn-modal-cancel">
                    Annuler
                  </button>
                  <button 
                    onClick={() => handleAcknowledge(selectedAlert.id)}
                    className="btn-modal-confirm"
                  >
                    Confirmer l'acquittement
                  </button>
                </div>
              </>
            ) : (
              <>
                  <div className="bg-[#F4F6FF] border border-[#E0E5FF] rounded-2xl p-5 relative overflow-hidden mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <h3 className="font-bold text-gray-800 text-sm">Analyse IA & Prédictions</h3>
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-600 pl-6">
                      {parseAlertAnalysis(selectedAlert).map((item, idx) => (
                          <p key={idx} className={idx === parseAlertAnalysis(selectedAlert).length - 1 ? 'mt-1' : ''}>
                              <span className="font-bold text-gray-700">{item.title} : </span>
                              <span className={item.bold ? 'font-bold' : ''}>{item.value}</span>
                          </p>
                      ))}
                  </div>
                </div>

                <div className="modal-actions-bar">
                  <button onClick={handleCloseModal} className="btn-modal-cancel">
                    Fermer
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default Alerts;