import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import {
  ChevronDown, LayoutGrid, Plus, Search, Trash2, CheckCircle2, AlertCircle,
  Calendar, Edit2, Check, X
} from 'lucide-react';

const determinerStatut = (dateDebut, dateFin) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (today < new Date(dateDebut)) return 'À venir';
  if (today > new Date(dateFin)) return 'Passé';
  return 'Actif';
};

const formaterDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const getStatutDot = (statut) => {
  if (statut === 'Actif') return 'bg-green-500';
  if (statut === 'À venir') return 'bg-blue-500';
  return 'bg-gray-400';
};

const getStatutBg = (statut) => {
  if (statut === 'Actif') return 'bg-[#E6F4EA] text-[#288140] border-[#B7E1C3]';
  if (statut === 'À venir') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
};

const getParamColor = (key) => {
  if (key.startsWith('weight_')) return 'bg-emerald-50 text-emerald-600';
  if (key.startsWith('anomaly_')) return 'bg-orange-50 text-orange-600';
  if (key.startsWith('forecast_')) return 'bg-blue-50 text-blue-600';
  return 'bg-indigo-50 text-indigo-600';
};

function FormulairePeriode({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', factor: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createExceptionalPeriod(
        form.name,
        form.startDate,
        form.endDate,
        parseFloat(form.factor),
      );
      onSaved();
      onClose();
    } catch (err) {
      alert('Erreur : ' + err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Ajouter une période</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="input-label">Nom (ex: Ramadan)</label>
            <input required type="text" className="input-field" placeholder="Ex: Aïd El Fitr"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Date de début</label>
            <input required type="date" className="input-field"
              value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Date de fin</label>
            <input required type="date" className="input-field"
              value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Facteur (ex: 1.5)</label>
            <input required type="number" step="0.01" className="input-field" placeholder="Ex: 1.5"
              value={form.factor} onChange={e => setForm({ ...form, factor: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#6FB576] hover:bg-[#5da063] shadow-lg shadow-green-100 transition-all">
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Settings({ navigate }) {
  const { canManageSettings } = useAuth();

  const [settings, setSettings] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('parametres');

  const [editingParamKey, setEditingParamKey] = useState(null);
  const [editingParamValue, setEditingParamValue] = useState('');

  const [searchFilter, setSearchFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState(null);
  const [editPeriodForm, setEditPeriodForm] = useState({});
  const [periodToDelete, setPeriodToDelete] = useState(null);

  const [successConfig, setSuccessConfig] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [settingsData, periodsData] = await Promise.all([
        api.getAllSettings(),
        api.getAllExceptionalPeriods(),
      ]);
      setSettings(settingsData);
      setPeriods(periodsData);
    } catch (e) {
      setError(e.toString());
    } finally {
      setLoading(false);
    }
  }


  const handleSaveParam = async () => {
    try {
      await api.updateSetting(editingParamKey, editingParamValue);
      setEditingParamKey(null);
      setEditingParamValue('');
      await loadData();
      setSuccessConfig({ title: 'Paramètre mis à jour !', text: 'La valeur a été enregistrée avec succès.' });
    } catch (e) {
      alert('Erreur : ' + e);
    }
  };

  const handleSaveEditPeriod = async () => {
    try {
      await api.updateExceptionalPeriod(
        editingPeriodId,
        editPeriodForm.name,
        editPeriodForm.start_date,
        editPeriodForm.end_date,
        parseFloat(editPeriodForm.factor),
      );
      setEditingPeriodId(null);
      await loadData();
      setSuccessConfig({ title: 'Modifications enregistrées !', text: 'La période a été mise à jour.' });
    } catch (e) {
      alert('Erreur : ' + e);
    }
  };

  const handleConfirmDeletePeriod = async () => {
    try {
      await api.deleteExceptionalPeriod(periodToDelete.id);
      setPeriodToDelete(null);
      await loadData();
      setSuccessConfig({ title: 'Période supprimée !', text: 'Cette période a été retirée.' });
    } catch (e) {
      alert('Erreur : ' + e);
    }
  };

const paramMeta = {
    anomaly_window_days: {
        label: 'Fenêtre d\'analyse (jours)',
        description: 'Nombre de jours d\'historique utilisés pour calculer la consommation normale. Plus la fenêtre est large, plus la baseline est stable.',
    },
    anomaly_z_score_threshold: {
        label: 'Seuil de détection d\'anomalie',
        description: 'Sensibilité du détecteur d\'anomalies. Une valeur de 2.0 signifie qu\'une sortie doit dépasser 2 écarts-types de la moyenne pour déclencher une alerte.',
    },
    forecast_horizon_days: {
        label: 'Horizon de prévision (jours)',
        description: 'Nombre de jours à l\'avance que l\'IA surveille. Si une rupture est prévue dans ce délai, une alerte et une commande sont générées automatiquement.',
    },
    forecast_min_data_points: {
        label: 'Points minimum (détection)',
        description: 'Nombre minimum de sorties récentes requis avant de lancer la détection d\'anomalies. En dessous de ce seuil, pas assez de données pour un résultat fiable.',
    },
    agent2_min_data_points: {
        label: 'Points minimum (prévision)',
        description: 'Nombre minimum de sorties récentes requis avant de lancer la prévision de rupture. En dessous de ce seuil, la régression linéaire ne serait pas fiable.',
    },
    weight_price: {
        label: 'Poids — Prix',
        description: 'Importance du prix dans le scoring fournisseur (entre 0 et 1). La somme des trois poids doit être égale à 1.',
    },
    weight_delivery: {
        label: 'Poids — Délai de livraison',
        description: 'Importance de la rapidité de livraison dans le scoring fournisseur. Un poids élevé favorise les fournisseurs les plus rapides.',
    },
    weight_reliability: {
        label: 'Poids — Fiabilité',
        description: 'Importance de la fiabilité fournisseur dans le scoring. Basé sur le score de fiabilité (0 à 1) défini manuellement par produit-fournisseur.',
    },
};


  const periodsCalculated = periods.map(p => ({
    ...p,
    statut: determinerStatut(p.start_date, p.end_date),
    datesAffichees: `${formaterDate(p.start_date)} — ${formaterDate(p.end_date)}`,
  }));

  const periodsFiltrees = periodsCalculated.filter(p =>
    (statutFilter === '' || p.statut === statutFilter) &&
    (searchFilter === '' || p.name.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const weightParams = settings.filter(s => s.key.startsWith('weight_'));
  const weightTotal = weightParams.reduce((sum, s) => sum + parseFloat(s.value || 0), 0);
  const weightValid = Math.abs(weightTotal - 1.0) < 0.001;

    const renderParamCard = (s, step = '0.1') => {
    const meta = paramMeta[s.key] || { label: s.key, description: null };
    return (
        <div key={s.key} className="param-card flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3 flex-1">
                <div className="param-info group relative">
                    <h4 className="cursor-default">{meta.label}</h4>
                    {meta.description && (
                        <div className="absolute left-0 top-full mt-1.5 z-10 hidden group-hover:block w-72 bg-gray-800 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl leading-relaxed">
                            {meta.description}
                            <div className="absolute -top-1.5 left-4 w-3 h-3 bg-gray-800 rotate-45"></div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {editingParamKey === s.key ? (
                    <>
                        <input type="number" step={step} autoFocus
                            className="w-24 px-3 py-1.5 border border-indigo-300 rounded-lg text-sm font-bold text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={editingParamValue}
                            onChange={e => setEditingParamValue(e.target.value)}
                        />
                        <button onClick={handleSaveParam} className="text-green-600 hover:bg-green-100 p-1.5 rounded-lg transition-colors"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingParamKey(null)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                    </>
                ) : (
                    <>
                        <span className="param-input text-center font-bold text-gray-800 w-20">{s.value}</span>
                        {canManageSettings && canManageSettings() && (
                            <button onClick={() => { setEditingParamKey(s.key); setEditingParamValue(String(s.value)); }}
                                className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};



  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Chargement de la configuration...
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-400 text-sm">
      Erreur : {error}
    </div>
  );

  return (
    <div className="catalog-container relative">
      <div className="table-container">

        <div className="onglets">
          <button onClick={() => setActiveTab('parametres')} className={activeTab === 'parametres' ? 'selected-tab' : 'unselected-tab'}>
            Paramètres de l'IA
          </button>
          <button onClick={() => setActiveTab('periodes')} className={activeTab === 'periodes' ? 'selected-tab' : 'unselected-tab'}>
            Périodes exceptionnelles
          </button>
        </div>

        <div className="table">

          {activeTab === 'parametres' && (
            <div className="max-w-4xl">
              <div className="flex flex-col gap-2 mb-6">

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-2 mb-1">Agents & Détection</p>
                {settings.filter(s => s.key.startsWith('agent') || s.key.startsWith('anomaly')).map(s => renderParamCard(s, '0.1'))}

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-4 mb-1">Prévision (Régression linéaire)</p>
                {settings.filter(s => s.key.startsWith('forecast')).map(s => renderParamCard(s, '1'))}

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-4 mb-1">Scoring fournisseurs</p>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium mb-1 ${weightValid ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                  {weightValid
                    ? <CheckCircle2 className="w-3.5 h-3.5" />
                    : <AlertCircle className="w-3.5 h-3.5" />
                  }
                  Somme des poids : {weightTotal.toFixed(1)} {weightValid ? '— ✓ Correct' : '— ⚠ Doit être égale à 1.0'}
                </div>
                {settings.filter(s => s.key.startsWith('weight_')).map(s => renderParamCard(s, '0.1'))}

              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400">Les modifications sont appliquées au prochain cycle de l'IA.</p>
              </div>
            </div>
          )}

          {activeTab === 'periodes' && (
            <>
              <div className="tab-filter">
                <div className="filter-group">
                  {/* Search */}
                  <div className="date-filter-container w-64 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input type="text" placeholder="Rechercher une période..." value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)} className="select-date w-full pl-10" />
                    {searchFilter && (
                      <X className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 cursor-pointer hover:text-red-400"
                        onClick={() => setSearchFilter('')} />
                    )}
                  </div>
                  <div className="date-filter-container w-48 relative">
                    <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <select value={statutFilter} onChange={e => setStatutFilter(e.target.value)} className="select-date w-full pl-9">
                      <option value="">Statut : Tous</option>
                      {['Actif', 'À venir', 'Passé'].map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
                {canManageSettings && canManageSettings() && (
                  <button onClick={() => setIsAddModalOpen(true)} className="btn-add-intrant">
                    <Plus className="w-4 h-4" /> Ajouter une période
                  </button>
                )}
              </div>

              <div className="table-sec">
                <div className="table-header-grid grid-periods">
                  <p className="tab-header-title">Période</p>
                  <p className="tab-header-title">Dates</p>
                  <p className="tab-header-title text-center">Facteur</p>
                  <p className="tab-header-title text-center">Statut</p>
                  <p className="tab-header-title text-center">Actions</p>
                </div>

                <div className="scrollable-list">
                  {periodsFiltrees.map(periode => (
                    <div key={periode.id} className={`table-row grid-periods ${editingPeriodId === periode.id ? 'bg-indigo-50/30' : ''}`}>

                      {editingPeriodId === periode.id ? (
                        <>
                          <input type="text"
                            className="w-full px-3 py-1.5 bg-white border border-indigo-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-gray-800 text-sm"
                            value={editPeriodForm.name}
                            onChange={e => setEditPeriodForm({ ...editPeriodForm, name: e.target.value })} />

                          <div className="flex gap-2">
                            <input type="date"
                              className="w-full px-2 py-1 bg-white border border-indigo-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs text-gray-700"
                              value={editPeriodForm.start_date}
                              onChange={e => setEditPeriodForm({ ...editPeriodForm, start_date: e.target.value })} />
                            <input type="date"
                              className="w-full px-2 py-1 bg-white border border-indigo-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs text-gray-700"
                              value={editPeriodForm.end_date}
                              onChange={e => setEditPeriodForm({ ...editPeriodForm, end_date: e.target.value })} />
                          </div>

                          <div className="flex justify-center">
                            <input type="number" step="0.1"
                              className="w-20 px-2 py-1.5 bg-white border border-indigo-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-bold text-center"
                              value={editPeriodForm.factor}
                              onChange={e => setEditPeriodForm({ ...editPeriodForm, factor: e.target.value })} />
                          </div>

                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border opacity-70 ${getStatutBg(determinerStatut(editPeriodForm.start_date, editPeriodForm.end_date))}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${getStatutDot(determinerStatut(editPeriodForm.start_date, editPeriodForm.end_date))}`}></span>
                              {determinerStatut(editPeriodForm.start_date, editPeriodForm.end_date)}
                            </span>
                          </div>

                          <div className="flex justify-center gap-2">
                            <button onClick={handleSaveEditPeriod} className="text-green-600 hover:bg-green-100 p-1.5 rounded-lg transition-colors"><Check className="w-5 h-5" /></button>
                            <button onClick={() => setEditingPeriodId(null)} className="text-gray-400 hover:bg-gray-200 p-1.5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <p className="font-bold text-gray-800 text-sm">{periode.name}</p>
                          </div>

                          <p className="text-sm text-gray-500">{periode.datesAffichees}</p>

                          <div className="flex justify-center">
                            <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold border ${
                              periode.factor === 0
                                ? 'bg-red-50 text-red-700 border-red-100'
                                : periode.factor > 1
                                ? 'bg-orange-50 text-orange-700 border-orange-100'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                            }`}>
                              {periode.factor === 0 ? '🛑 Arrêt' : `×${periode.factor}`}
                            </span>
                          </div>

                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatutBg(periode.statut)}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${getStatutDot(periode.statut)}`}></span>
                              {periode.statut}
                            </span>
                          </div>

                          <div className="flex justify-center gap-1">
                            {canManageSettings && canManageSettings() && (
                              <>
                                <button
                                  onClick={() => { setEditingPeriodId(periode.id); setEditPeriodForm({ name: periode.name, start_date: periode.start_date, end_date: periode.end_date, factor: periode.factor }); }}
                                  className="text-gray-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setPeriodToDelete(periode)}
                                  className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {periodsFiltrees.length === 0 && (
                    <div className="text-center py-10 text-gray-500 italic">Aucune période trouvée...</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <FormulairePeriode
          onClose={() => setIsAddModalOpen(false)}
          onSaved={async () => {
            await loadData();
            setSuccessConfig({ title: 'Période ajoutée !', text: 'La période a été intégrée avec succès.' });
          }}
        />
      )}

      {periodToDelete && (
        <div className="modal-overlay">
          <div className="modal-container panel-container">
            <div className="cancel-icon-bg"><AlertCircle className="w-12 h-12 text-orange-500" /></div>
            <h3 className="panel-title">Supprimer cette période ?</h3>
            <p className="panel-text">Êtes-vous sûr de vouloir supprimer "{periodToDelete.name}" ? Cela impactera les prédictions de l'IA.</p>
            <div className="flex gap-4 w-full max-w-sm">
              <button onClick={() => setPeriodToDelete(null)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleConfirmDeletePeriod} className="btn-danger flex-1">Oui, supprimer</button>
            </div>
          </div>
        </div>
      )}

      {successConfig && (
        <div className="modal-overlay">
          <div className="modal-container panel-container">
            <div className="success-icon-bg"><CheckCircle2 className="w-12 h-12 text-[#76B379]" /></div>
            <h3 className="panel-title">{successConfig.title}</h3>
            <p className="panel-text">{successConfig.text}</p>
            <button onClick={() => setSuccessConfig(null)} className="btn-primary w-full max-w-xs">Continuer</button>
          </div>
        </div>
      )}
    </div>
  );
}