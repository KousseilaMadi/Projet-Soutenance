import { ChevronDown, Box, LayoutGrid, Plus, Search, Calendar, User, Tag, X, ArrowLeftRight } from 'lucide-react';
import DeclarationMouvement from '../components/DeclarationMouvements';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import { formatDate, formatQuantity } from '../utils/format';

const calculerPourcentage = (quantite, capacite) => {
  if (!capacite || capacite === 0) return 0;
  return Math.round((quantite / capacite) * 100);
};

const getStatutDetails = (quantite, capacite, seuilAlerte) => {
  const pourcentage = calculerPourcentage(quantite, capacite);
  if (quantite <= seuilAlerte) {
    return { label: "Critique", badgeClass: "bg-[#FCE8E8] text-[#D93025]", progressClass: "bg-red-500" };
  } else if (pourcentage <= 50 || quantite <= seuilAlerte * 1.5) {
    return { label: "Bas", badgeClass: "bg-[#FFF4E5] text-[#B76E00]", progressClass: "bg-orange-300" };
  } else {
    return { label: "Optimal", badgeClass: "bg-[#E6F4EA] text-[#288140]", progressClass: "bg-green-500" };
  }
};

const translateOperation = (op) => {
  if (op === "entry")
    return "Entrée"
  if (op === "exit")
    return "Sortie"
  
}

function Stock() {
  const [activeTab, setActiveTab] = useState('stocks');
  const [isModalOpen, setIsModalOpen] = useState(false);

    const { canManageStock } = useAuth();

    const [storage, setStorage] = useState([]);
    const [history, setHistory] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [historyFilters, setHistoryFilters] = useState({
        productQuery: '', movementType: '', startDate: '', endDate: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            const [storageData, historyData, productsData] = await Promise.all([
                api.getAllStorage(),
                api.getAllHistory(),
                api.getAllProducts(),
            ]);
            setStorage(storageData);
            setHistory(historyData);
            setProducts(productsData);
        } catch (e) {
            setError(e.toString());
        } finally {
            setLoading(false);
        }
    }

    async function handleStorageSearch(e) {
        const q = e.target.value;
        try {
            if (q.trim() === '') {
                setStorage(await api.getAllStorage());
            } else {
                setStorage(await api.searchStorage(q.trim()));
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function handleHistorySearch(filters = historyFilters) {
        try {
            const data = await api.searchHistory(
                filters.productQuery.trim() || null,
                filters.movementType || null,
                filters.startDate || null,
                filters.endDate || null,
            );
            setHistory(data);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleMovementSubmit(movement) {
        try {
            await api.recordMovement(
                parseInt(movement.productId),
                movement.movementType,
                parseFloat(movement.quantity),
                movement.note || null,
            );
            setIsModalOpen(false);
            loadData();
        } catch (e) {
            alert('Error: ' + e);
        }
    }

    if (loading) return <div>Loading stock...</div>;
    if (error) return <div>Error: {error}</div>;

  return (
    <div className="catalog-container">
      <div className="table-container">
        <div className="onglets">
          <button onClick={() => { setActiveTab('stocks'); handleStorageSearch({ target: { value: historyFilters.productQuery } });}} className={activeTab === 'stocks' ? 'selected-tab' : 'unselected-tab'}>Stocks Actuels</button>

          <button onClick={() => { setActiveTab('mouvements'); handleHistorySearch();}} className={activeTab === 'mouvements' ? 'selected-tab' : 'unselected-tab'}>Historique des mouvements</button>
        </div>

        <div className="table">
          <div className="tab-filter flex flex-wrap gap-4 items-center">
            
        
            <div className="date-filter-container w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />

              <input 
              type="text" 
              placeholder="Rechercher..." 
              className="select-date w-full pl-10" 
              value={historyFilters.productQuery} 
              onChange={(e) => { 
                const updated = { ...historyFilters, productQuery: e.target.value};
                setHistoryFilters(updated); 
                if ( activeTab === "stocks")
                  handleStorageSearch(e);
                else
                  handleHistorySearch(updated);
              }}
              />
            </div>

            
            {activeTab === 'stocks' && (
              <div className="flex gap-3">
              <div className="flex gap-4 items-center flex-wrap">
</div>
              </div>
              
            )}

        
            {activeTab === 'mouvements' && (
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex gap-4 items-center flex-wrap">
  

  <div className="date-filter-container relative w-44">
    <ArrowLeftRight className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />

    <select 
    className="select-date pl-10 w-full" 
    value={historyFilters.movementType} 
    onChange={(e) => { 
      const updated = { ...historyFilters, movementType: e.target.value };
      setHistoryFilters(updated); 
      handleHistorySearch(updated);
      }}>
      <option value="">Opération : Toutes</option>

      <option value="entry">Entrées (+)</option>

      <option value="exit">Sorties (-)</option>
    </select>

    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none bg-white pl-1" />
            
  </div>

  <div className="date-filter-container relative w-48 overflow-hidden">
    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />

    <input 
      type="date" 
      className="select-date w-full pl-10 pr-8 bg-transparent cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
      value={historyFilters.startDate} 
      onChange={(e) => { 
        const updated = { ...historyFilters, startDate: e.target.value };
        setHistoryFilters(updated); 
        handleHistorySearch(updated);
      }} 
    />

    {historyFilters.startDate && (
      <button 
        onClick={() => setHistoryFilters({ ...historyFilters, startDate: '' })} 
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 z-10"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
  <div className="date-filter-container relative w-48 overflow-hidden">
    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />

    <input 
      type="date" 
      className="select-date w-full pl-10 pr-8 bg-transparent cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
      value={historyFilters.endDate} 
      onChange={(e) => { 
        const updated = { ...historyFilters, endDate: e.target.value };
        setHistoryFilters(updated); 
        handleHistorySearch(updated);
      }} 
    />

    {historyFilters.endDate && (
      <button 
        onClick={() => setHistoryFilters({ ...historyFilters, endDate: '' })} 
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 z-10"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    )}
  </div>


  {(historyFilters.startDate || historyFilters.endDate || historyFilters.movementType) && (
    <button 
      onClick={() => {
        const updated = { ...historyFilters, startDate: '', endDate: '', movementType: ''};
        setHistoryFilters(updated);
        handleHistorySearch(updated);  
      }}
      className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors ml-2"
    >
      <X className="w-4 h-4" />
      Réinitialiser
    </button>
  )}
</div>
              </div>
            )}

            {canManageStock() && (
              <button onClick={() => setIsModalOpen(true)} className="ml-auto btn-add-intrant"><Plus className="w-4 h-4" /> Déclarer mouvement</button>
            )}
            
          </div>

          <div className="table-sec">
            {activeTab === 'stocks' ? (
              <>
             <div className="table-header-grid grid-stocks-actuels">
              <p className="tab-header-title">Référence</p>

              <p className="tab-header-title text-center">Intrant</p>

              <p className="tab-header-title text-center">Catégorie</p>

              <p className="tab-header-title text-center">Unitée</p>

              <p className="tab-header-title text-center">Stock & Capacité</p>

              <p className="tab-header-title text-center">Seuil</p>

              <p className="tab-header-title text-center">Statut</p>

              <p className="tab-header-title text-right">dérniere màj</p>
            </div>

                {storage.map((item, index) => {
                  const pourcentage = calculerPourcentage(item.quantity, item.max_capacity);
                  const statut = getStatutDetails(item.quantity, item.max_capacity, item.alert_threshold);
                  return (
                    <div key={index} className="table-row grid-stocks-actuels">
                      <p className="table-cell-text font-bold text-gray-800">{item.product_reference}</p>
                      <p className="table-cell-text font-bold text-gray-800 text-center">{item.product_name}</p>

                      <p className="table-cell-text text-gray-500 text-center">{item.category}</p>

                      <p className="table-cell-text text-gray-500 text-center">{item.unit}</p>

                      <div className="stock-capacite-cell">
                        <p className="table-cell-text w-16 text-left font-medium">{item.quantity}/

{item.max_capacity}</p>

                        <div className="progress-wrapper">
                          <span className="progress-label">{pourcentage}%</span>

                          <div className="progress-track"><div className={`progress-fill ${statut.progressClass}`} style={{ width: `${pourcentage}%` }}></div></div>
                        </div>
                      </div>

                      <p className="table-cell-text text-center">{item.alert_threshold}</p>

                      <div className="flex justify-center"><span className={`status-pill ${statut.badgeClass}`}>{statut.label}</span></div>
                    
                    <p className="table-cell-text text-gray-500 text-right">{new Date(item.updated_at).toLocaleDateString('fr-FR')} | {new Date(item.updated_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                    
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                <div className="table-header-grid grid-mouvements">
                  <p className="tab-header-title">Référence</p>

                  <p className="tab-header-title text-center">Intrant</p>

                  <p className="tab-header-title text-center">Opération</p>

                  <p className="tab-header-title text-center">Quantité</p>

                  <p className="tab-header-title text-center">Note</p>

                  <p className="tab-header-title text-center">Opérateur</p>

                  <p className="tab-header-title text-right">Date & Heure</p>
                </div>

                {history.map((mvt) => (
                  <div key={mvt.id} className="table-row grid-mouvements">
                    <p className="table-cell-text font-bold text-gray-800">{mvt.product_reference}</p>
                    

                    <p className="table-cell-text font-bold text-gray-800 text-center">{mvt.product_name}</p>

                    <div className='text-center' ><span className={`px-3 py-1 rounded-full text-xs text-center font-bold ${mvt.movement_type === 'entry' ? 'bg-[#E6F4EA] text-[#288140]' : 'bg-[#FCE8E8] text-[#D93025]'}`}>{translateOperation(mvt.movement_type)}</span></div>

                    <p className={`table-cell-text  font-black text-center ${mvt.movement_tpe === 'entry' ? 'text-green-600' : 'text-red-600'}`}>{mvt.movement_type === 'entry' ? '+' : '-'}{mvt.quantity}</p>

                    <p className="table-cell-text font-bold text-gray-800 text-center">{mvt.note ?? '—'}</p>

                    <p className="table-cell-text text-indigo-600 font-medium text-center">{mvt.username}</p>

                    <p className="table-cell-text text-gray-500 text-right">{new Date(mvt.created_at).toLocaleDateString('fr-FR')} | {new Date(mvt.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && <DeclarationMouvement onClose={() => setIsModalOpen(false)} onAdd={handleMovementSubmit} produits={products} />}
    </div>
  );
}

export default Stock;