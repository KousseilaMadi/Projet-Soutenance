import { useState, useEffect } from 'react';
import { ChevronDown, Search, X, Calendar, ToggleLeft } from 'lucide-react';
import CommandeDetailsModal from '../components/OrderDetailsModal';
import '../App.css';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import { formatDate, formatQuantity } from '../utils/format';

function Orders() {
  const [supplierSearch, setSupplierSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const { canValidateOrders } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItem, setOrderItem] = useState(null);

  
      useEffect(() => {
          loadOrders();
      }, []);

      useEffect(() => {
          handleSearch();
      }, [supplierSearch, statusFilter]);
  
      async function loadOrders() {
          try {
              setLoading(true);
              const data = await api.searchOrders(null, null);
              setOrders(data);

          } catch (e) {
              setError(e.toString());
          } finally {
              setLoading(false);
          }
      }
  
      async function handleSearch() {
          try {
              const data = await api.searchOrders(
                  supplierSearch || null,
                  statusFilter || null,
              );
              setOrders(data);
          } catch (e) {
              console.error(e);
          }
      }
  
      async function openOrderDetail(order) {
        setSelectedOrder(order);
        try {
          const items = await api.getOrderItems(order.id);
          setIsDetailModalOpen(true);
          setOrderItem(items[0]);
        } catch (e) {
          console.error(e);
        }
      }
  
      function finishAction() {
          setSelectedOrder(null);
          setOrderItem(null);
      }
  
      async function handleValidate(orderId) {
          try {
              await api.validateOrder(orderId);
              finishAction();
              loadOrders();
          } catch (e) {
              alert('Error: ' + e);
          }
      }
  
      async function handleReject(orderId) {
          try {
              await api.rejectOrder(orderId);
              finishAction();
              loadOrders();
          } catch (e) {
              alert('Error: ' + e);
          }
      }
  
      if (loading) return <div>Loading orders...</div>;
      if (error) return <div>Error: {error}</div>;

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex justify-center items-center w-28 px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'validated':
        return <span className={`${baseClasses} bg-green-100 text-green-700`}>Validée</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-orange-100 text-orange-700`}>En attente</span>;
      case 'draft':
        return <span className={`${baseClasses} bg-red-100 text-red-700`}>Brouillon</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>{status}</span>;
    }
  };

  return (
    <div className="catalog-container relative0">
      <div className="flex justify-start gap-2 mb-6">
        <div className="date-filter-container relative w-56 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="select-date w-full pl-10 pr-8"
            value={supplierSearch}
            onChange={(e) => { setSupplierSearch(e.target.value);}}
          />
          {supplierSearch && (
            <X
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 cursor-pointer hover:text-red-400 transition-colors"
              onClick={() => setSupplierSearch('')}
            />
          )}
        </div>

        <div className="date-filter-container relative w-44">
          <ToggleLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <select
            className="select-date w-full truncate pl-4 appearance-none"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value);}}
          >
            <option value="">Statut : Tous</option>
            <option value="draft">Brouillon</option>
            <option value="pending">En attente</option>
            <option value="validated">Validée</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none bg-white pl-1" />
        </div>

        {(statusFilter) && (
          <button
            onClick={() => {setSupplierSearch(""); setStatusFilter("");}}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors ml-2"
          >
            <X className="w-4 h-4" />
            Réinitialiser
          </button>
        )}
      </div>
<div className="table-sec mt-8">
  <div className="table-header-grid-v2">  {/* ← not -orders */}
    <p className="tab-header-title">N° Commande</p>
    <p className="tab-header-title">Fournisseur</p>
    <p className="tab-header-title">Statut</p>
    <p className="tab-header-title">Date d'émission</p>
    <p className="tab-header-title">Date de validation</p>
    <p className="tab-header-title text-center">Actions</p>
  </div>

  <div className="table-scroll-area">
    {orders.map((cmd, index) => (
      <div
        key={index}
        className={`table-row-grid ${index % 2 === 0 ? 'row-even' : 'row-odd'} cursor-pointer`}
        onClick={() => openOrderDetail(cmd)}
      >
        <p className="text-sm text-gray-800 font-bold">#{cmd.id}</p>
        <p className="text-sm text-gray-600">{cmd.supplier_name}</p>
        <div>{getStatusBadge(cmd.status)}</div>
        <p className="text-sm text-gray-600">{formatDate(cmd.created_at)}</p>
        <p className="text-sm text-gray-600">{cmd.validated_at ? formatDate(cmd.validated_at) : '—'}</p>
        <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
          {canValidateOrders() && cmd.status === 'pending' && (
            <>
              <button className="cmd-rejeter" onClick={() => handleReject(cmd.id)}>Rejeter</button>
              <button className="cmd-valider" onClick={() => handleValidate(cmd.id)}>Valider</button>
            </>
          )}
        </div>
      </div>
    ))}

    {orders.length === 0 && (
      <div className="table-empty-state">
        Aucune commande trouvée...
      </div>
    )}
  </div>
</div>

      <CommandeDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={selectedOrder}
        order_item={orderItem}
      />
    </div>
  );
}

export default Orders;