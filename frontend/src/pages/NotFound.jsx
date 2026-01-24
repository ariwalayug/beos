import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
    return (
        <div className="not-found-page masterpiece">
            <div className="bg-animation">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="floating-cell"></div>
                ))}
            </div>

            <div className="not-found-content glass-card animate-pop-in">
                <div className="error-code">
                    <span>4</span>
                    <div className="blood-drop-wrapper">
                        <span className="blood-drop">🩸</span>
                        <div className="ripple"></div>
                    </div>
                    <span>4</span>
                </div>

                <h2>Page Not Found</h2>
                <p>
                    Oops! Looks like this vein has collapsed.
                    The page you're dealing with doesn't exist in our system.
                </p>

                <div className="action-buttons">
                    <Link to="/" className="btn btn-primary btn-lg">
                        <span className="btn-icon">🏠</span>
                        Return to Base
                    </Link>
                    <Link to="/emergency" className="btn btn-outline btn-lg">
                        <span className="btn-icon">🚨</span>
                        Report Emergency
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default NotFound;
