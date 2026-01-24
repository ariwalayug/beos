import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="not-found-page" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <h1 style={{
                fontSize: '6rem',
                fontWeight: '700',
                color: 'var(--primary, #dc3545)',
                marginBottom: '0.5rem',
                lineHeight: '1'
            }}>
                404
            </h1>
            <h2 style={{ marginBottom: '1rem' }}>Page Not Found</h2>
            <p style={{
                marginBottom: '1.5rem',
                color: 'var(--text-muted, #6c757d)',
                maxWidth: '400px'
            }}>
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/" className="btn btn-primary">
                Go to Home
            </Link>
        </div>
    );
}

export default NotFound;
