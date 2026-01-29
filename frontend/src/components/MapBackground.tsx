import { useEffect, useRef } from 'react';
import './MapBackground.css';

function MapBackground() {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const nodesRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Configuration
        const config = {
            nodeCount: 25,
            connectionDistance: 250,
            nodeRadius: 3,
            glowIntensity: 15,
            pulseSpeed: 0.002,
            zoomSpeed: 0.0003,
            cameraSpeed: 0.0002,
            redColor: '#ff2d55',
            redGlow: 'rgba(255, 45, 85, 0.6)',
            lineColor: 'rgba(255, 45, 85, 0.15)',
        };

        // Node class
        class Node {
            constructor(width, height) {
                this.baseX = Math.random() * width;
                this.baseY = Math.random() * height;
                this.x = this.baseX;
                this.y = this.baseY;
                this.pulseOffset = Math.random() * Math.PI * 2;
                this.pulseSpeed = 0.8 + Math.random() * 0.4;
                this.baseRadius = config.nodeRadius;
                this.currentRadius = this.baseRadius;
                this.currentGlow = config.glowIntensity;
            }

            update(time, zoom, cameraX, cameraY, centerX, centerY) {
                // Apply zoom and camera movement
                this.x = centerX + (this.baseX - centerX) * zoom + cameraX;
                this.y = centerY + (this.baseY - centerY) * zoom + cameraY;

                // Pulse effect
                const pulse = Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.5 + 0.5;
                this.currentRadius = this.baseRadius + pulse * 2;
                this.currentGlow = config.glowIntensity + pulse * 10;
            }

            draw(ctx) {
                // Outer glow
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.currentGlow
                );
                gradient.addColorStop(0, config.redGlow);
                gradient.addColorStop(0.5, 'rgba(255, 45, 85, 0.2)');
                gradient.addColorStop(1, 'rgba(255, 45, 85, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.currentGlow, 0, Math.PI * 2);
                ctx.fill();

                // Core node
                ctx.fillStyle = config.redColor;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Resize canvas
        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            ctx.scale(dpr, dpr);

            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';

            // Recreate nodes with new dimensions
            if (nodesRef.current.length === 0) {
                for (let i = 0; i < config.nodeCount; i++) {
                    nodesRef.current.push(new Node(rect.width, rect.height));
                }
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Animation variables
        let time = 0;
        let zoomPhase = 0;
        let cameraPhase = 0;

        // Draw connections
        const drawConnections = (nodes, canvasWidth, canvasHeight) => {
            ctx.strokeStyle = config.lineColor;
            ctx.lineWidth = 1;

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[j].x - nodes[i].x;
                    const dy = nodes[j].y - nodes[i].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.connectionDistance) {
                        const opacity = 1 - (distance / config.connectionDistance);
                        ctx.strokeStyle = `rgba(255, 45, 85, ${opacity * 0.15})`;

                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        // Animation loop
        const animate = () => {
            const rect = canvas.getBoundingClientRect();

            // Clear canvas with fade effect for smooth trails
            ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
            ctx.fillRect(0, 0, rect.width, rect.height);

            // Update animation phases
            time += config.pulseSpeed;
            zoomPhase += config.zoomSpeed;
            cameraPhase += config.cameraSpeed;

            // Calculate zoom (smooth sine wave between 0.9 and 1.1)
            const zoom = 1 + Math.sin(zoomPhase) * 0.1;

            // Calculate camera movement (subtle circular motion)
            const cameraX = Math.cos(cameraPhase) * 30;
            const cameraY = Math.sin(cameraPhase * 1.3) * 20;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Update nodes
            nodesRef.current.forEach(node => {
                node.update(time, zoom, cameraX, cameraY, centerX, centerY);
            });

            // Draw connections first (behind nodes)
            drawConnections(nodesRef.current, rect.width, rect.height);

            // Draw nodes on top
            nodesRef.current.forEach(node => {
                node.draw(ctx);
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        // Start animation
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return <canvas ref={canvasRef} className="map-background-canvas" />;
}

export default MapBackground;
