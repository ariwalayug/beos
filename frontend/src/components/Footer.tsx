import { Link } from 'react-router-dom';
import { Droplet, Heart, Phone } from 'lucide-react';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer professional">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <Droplet fill="currentColor" size={24} className="text-primary" />
                            <span>BEOS Response Network</span>
                        </div>
                        <p className="footer-description">
                            Connecting donors, hospitals, and blood banks to save lives through instant emergency response.
                        </p>
                    </div>

                    <div className="footer-links">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/donors">Find Donors</Link></li>
                            <li><Link to="/hospitals">Partner Hospitals</Link></li>
                            <li><Link to="/blood-banks">Blood Inventory</Link></li>
                            <li><Link to="/emergency">Live Emergencies</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4>Blood Types</h4>
                        <ul>
                            <li><Link to="/donors?blood_type=O-">O- Universal Donor</Link></li>
                            <li><Link to="/donors?blood_type=O+">O+ Most Common</Link></li>
                            <li><Link to="/donors?blood_type=AB+">AB+ Universal Recipient</Link></li>
                            <li><Link to="/donors?blood_type=A+">A+ Second Most Common</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4>Emergency</h4>
                        <ul>
                            <li><Link to="/emergency">Broadcast Alert</Link></li>
                            <li><Link to="/register">Register to Respond</Link></li>
                            <li><a href="tel:102" className="flex items-center gap-2"><Phone size={14} /> Call 102</a></li>
                        </ul>
                        <div className="footer-emergency">
                            <span className="pulse-dot-mini"></span>
                            <span>System Operational</span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2024 Blood Emergency Platform. Secure Network.</p>
                    <div className="footer-stats">
                        <Heart size={14} fill="currentColor" className="text-primary" />
                        <span>Saving Lives Daily</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
