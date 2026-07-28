import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import { formatDate, formatQuantity } from '../utils/format';
import {
    ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine
} from 'recharts';

export default function Dashboard({ navigate }) {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [storage, setStorage] = useState([]);
    const [history, setHistory] = useState([]);
    const [products, setProducts] = useState([]);
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [timeRange, setTimeRange] = useState('7j');
    const [selectedProductId, setSelectedProductId] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            setLoading(true);
            const [alertsData, ordersData, storageData, historyData, productsData, settingsData] = await Promise.all([
                api.getAllAlerts(),
                api.getAllOrders(),
                api.getAllStorage(),
                api.getAllHistory(),
                api.getAllProducts(),
                api.getAllSettings(),
            ]);
            setAlerts(alertsData);
            setOrders(ordersData);
            setStorage(storageData);
            setHistory(historyData);
            setProducts(productsData);
            setSettings(settingsData);
            if (productsData.length > 0) {
                setSelectedProductId(productsData[0].id);
            }
        } catch (e) {
            setError(e.toString());
        } finally {
            setLoading(false);
        }
    }

    const activeAlerts = alerts.filter(a => a.status === 'active');
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const lowStockProducts = storage.filter(s => s.quantity <= s.alert_threshold);
    const recentMovements = history.slice(0, 6);

    const alertsByType = {
        low_stock: activeAlerts.filter(a => a.alert_type === 'low_stock').length,
        forecast: activeAlerts.filter(a => a.alert_type === 'forecast').length,
        anomaly: activeAlerts.filter(a => a.alert_type === 'anomaly').length,
        capacity: activeAlerts.filter(a => a.alert_type === 'capacity').length,
    };

    const criticalCount = activeAlerts.filter(a =>
        a.alert_type === 'low_stock' || a.alert_type === 'capacity'
    ).length;

    const warningCount = activeAlerts.filter(a =>
        a.alert_type === 'forecast' || a.alert_type === 'anomaly'
    ).length;

    const globalCoverage = storage.length > 0
        ? Math.round((storage.filter(s => s.quantity > s.alert_threshold).length / storage.length) * 100)
        : 0;

    const dataPoints = parseInt(
        settings.find(s => s.key === 'agent2_min_data_points')?.value ?? 10
    );

    const chartData = useMemo(() => {
    if (!selectedProductId) return [];

    const productHistory = history
        .filter(h => h.product_id === selectedProductId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const days = timeRange === '7j' ? 7 : timeRange === '14j' ? 14 : 30;
    const now = new Date();
    const points = [];

    const storageEntry = storage.find(s => s.product_id === selectedProductId);
    const currentQty = storageEntry ? storageEntry.quantity : 0;

    // Walk backwards from today to reconstruct stock level per day
    let runningQty = currentQty;
    const dailyStocks = {};
    dailyStocks[new Date().toDateString()] = currentQty;

    for (let i = 1; i <= days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.toDateString();

        const dayMovements = productHistory.filter(h =>
            new Date(h.created_at).toDateString() === key
        );
        for (const m of dayMovements) {
            if (m.movement_type === 'exit')  runningQty += m.quantity;
            if (m.movement_type === 'entry') runningQty -= m.quantity;
        }
        dailyStocks[key] = Math.max(0, runningQty);
    }

    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        const key = date.toDateString();

        points.push({
            date: dateStr,
            actuel: dailyStocks[key] ?? null,
            exit: null,
            predictif: i === 0 ? (dailyStocks[key] ?? null) : null,  // bridge point
            marge: i === 0 ? [dailyStocks[key] ?? 0, dailyStocks[key] ?? 0] : null,
        });
    }

    const exits = productHistory.slice(-dataPoints).map(h => h.quantity);
    if (exits.length >= 3) {
        const n = exits.length;
        const x = exits.map((_, i) => i);
        const xMean = x.reduce((a, b) => a + b, 0) / n;
        const yMean = exits.reduce((a, b) => a + b, 0) / n;
        const slope = x.reduce((sum, xi, i) => sum + (xi - xMean) * (exits[i] - yMean), 0) /
            x.reduce((sum, xi) => sum + (xi - xMean) ** 2, 0);
        const intercept = yMean - slope * xMean;
        const dailyConsumption = Math.max(0, slope * n + intercept);

        let forecastQty = currentQty;
        const forecastDays = timeRange === '7j' ? 7 : timeRange === '14j' ? 14 : 30;
        for (let i = 1; i <= forecastDays; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() + i);
            const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
            const predicted = Math.max(0, forecastQty - dailyConsumption * i);
            const margin = dailyConsumption * i * 0.15;

            points.push({
                date: dateStr,
                actuel: null,
                predictif: predicted,
                marge: [Math.max(0, predicted - margin), predicted + margin],
            });
        }
    }

    return points;
}, [selectedProductId, timeRange, history, storage]);

    const selectedStorage = storage.find(s => s.product_id === selectedProductId);
    const alertThreshold = selectedStorage ? selectedStorage.alert_threshold : 0;
    const optimalThreshold = alertThreshold * 3;

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="dash-wrapper">

            <div className="dash-header">
                <h1 className="dash-title">Bonjour {user.username},</h1>
                <p className="dash-subtitle">Voici l'état de vos stocks d'intrants et les prévisions de l'IA pour aujourd'hui.</p>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card kpi-red" onClick={() => navigate('alerts')} style={{ cursor: 'pointer' }}>
                    <h3 className="kpi-label">Alertes Actives</h3>
                    <p className="kpi-value">{activeAlerts.length}</p>
                    <div className="kpi-details">
                        {criticalCount > 0 && <span className="kpi-detail-item"><span className="dot dot-red"></span> {criticalCount} critique{criticalCount > 1 ? 's' : ''}</span>}
                        {warningCount > 0 && <span className="kpi-detail-item"><span className="dot dot-orange"></span> {warningCount} avertissement{warningCount > 1 ? 's' : ''}</span>}
                        {activeAlerts.length === 0 && <span className="kpi-detail-item">Aucune alerte</span>}
                    </div>
                </div>

                <div className="kpi-card kpi-yellow" onClick={() => navigate('stock')} style={{ cursor: 'pointer' }}>
                    <h3 className="kpi-label">Intrants sous le seuil</h3>
                    <p className="kpi-value text-gray-800">{lowStockProducts.length}</p>
                    <div className="kpi-trend">
                        <span className="trend-down">▼</span> sur {storage.length} produits
                    </div>
                </div>

                <div className="kpi-card kpi-indigo" onClick={() => navigate('orders')} style={{ cursor: 'pointer' }}>
                    <h3 className="kpi-label">Commandes en attente</h3>
                    <p className="kpi-value text-gray-800">{pendingOrders.length}</p>
                    <div className="kpi-details">
                        <span className="kpi-detail-item">
                            <span className="dot dot-green"></span>
                            {orders.filter(o => o.status === 'validated').length} validées
                        </span>
                        <span className="kpi-detail-item">
                            <span className="dot dot-yellow"></span>
                            {pendingOrders.length} en attente
                        </span>
                    </div>
                </div>

                <div className="kpi-card kpi-green">
                    <h3 className="kpi-label">Couverture Stock Globale</h3>
                    <p className="kpi-value text-green-600">{globalCoverage}%</p>
                    <p className="kpi-desc">Calculé sur les {storage.length} intrants référencés</p>
                </div>
            </div>

            {/* Chart */}
            <div className="dash-panel">
                <div className="panel-header">
                    <h2 className="panel-title">Prévision de consommation</h2>

                    <div className="panel-filters">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="dash-select"
                        >
                            <option value="7j">7 jours</option>
                            <option value="14j">14 jours</option>
                            <option value="30j">1 mois</option>
                        </select>

                        <select
                            value={selectedProductId || ''}
                            onChange={(e) => setSelectedProductId(parseInt(e.target.value))}
                            className="dash-select"
                        >
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="chart-legend">
                    <span className="legend-item"><span className="legend-box bg-green-100"></span> Zone optimale</span>
                    <span className="legend-item"><span className="legend-box bg-red-100"></span> Zone critique</span>
                    <span className="legend-item"><span className="legend-line bg-gray-400"></span> Actuel</span>
                    <span className="legend-item"><span className="legend-line border-dashed border-indigo-600"></span> Prédiction</span>
                </div>

                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <Tooltip cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />

                            <ReferenceArea y1={optimalThreshold} y2={optimalThreshold * 1.5} fill="#E6FFED" fillOpacity={0.4} />
                            <ReferenceArea y1={0} y2={alertThreshold} fill="#FFEFEF" fillOpacity={0.5} />

                            <ReferenceLine y={optimalThreshold} stroke="#22c55e" strokeDasharray="3 3"
                                label={{ position: 'right', value: 'Optimal', fill: '#22c55e', fontSize: 10 }} />
                            <ReferenceLine y={alertThreshold} stroke="#ef4444" strokeWidth={2}
                                label={{ position: 'right', value: 'Critique', fill: '#ef4444', fontSize: 10 }} />

                            <Area type="monotone" dataKey="marge" fill="#e0e7ff" stroke="none" fillOpacity={0.6} />
                            <Line type="monotone" dataKey="actuel" stroke="#6b7280" strokeWidth={3}
                                dot={{ r: 4, fill: '#6b7280', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6 }} connectNulls={false} />
                            <Line type="monotone" dataKey="predictif" stroke="#6366f1" strokeWidth={3}
                                strokeDasharray="5 5"
                                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                connectNulls={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="tables-grid">

                {/* Low stock table */}
                <div className="dash-panel">
                    <h2 className="panel-title mb-4">Intrants sous le seuil critique</h2>
                    <div className="table-wrapper">
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th className="text-left">Produit</th>
                                    <th className="text-center">Stock actuel</th>
                                    <th className="text-center">Seuil Min</th>
                                    <th className="text-right">Unités</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockProducts.length === 0 ? (
                                    <tr><td colSpan={4} style={{ textAlign: 'center' }}>Aucun produit sous le seuil</td></tr>
                                ) : lowStockProducts.map(s => (
                                    <tr key={s.product_id}>
                                        <td className="font-medium text-gray-700">{s.product_name}</td>
                                        <td className="text-center text-red-600 font-bold">{formatQuantity(s.quantity)}</td>
                                        <td className="text-center text-gray-600">{formatQuantity(s.alert_threshold)}</td>
                                        <td className="text-right text-gray-500 font-medium">{s.unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent movements table */}
                <div className="dash-panel">
                    <h2 className="panel-title mb-4">Derniers mouvements de stock</h2>
                    <div className="table-wrapper">
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th className="text-left">Date & Heure</th>
                                    <th className="text-left">Produit</th>
                                    <th className="text-center">Mvt</th>
                                    <th className="text-right">Qté</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentMovements.map(m => (
                                    <tr key={m.id}>
                                        <td className="text-xs text-gray-500">{formatDate(m.created_at)}</td>
                                        <td className="text-gray-700">{m.product_name}</td>
                                        <td className="text-center">
                                            <span className={`badge-mvt ${m.movement_type === 'entry' ? 'badge-mvt-in' : 'badge-mvt-out'}`}>
                                                {m.movement_type === 'entry' ? 'Entrée' : 'Sortie'}
                                            </span>
                                        </td>
                                        <td className="text-right font-medium text-gray-700">
                                            {m.movement_type === 'entry' ? '+' : '-'}{formatQuantity(m.quantity)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}