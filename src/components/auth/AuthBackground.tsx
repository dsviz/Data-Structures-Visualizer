
import React, { useEffect, useRef } from 'react';

interface AuthBackgroundProps {
    isFixed?: boolean;
}

const AuthBackground: React.FC<AuthBackgroundProps> = ({ isFixed = true }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
        const particleCount = 200; // Increased for a rich node cloud
        const focalLength = 300;
        const resolutionScale = window.devicePixelRatio || 1;
        const colors = [
            '#4285F4', // Blue
            '#EA4335', // Red
            '#FBBC05', // Yellow
            '#34A853', // Green
            '#818CF8', // Indigo
            '#A78BFA'  // Violet
        ];

        class Particle {
            x: number;
            y: number;
            z: number;
            baseX: number;
            baseY: number;
            baseZ: number;
            color: string;
            size: number;
            opacity: number;

            constructor() {
                // Initial 3D position in a cube
                this.baseX = (Math.random() - 0.5) * 800;
                this.baseY = (Math.random() - 0.5) * 800;
                this.baseZ = (Math.random() - 0.5) * 800;
                this.x = this.baseX;
                this.y = this.baseY;
                this.z = this.baseZ;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.size = Math.random() * 2 + 1;
                this.opacity = Math.random() * 0.5 + 0.3;
            }

            rotate(angleX: number, angleY: number) {
                // Y-axis rotation (horizontal movement)
                const cosY = Math.cos(angleY);
                const sinY = Math.sin(angleY);
                const x1 = this.baseX * cosY - this.baseZ * sinY;
                const z1 = this.baseZ * cosY + this.baseX * sinY;

                // X-axis rotation (vertical movement)
                const cosX = Math.cos(angleX);
                const sinX = Math.sin(angleX);
                const y2 = this.baseY * cosX - z1 * sinX;
                const z2 = z1 * cosX + this.baseY * sinX;

                this.x = x1;
                this.y = y2;
                this.z = z2;
            }

            draw(ctx: CanvasRenderingContext2D, width: number, height: number, isDark: boolean) {
                // Perspective projection
                const scale = focalLength / (focalLength + this.z);
                const canvasX = this.x * scale + width / 2;
                const canvasY = this.y * scale + height / 2;

                // Only draw if within bounds and in front of camera
                if (this.z > -focalLength) {
                    const finalSize = this.size * scale;
                    const finalOpacity = this.opacity * scale * (isDark ? 0.7 : 0.9);

                    ctx.beginPath();
                    ctx.arc(canvasX, canvasY, finalSize, 0, Math.PI * 2);

                    ctx.fillStyle = this.color;
                    ctx.globalAlpha = finalOpacity;
                    ctx.fill();
                    ctx.globalAlpha = 1.0;
                }
            }
        }

        const resize = () => {
            const width = isFixed ? window.innerWidth : canvas.parentElement?.clientWidth || window.innerWidth;
            const height = isFixed ? window.innerHeight : canvas.parentElement?.clientHeight || window.innerHeight;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            canvas.width = width * resolutionScale;
            canvas.height = height * resolutionScale;
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before scaling
            ctx.scale(resolutionScale, resolutionScale);
        };

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.targetX = e.clientX / window.innerWidth;
            mouse.targetY = e.clientY / window.innerHeight;
        };

        const animate = () => {
            if (document.hidden) {
                animationFrameId = requestAnimationFrame(animate);
                return;
            }

            // Smooth mouse interpolation
            mouse.x += (mouse.targetX - mouse.x) * 0.05;
            mouse.y += (mouse.targetY - mouse.y) * 0.05;

            const isDark = document.documentElement.classList.contains('dark');
            const logicalWidth = canvas.width / resolutionScale;
            const logicalHeight = canvas.height / resolutionScale;

            ctx.clearRect(0, 0, logicalWidth, logicalHeight);

            // Calculate rotation angles based on mouse
            // Mouse X controls Y rotation (yaw), Mouse Y controls X rotation (pitch)
            const angleY = (mouse.x - 0.5) * 0.5 + (Date.now() * 0.0001); // Autonomous drift + mouse influence
            const angleX = (mouse.y - 0.5) * 0.5;

            // Sort particles by Z-depth for correct rendering (Painter's algorithm)
            particles.sort((a, b) => b.z - a.z);

            particles.forEach((particle) => {
                particle.rotate(angleX, angleY);
                particle.draw(ctx, logicalWidth, logicalHeight, isDark);
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        resize();
        init();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isFixed]);

    return (
        <div className={`${isFixed ? 'fixed' : 'absolute'} inset-0 z-0 overflow-hidden pointer-events-none select-none`} style={{ willChange: 'transform' }}>
            {/* Ambient Mesh Backgrounds for Depth */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 dark:bg-primary/15 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <canvas
                ref={canvasRef}
                className="absolute inset-0 opacity-70 dark:opacity-70"
                style={{ transform: 'translateZ(0)', willChange: 'opacity' }}
            />

            {/* Subtle Mathematical Grid - Static but essential for the "Lab" feel */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8881_1px,transparent_1px),linear-gradient(to_bottom,#8881_1px,transparent_1px)] bg-[size:60px_60px] opacity-20"></div>
        </div>
    );
};

export default AuthBackground;
