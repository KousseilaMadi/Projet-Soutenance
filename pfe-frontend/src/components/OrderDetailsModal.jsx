import React from "react";
import { X, FileText, Building2, Package } from "lucide-react";

import { formatDate, formatQuantity } from '../utils/format';
function CommandeDetailsModal({ isOpen, onClose, order, order_item}) {
  if (!isOpen || !order || !order_item) return null;

  const getStatusBadge = (status) => {
    const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "validated":    return <span className={`${base} bg-green-100 text-green-800`}>Validée</span>;
      case "pending": return <span className={`${base} bg-amber-100 text-amber-800`}>En attente</span>;
      case "draft":    return <span className={`${base} bg-red-100 text-red-800`}>Brouillon</span>;
      default:           return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[85vh] max-h-[600px]">

        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <p className="font-semibold text-gray-800 text-base">{order.id}</p>
            <p className="text-xs text-gray-400 mt-0.5">{order.supplier_name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto gap-4 p-5 space-y-2
                  scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">

          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Statut</span>
            {getStatusBadge(order.status)}
          </div>

          <Section icon={<FileText className="w-3.5 h-3.5" />} title="Commande">
            <Row label="N° order" value={order.id} mono />
            <Row label="Créé le"  value={order.created_at} />
            {(order.validated) && (
              <Row label="Validée le"  value={order.validated_at ?? '—'} />
            )
            }
            {order.validated_at && <Row label="Validé le" value={order.validated_at} />}
          </Section>

          <Section icon={<Building2 className="w-3.5 h-3.5" />} title="Fournisseur">
            <Row label="Nom"       value={order.supplier_name } />
            <Row label="Adresse"   value={order.supplier_address ?? "—"} />
            <Row label="Contact"   value={order.supplier_contact ?? "—"} />
            <Row label="Téléphone" value={order.supplier_phone ?? "—"} mono />
          </Section>

          <Section icon={<Package className="w-3.5 h-3.5" />} title="Intrant">
            <Row label="Nom"       value={order_item.product_name       ?? "—"} />
            <Row label="Référence" value={order_item.product_reference ?? "—"} />
            <Row label="Quantité"  value={formatQuantity(order_item.quantity)  != null ? `${order_item.quantity} ${order_item.unit}` : "—"} />
            <Row label="Unité"     value={order_item.unit     ?? "—"} />
          </Section>

        </div>

        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100">
          <button className="btn-primary w-full" onClick={onClose}>OK</button>
        </div>

      </div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
        <span className="text-gray-400">{icon}</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{title}</span>
      </div>
      <div className="divide-y divide-gray-50">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className={`text-gray-800 font-medium text-right max-w-[60%] ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default CommandeDetailsModal;