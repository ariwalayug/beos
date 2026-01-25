import { useEffect, useRef } from 'react';

const DigitalArteryBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let animationFrameId;

        // Cell Class
        class Cell {
            constructor() {
                this.init();
            }

            init() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.radius = Math.random() * 20 + 5; // Size variation
                this.speedX = Math.random() * 0.5 + 0.1; // Horizontal drift (flow)
                this.speedY = (Math.random() - 0.5) * 0.5; // Slight vertical wobble
                this.opacity = Math.random() * 0.3 + 0.1;
                this.pulseSpeed = 0.02;
                this.color = `rgba(220, 38, 38, ${this.opacity})`; // Blood Red
            }

            update() {
                // Move cell
                this.x += this.speedX;
                this.y += this.speedY;

                // Pulsing effect
                if (this.opacity > 0.4 || this.opacity < 0.1) this.pulseSpeed = -this.pulseSpeed;
                this.opacity += this.pulseSpeed * 0.1; // Slower pulse
                this.radius += this.pulseSpeed * 2; // Subtle breathing size

                // Wrap around screen
                if (this.x - this.radius > width) this.x = -this.radius;
                if (this.x + this.radius < 0) this.x = width + this.radius;
                if (this.y - this.radius > height) this.y = -this.radius;
                if (this.y + this.radius < 0) this.y = height + this.radius;
            }

            draw() {
                ctx.beginPath();
                // Create glowing gradient for each cell
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.radius
                );

                // Core
                gradient.addColorStop(0, `rgba(239, 68, 68, ${this.opacity + 0.2})`);
                // Outer glow
                gradient.addColorStop(0.6, `rgba(220, 38, 38, ${this.opacity * 0.5})`);
                // Fade out
                gradient.addColorStop(1, 'rgba(220, 38, 38, 0)');

                ctx.fillStyle = gradient;
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Create Cell Array
        const cells = [];
        const cellCount = Math.floor(width * 0.04); // Density based on screen width

        for (let i = 0; i < cellCount; i++) {
            cells.push(new Cell());
        }

        // Connecting Lines (The "Grid" or "Network" look)
        const connectCells = () => {
            for (let a = 0; a < cells.length; a++) {
                for (let b = a; b < cells.length; b++) {
                    const dx = cells[a].x - cells[b].x;
                    const dy = cells[a].y - cells[b].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(220, 38, 38, ${0.1 - distance / 1500})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(cells[a].x, cells[a].y);
                        // Curved line for organic feel
                        ctx.lineTo(cells[b].x, cells[b].y);
                        ctx.stroke();
                        ctx.closePath();
                    }
                }
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Dark Gradient Background (can be removed if handled by CSS)
            // But good to have a base just in case
            // const bgGradient = ctx.createLinearGradient(0, 0, width, height);
            // bgGradient.addColorStop(0, '#09090b');
            // bgGradient.addColorStop(1, '#18181b');
            // ctx.fillStyle = bgGradient;
            // ctx.fillRect(0, 0, width, height);

            connectCells();

            cells.forEach(cell => {
                cell.update();
                cell.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            zIndex: 0,
            // background: 'radial-gradient(circle at center, #1a0505 0%, #000000 100%)', // Deep dark red center
            pointerEvents: 'none'
        }}>
            <canvas ref={canvasRef} style={{ display: 'block' }} />
            {/* Vignette Overlay for focus */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, transparent 40%, var(--bg-primary) 100%)',
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export default DigitalArteryBackground;
