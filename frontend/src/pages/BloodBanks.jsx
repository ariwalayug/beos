import { useState, useEffect } from 'react';
import { getBloodBanks } from '../services/api';
import { Archive, MapPin, Phone, LayoutGrid, List, Activity, AlertCircle } from 'lucide-react';
import PageTransition from '../components/animations/PageTransition';
import FadeIn from '../components/animations/FadeIn';
import { motion } from 'framer-motion';
import './BloodBanks.css';

function BloodBanks() {
    const [bloodBanks, setBloodBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        fetchBloodBanks();
    }, []);

    const fetchBloodBanks = async () => {
        try {
            setLoading(true);
            const response = await getBloodBanks({ inventory: 'true' });
            setBloodBanks(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getInventoryStatus = (units) => {
        if (units <= 5) return { label: 'Critical', class: 'critical' };
        if (units <= 15) return { label: 'Low', class: 'low' };
        return { label: 'Good', class: 'good' };
    };

    return (
        <PageTransition className="bloodbanks-page professional">
            <div className="container section">
                <FadeIn className="page-header-pro">
                    <div className="header-badge">
                        <Archive size={16} />
                        <span>Inventory Logistics</span>
                    </div>
                    <h1>Blood Network Supply</h1>
                    <p>Real-time inventory levels across the entire donation network.</p>
                </FadeIn>

                <div className="controls-bar-pro">
                    <div className="live-indicator">
                        <span className="pulse-dot-mini"></span>
                        Live Updates
                    </div>
                    <div className="view-toggle-pro">
                        <button
                            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid size={16} /> Heatmap
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={16} /> List
                        </button>
                    </div>
                </div>

                <div className="results-container">
                    {loading ? (
                        <div className="loading-grid">
                            {[1, 2, 3].map(i => <div key={i} className="skeleton-card-pro h-64"></div>)}
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <AlertCircle size={32} />
                            <h3>Unable to load inventory data</h3>
                            <button onClick={fetchBloodBanks} className="btn-retry">Retry</button>
                        </div>
                    ) : bloodBanks.length === 0 ? (
                        <div className="empty-state-pro">
                            <Archive size={48} className="text-muted" />
                            <h3>No blood banks found</h3>
                        </div>
                    ) : (
                        <div className={`bloodbanks-grid-pro ${viewMode}`}>
                            {bloodBanks.map((bank, i) => (
                                <motion.div
                                    key={bank.id}
                                    className="bloodbank-card-pro"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                >
                                    <div className="bank-header">
                                        <div className="bank-icon-box">
                                            <Archive size={20} />
                                        </div>
                                        <div className="bank-info-main">
                                            <h3>{bank.name}</h3>
                                            <div className="bank-meta">
                                                <span className="meta-item"><MapPin size={14} /> {bank.city}</span>
                                                <span className="meta-item"><Activity size={14} /> Updated 2m ago</span>
                                            </div>
                                        </div>
                                        <a href={`tel:${bank.phone}`} className="btn-icon">
                                            <Phone size={18} />
                                        </a>
                                    </div>

                                    <div className="inventory-heatmap-pro">
                                        {bank.inventory && bank.inventory.map(item => {
                                            const status = getInventoryStatus(item.units);
                                            return (
                                                <div
                                                    key={item.blood_type}
                                                    className={`heatmap-cell-pro ${status.class}`}
                                                >
                                                    <span className="cell-type">{item.blood_type}</span>
                                                    <span className="cell-units">{item.units}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}

export default BloodBanks;
