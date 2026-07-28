import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Bell, 
  Box, 
  ShoppingCart, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut,
  AlertCircle 
} from 'lucide-react';
import * as api from '../api';

import Logo from "../assets/logo.png"

function Sidebar({ activeTab, setActiveTab, onLogout, alertCount = 0, isAdmin }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);


     const [alerts, setAlerts] = useState([]);
      const [error, setError] = useState(null);
  
  
      useEffect(() => {
          loadAlerts();
          const interval = setInterval(loadAlerts, 2000);
          return () => clearInterval(interval);
      }, []);
  
      async function loadAlerts() {
          try {
              const data = await api.getAllAlerts();
              const filtered_data = data.filter(alert => alert.status === "active")
              setAlerts(filtered_data);
          } catch (e) {
              setError(e.toString());
          }
      }

  const menuSections = [
    {
      title: "PILOTAGE",
      items: [
        { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
        { id: "alerts", label: "Alertes prédictives", icon: Bell },
      ]
    },
    {
      title: "OPÉRATIONNEL",
      items: [
        { id: "stock", label: "Stock et mouvements", icon: Box },
        { id: "orders", label: "Commandes", icon: ShoppingCart },
      ]
    },
    {
      title: "RÉFÉRENTIEL",
      items: [
        { id: "products", label: "Catalogue intrants", icon: BookOpen },
        { id: "suppliers", label: "Fournisseurs", icon: Users },
      ]
    },
    {
      title: "ADMINISTRATION",
      items: [
        { id: "settings", label: "Configuration IA", icon: Settings },
        { id: "users", label: "Utilisateurs", icon: Users },
      ]
    }
  ];

  return (
    <>
      <aside className="hidden md:flex w-64 h-screen bg-white border-r border-gray-100 flex-col justify-between sticky top-0">
        
        <div className="p-6">
          <img src={Logo} alt="Logo" className="w-32 h-auto object-contain"/>
        </div>
        
        <nav className="flex-1 px-4 overflow-y-auto [scrollbar-gutter:stable] space-y-6">  
          {menuSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-gray-400 mb-3 px-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon; 
                  const isActive = activeTab === item.id;
                    return (
                      <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)} 
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                          isActive 
                          ? "bg-[#D9DDFF] text-blue-950 font-semibold" 
                          : "text-gray-600 hover:bg-gray-100" 
                          }`}
                          >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>

                        {item.id === "alerts" && alerts.length > 0 && (
                          <span className="flex items-center justify-center bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full shadow-sm animate-pulse">
                            {alerts.length}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>


        <div className="p-4 mb-4">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Se déconnecter</span>
          </button>
        </div>
      </aside>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="panel-container flex flex-col items-center justify-center p-8 h-full">
              <div className="cancel-icon-bg mb-4 flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-orange-500" />
              </div>
              <h3 className="panel-title text-center text-lg font-bold mb-2">
                Êtes-vous sûr de vouloir vous déconnecter ?
              </h3>
              <p className="panel-text text-center text-gray-500 mb-6">
                Vous devrez vous reconnecter pour accéder au tableau de bord.
              </p>
              <div className="flex gap-4 w-full max-w-sm">
                <button 
                  onClick={() => setShowLogoutModal(false)} 
                  className="btn-secondary flex-1 py-2"
                >
                  Annuler
                </button>
                <button 
                  onClick={onLogout} 
                  className="btn-danger flex-1 bg-red-500 text-white hover:bg-red-600 rounded-md py-2"
                >
                  Déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;