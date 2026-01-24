import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M50 10 C50 10, 20 45, 20 60 C20 77, 33 90, 50 90 C67 90, 80 77, 80 60 C80 45, 50 10, 50 10 Z" fill="url(#footerGradient)" />
                                <defs>
                                    <linearGradient id="footerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#DC2626" />
                                        <stop offset="100%" stopColor="#991B1B" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span>Blood Emergency Platform</span>
                        </div>
                        <p className="footer-description">
                            Connecting donors, hospitals, and blood banks to save lives through instant emergency response.
                        </p>
                    </div>

                    <div className="footer-links">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/donors">Find Donors</Link></li>
                            <li><Link to="/hospitals">Hospitals</Link></li>
                            <li><Link to="/blood-banks">Blood Banks</Link></li>
                            <li><Link to="/emergency">Emergency Requests</Link></li>
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
                            <li><Link to="/emergency">Create Request</Link></li>
                            <li><Link to="/register">Become a Donor</Link></li>
                            <li><a href="tel:102">Call 102</a></li>
                        </ul>
                        <div className="footer-emergency">
                            <span className="pulse"></span>
                            <span>24/7 Support Available</span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2024 Blood Emergency Platform. Built to save lives.</p>
                    <div className="footer-stats">
                        <span>🩸 Every drop counts</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
