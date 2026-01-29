import { Link } from 'react-router-dom';
import { Home, AlertTriangle, Droplet } from 'lucide-react';
import PageTransition from '../components/animations/PageTransition';
import { motion } from 'framer-motion';
import './NotFound.css';

function NotFound() {
    return (
        <PageTransition className="not-found-page professional">
            <div className="bg-grid"></div>

            <div className="not-found-content-pro">
                <motion.div
                    className="error-code-pro"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                >
                    <span>4</span>
                    <motion.div
                        className="icon-wrapper"
                        animate={{ y: [0, -20, 0] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                    >
                        <Droplet size={64} className="error-icon" />
                    </motion.div>
                    <span>4</span>
                </motion.div>

                <h2>Connection Lost</h2>
                <p>
                    The page you are looking for is not part of the active network.
                    Please return to the dashboard.
                </p>

                <div className="action-buttons">
                    <Link to="/" className="btn btn-primary btn-lg">
                        <Home size={20} /> Return to Base
                    </Link>
                    <Link to="/emergency" className="btn btn-secondary btn-lg">
                        <AlertTriangle size={20} /> Report Issue
                    </Link>
                </div>
            </div>
        </PageTransition>
    );
}

export default NotFound;
