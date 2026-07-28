import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Stock from './pages/Stock';
import Alerts from './pages/Alerts';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Sidebar from './components/Sidebar';
import Header from "./components/Header";

const PAGES = {
    dashboard: Dashboard,
    products: Products,
    suppliers: Suppliers,
    stock: Stock,
    alerts: Alerts,
    orders: Orders,
    settings: Settings,
    users: Users,
};

function AppContent() {
    const { user, loading, logout, isAdmin } = useAuth();
    const [currentPage, setCurrentPage] = useState('dashboard');
 

    if (loading) return <div>Loading...</div>;
    if (!user) return <Login />;

    const PageComponent = PAGES[currentPage] || Dashboard;

  const titles = {
    dashboard: "Tableau de bord",
    alertes: "Alertes prédictives",
    stock: "Stock et mouvements",
    orders: "Gestion des commandes",
    products: "Catalogue Intrants",
    suppliers: "Liste des fournisseurs",
    settings: "Configuration Système",
    users: "Gestion des utilisateurs"
  };
    return (
        <div id="layout" className="flex h-screen bg-[#FCFCFC] font-sans">
           <Sidebar
            activeTab={currentPage}
            setActiveTab={setCurrentPage}
            onLogout={logout}
            isAdmin={isAdmin}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header 
                    title={titles[currentPage]}
                    user={user}
                 />
                <main id="app" className="flex-1 overflow-y-auto">
                    <PageComponent navigate={setCurrentPage} />
                </main>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}