// Constellation Animation
class ConstellationAnimation {
    constructor() {
        this.canvas = document.getElementById('constellation-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.numStars = 500;
        this.connections = [];
        this.mouseX = window.innerWidth / 2; // Initialize to center
        this.mouseY = window.innerHeight / 2;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.0006; // Constant gentle rotation
        this.shootingStars = [];

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        this.resizeCanvas();
        this.createStars();
        this.createConnections();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    createStars() {
        this.stars = [];

        // Define celestial body types with more vibrant colors
        const types = [
            { name: 'star', color: '#ffffff', glow: false, weight: 0.45 },
            { name: 'blue-star', color: '#7eb3ff', glow: true, weight: 0.18 }, // More vibrant blue
            { name: 'warm-star', color: '#ffb366', glow: true, weight: 0.15 }, // More vibrant orange
            { name: 'yellow-star', color: '#ffe680', glow: true, weight: 0.08 }, // More vibrant yellow
            { name: 'pink-star', color: '#ff99cc', glow: true, weight: 0.07 }, // More vibrant pink
            { name: 'cyan-star', color: '#80e6e0', glow: true, weight: 0.05 }, // More vibrant cyan
            { name: 'bright-star', color: '#ffffff', glow: true, weight: 0.02 }
        ];

        const maxDimension = Math.max(this.canvas.width, this.canvas.height);

        // Create more random, natural star field spread across entire screen
        const totalStars = this.numStars;

        // 70% completely random scattered stars (like a real night sky)
        const scatteredStars = Math.floor(totalStars * 0.7);
        for (let i = 0; i < scatteredStars; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * maxDimension * 1.3; // More spread out

            // Add randomness to position
            const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 250;
            const y = Math.sin(angle) * radius + (Math.random() - 0.5) * 250;

            this.addStar(x, y, types, Math.random(), false);
        }

        // 20% in subtle, loose clusters (like real star clusters)
        const numClusters = 8; // More clusters spread out
        const starsPerCluster = Math.floor((totalStars * 0.2) / numClusters);

        for (let cluster = 0; cluster < numClusters; cluster++) {
            const clusterAngle = Math.random() * Math.PI * 2;
            const clusterRadius = Math.random() * maxDimension * 1.1; // Spread clusters further
            const clusterX = Math.cos(clusterAngle) * clusterRadius;
            const clusterY = Math.sin(clusterAngle) * clusterRadius;

            for (let i = 0; i < starsPerCluster; i++) {
                const offsetAngle = Math.random() * Math.PI * 2;
                const offsetRadius = Math.random() * 300; // Larger cluster spread

                const x = clusterX + Math.cos(offsetAngle) * offsetRadius;
                const y = clusterY + Math.sin(offsetAngle) * offsetRadius;

                this.addStar(x, y, types, Math.random(), false);
            }
        }

        // 10% very faint background stars
        const backgroundStars = Math.floor(totalStars * 0.1);
        for (let i = 0; i < backgroundStars; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * maxDimension * 1.4; // Spread further beyond edges

            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            this.addStar(x, y, types, 0.2, false, true); // Very faint
        }
    }

    addStar(x, y, types, densityFactor, isCore = false, isFaint = false) {
        // Select type based on weighted probability
        const rand = Math.random();
        let cumulativeWeight = 0;
        let selectedType = types[0];

        for (const type of types) {
            cumulativeWeight += type.weight;
            if (rand <= cumulativeWeight) {
                selectedType = type;
                break;
            }
        }

        // More realistic star sizes - most stars are small points
        let baseSize;
        if (isFaint) {
            baseSize = 0.5 + Math.random() * 0.5; // Very small
        } else if (selectedType.name === 'bright-star') {
            baseSize = 2 + Math.random() * 2; // Rare bright stars
        } else {
            // Most stars are small with exponential distribution (more small, few large)
            baseSize = 0.8 + Math.random() * Math.random() * 1.5;
        }

        // More realistic depth distribution
        const depth = isFaint ?
            Math.random() * 0.2 + 0.2 :  // Faint background stars
            Math.random() * 0.6 + 0.3;   // Regular stars

        this.stars.push({
            x: x,
            y: y,
            originalX: x,
            originalY: y,
            size: baseSize,
            baseSize: baseSize,
            depth: depth,
            opacity: isFaint ? 0.55 : (Math.random() * 0.25 + 0.7), // Increased brightness
            twinkleSpeed: Math.random() * 0.0008 + 0.0003,
            type: selectedType.name,
            color: selectedType.color,
            hasGlow: selectedType.glow,
            glowIntensity: Math.random() * 0.4 + 0.3, // Increased glow
            densityFactor: densityFactor,
            isFaint: isFaint
        });
    }

    createConnections() {
        this.connections = [];
        const connectionDistance = 160;

        for (let i = 0; i < this.stars.length; i++) {
            for (let j = i + 1; j < this.stars.length; j++) {
                // Only connect non-faint stars
                if (this.stars[i].isFaint || this.stars[j].isFaint) continue;

                const dx = this.stars[i].originalX - this.stars[j].originalX;
                const dy = this.stars[i].originalY - this.stars[j].originalY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    this.connections.push({
                        star1: i,
                        star2: j,
                        opacity: 0.15 * (1 - distance / connectionDistance) // Slightly brighter
                    });
                }
            }
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createStars();
            this.createConnections();
        });

        // Track mouse position for large shooting stars
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        document.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            this.mouseX = touch.clientX;
            this.mouseY = touch.clientY;
        });

        // Click anywhere to create shooting star (except on interactive elements)
        document.addEventListener('click', (e) => {
            // Check if click was on an interactive element
            const target = e.target;
            const isInteractive = target.tagName === 'A' ||
                                 target.tagName === 'BUTTON' ||
                                 target.tagName === 'IMG' ||
                                 target.closest('a') ||
                                 target.closest('button') ||
                                 target.closest('.icon-link');

            // Always reverse rotation on any click
            this.rotationSpeed = -this.rotationSpeed;

            if (!isInteractive) {
                this.createShootingStar(e.clientX, e.clientY);
            }
        });

        document.addEventListener('touchend', (e) => {
            if (e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                const isInteractive = target?.tagName === 'A' ||
                                     target?.tagName === 'BUTTON' ||
                                     target?.tagName === 'IMG' ||
                                     target?.closest('a') ||
                                     target?.closest('button') ||
                                     target?.closest('.icon-link');

                // Always reverse rotation on any touch
                this.rotationSpeed = -this.rotationSpeed;

                if (!isInteractive) {
                    this.createShootingStar(touch.clientX, touch.clientY);
                }
            }
        });
    }

    createShootingStar(clickX, clickY) {
        // Fully randomized direction - any angle possible
        const angle = Math.random() * Math.PI * 2; // Full 360 degrees

        const speed = 0.3 + Math.random() * 0.4; // Even slower, more graceful

        // More variation in appearance - realistic meteor
        const length = 150 + Math.random() * 100; // Long trails
        const thickness = 0.8 + Math.random() * 0.6; // Thin, delicate

        // Randomized color tinge
        const colorType = Math.random();
        let color;
        if (colorType < 0.25) {
            color = { r: 255, g: 255, b: 255 }; // Pure white
        } else if (colorType < 0.4) {
            color = { r: 180 + Math.random() * 75, g: 200 + Math.random() * 55, b: 255 }; // Blue tinge
        } else if (colorType < 0.55) {
            color = { r: 255, g: 200 + Math.random() * 55, b: 180 + Math.random() * 50 }; // Warm/gold tinge
        } else if (colorType < 0.7) {
            color = { r: 255, g: 180 + Math.random() * 75, b: 200 + Math.random() * 55 }; // Pink tinge
        } else if (colorType < 0.85) {
            color = { r: 180 + Math.random() * 75, g: 255, b: 220 + Math.random() * 35 }; // Cyan/green tinge
        } else {
            color = { r: 220 + Math.random() * 35, g: 180 + Math.random() * 75, b: 255 }; // Purple tinge
        }

        const shootingStar = {
            x: clickX,
            y: clickY,
            startX: clickX, // Track starting position
            startY: clickY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            length: length,
            thickness: thickness,
            opacity: 0.9,
            life: 1,
            color: color,
            sparkles: [],
            startSize: 1, // For scaling effect
            scale: 1 // Current scale (will decrease to simulate distance)
        };

        this.shootingStars.push(shootingStar);
        console.log('Shooting star created at', clickX, clickY, 'angle:', angle);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Simple constant rotation
        this.rotationAngle += this.rotationSpeed;

        // Rotate stars with parallax effect
        this.stars.forEach(star => {
            // Apply parallax - closer stars rotate more, farther stars rotate less
            const parallaxFactor = 0.5 + (star.depth * 0.5); // 0.5 to 1.0
            const effectiveAngle = this.rotationAngle * parallaxFactor;

            const cos = Math.cos(effectiveAngle);
            const sin = Math.sin(effectiveAngle);
            star.x = star.originalX * cos - star.originalY * sin;
            star.y = star.originalX * sin + star.originalY * cos;

            // Scale and opacity based on depth for 3D effect
            star.size = star.baseSize * star.depth;

            // Gentle twinkle effect with depth-based opacity
            const baseOpacity = 0.35 + (star.depth * 0.5); // Increased brightness
            star.opacity = baseOpacity + Math.sin(Date.now() * star.twinkleSpeed) * 0.18; // Increased twinkle
        });

        // Draw connections with gradient
        this.connections.forEach(conn => {
            const star1 = this.stars[conn.star1];
            const star2 = this.stars[conn.star2];

            const gradient = this.ctx.createLinearGradient(
                this.centerX + star1.x,
                this.centerY + star1.y,
                this.centerX + star2.x,
                this.centerY + star2.y
            );
            gradient.addColorStop(0, star1.color);
            gradient.addColorStop(1, star2.color);

            this.ctx.beginPath();
            this.ctx.moveTo(
                this.centerX + star1.x,
                this.centerY + star1.y
            );
            this.ctx.lineTo(
                this.centerX + star2.x,
                this.centerY + star2.y
            );
            this.ctx.strokeStyle = gradient;
            this.ctx.globalAlpha = conn.opacity * 0.4;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });

        // Draw stars with glow effects
        this.stars.forEach(star => {
            const posX = this.centerX + star.x;
            const posY = this.centerY + star.y;

            // Draw glow for celestial bodies
            if (star.hasGlow) {
                const glowGradient = this.ctx.createRadialGradient(
                    posX, posY, 0,
                    posX, posY, star.size * 4
                );
                glowGradient.addColorStop(0, star.color);
                glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                this.ctx.globalAlpha = star.opacity * star.glowIntensity;
                this.ctx.fillStyle = glowGradient;
                this.ctx.beginPath();
                this.ctx.arc(posX, posY, star.size * 4, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // Draw main body
            this.ctx.beginPath();
            this.ctx.arc(posX, posY, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = star.opacity;
            this.ctx.fill();

            // Add subtle inner glow
            if (star.size > 2) {
                const innerGlow = this.ctx.createRadialGradient(
                    posX, posY, 0,
                    posX, posY, star.size
                );
                innerGlow.addColorStop(0, '#ffffff');
                innerGlow.addColorStop(1, star.color);
                this.ctx.fillStyle = innerGlow;
                this.ctx.globalAlpha = star.opacity * 0.8;
                this.ctx.fill();
            }
        });

        // Update and draw shooting stars
        this.shootingStars = this.shootingStars.filter(star => {
            // Update position
            star.x += star.vx;
            star.y += star.vy;

            // Fade out over time - extremely slow for very long travel
            star.life -= 0.0005;

            // For regular shooting stars (not large), add deep space effect
            if (!star.isLarge && star.scale !== undefined) {
                // Gradually shrink to simulate going into distance - even slower shrink
                star.scale = Math.max(0.2, star.scale * 0.998); // Shrinks to 20% over time
                star.opacity = Math.pow(star.life, 0.6) * star.scale * 0.9; // Fade based on both life and scale
            } else {
                star.opacity = Math.pow(star.life, 0.7) * 0.8; // Original fade for large stars
            }

            // Head fades faster than tail - head disappears first
            star.headOpacity = Math.pow(star.life, 1.5) * star.opacity; // Head fades much faster
            star.tailOpacity = star.opacity; // Tail maintains normal opacity

            // Fewer sparkles - more delicate (more for large stars)
            const sparkleChance = star.isLarge ? 0.4 : 0.1; // Fewer sparkles for small stars
            if (star.life > 0.3 && Math.random() < sparkleChance) {
                const currentScale = star.scale || 1;
                star.sparkles.push({
                    x: star.x + (Math.random() - 0.5) * (star.isLarge ? 15 : 8) * currentScale,
                    y: star.y + (Math.random() - 0.5) * (star.isLarge ? 15 : 8) * currentScale,
                    life: 1,
                    size: star.isLarge ? (0.6 + Math.random() * 1) : (0.2 + Math.random() * 0.4) * currentScale
                });
            }

            // Update sparkles
            star.sparkles = star.sparkles.filter(sparkle => {
                sparkle.life -= 0.04;
                return sparkle.life > 0;
            });

            // Remove if faded or off screen
            if (star.life <= 0 || star.x < -300 || star.x > this.canvas.width + 300 ||
                star.y < -300 || star.y > this.canvas.height + 300) {
                return false;
            }

            // Draw multi-layered trail for realistic meteor effect
            const currentScale = star.scale || 1;

            // Calculate actual distance traveled from start
            const distTraveled = Math.sqrt(
                Math.pow(star.x - star.startX, 2) + Math.pow(star.y - star.startY, 2)
            );

            // Trail length is the shorter of: distance traveled or max trail length
            const trailLength = Math.min(distTraveled, star.length);

            // Direction from start to current position (normalized)
            const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
            const dirX = star.vx / speed;
            const dirY = star.vy / speed;

            // Outer soft glow - very subtle atmospheric glow
            const glowGradient = this.ctx.createLinearGradient(
                star.x, star.y,
                star.x - dirX * trailLength * 0.4,
                star.y - dirY * trailLength * 0.4
            );
            glowGradient.addColorStop(0, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.tailOpacity * 0.15})`);
            glowGradient.addColorStop(1, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, 0)`);

            this.ctx.strokeStyle = glowGradient;
            this.ctx.lineWidth = star.thickness * 8 * currentScale;
            this.ctx.lineCap = 'round';
            this.ctx.globalAlpha = star.tailOpacity;
            this.ctx.beginPath();
            this.ctx.moveTo(star.x, star.y);
            this.ctx.lineTo(star.x - dirX * trailLength * 0.4, star.y - dirY * trailLength * 0.4);
            this.ctx.stroke();

            // Main trail - long tapered streak with gradual fade-in
            const mainGradient = this.ctx.createLinearGradient(
                star.x, star.y,
                star.x - dirX * trailLength,
                star.y - dirY * trailLength
            );
            mainGradient.addColorStop(0, `rgba(255, 255, 255, ${star.tailOpacity * 0.7})`);
            mainGradient.addColorStop(0.05, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.tailOpacity * 0.6})`);
            mainGradient.addColorStop(0.15, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.tailOpacity * 0.45})`);
            mainGradient.addColorStop(0.35, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.tailOpacity * 0.25})`);
            mainGradient.addColorStop(0.6, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.tailOpacity * 0.1})`);
            mainGradient.addColorStop(1, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, 0)`);

            this.ctx.strokeStyle = mainGradient;
            this.ctx.lineWidth = star.thickness * 2 * currentScale;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(star.x, star.y);
            this.ctx.lineTo(star.x - dirX * trailLength, star.y - dirY * trailLength);
            this.ctx.stroke();

            // Inner bright core trail - gradual fade
            const coreGradient = this.ctx.createLinearGradient(
                star.x, star.y,
                star.x - dirX * trailLength * 0.5,
                star.y - dirY * trailLength * 0.5
            );
            coreGradient.addColorStop(0, `rgba(255, 255, 255, ${star.headOpacity * 0.8})`);
            coreGradient.addColorStop(0.15, `rgba(255, 255, 255, ${star.tailOpacity * 0.5})`);
            coreGradient.addColorStop(0.4, `rgba(255, 255, 255, ${star.tailOpacity * 0.2})`);
            coreGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

            this.ctx.strokeStyle = coreGradient;
            this.ctx.lineWidth = star.thickness * currentScale;
            this.ctx.beginPath();
            this.ctx.moveTo(star.x, star.y);
            this.ctx.lineTo(star.x - dirX * trailLength * 0.6, star.y - dirY * trailLength * 0.6);
            this.ctx.stroke();

            // Tiny bright head point - subtle (uses headOpacity)
            const headSize = 1.5 * currentScale;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.headOpacity * 0.85})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, headSize, 0, Math.PI * 2);
            this.ctx.fill();

            // Subtle head glow - softer (uses headOpacity)
            const headGlow = this.ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, headSize * 4
            );
            headGlow.addColorStop(0, `rgba(255, 255, 255, ${star.headOpacity * 0.4})`);
            headGlow.addColorStop(0.3, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.headOpacity * 0.2})`);
            headGlow.addColorStop(0.6, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.headOpacity * 0.08})`);
            headGlow.addColorStop(1, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, 0)`);

            this.ctx.fillStyle = headGlow;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, headSize * 4, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw sparkles - more subtle
            star.sparkles.forEach(sparkle => {
                this.ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${sparkle.life * star.opacity * 0.7})`;
                this.ctx.beginPath();
                this.ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
                this.ctx.fill();
            });

            return true;
        });

        this.ctx.globalAlpha = 1;
        requestAnimationFrame(() => this.animate());
    }
}

// Email Copy Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize constellation animation
    new ConstellationAnimation();

    // Email copy button
    const emailButton = document.querySelector('.email-copy');
    if (emailButton) {
        emailButton.addEventListener('click', async () => {
            const email = emailButton.getAttribute('data-email');
            try {
                await navigator.clipboard.writeText(email);
                emailButton.classList.add('copied');

                // Update tooltip temporarily
                const originalTooltip = emailButton.getAttribute('data-tooltip');
                emailButton.setAttribute('data-tooltip', 'Copied!');

                setTimeout(() => {
                    emailButton.classList.remove('copied');
                    emailButton.setAttribute('data-tooltip', originalTooltip);
                }, 2000);
            } catch (err) {
                console.error('Failed to copy email:', err);
            }
        });
    }

    // Profile image fallback
    const profilePic = document.getElementById('profile-pic');
    if (profilePic) {
        profilePic.addEventListener('error', () => {
            // Create a placeholder with initials
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                width: 150px;
                height: 150px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 3rem;
                font-weight: bold;
                color: white;
                border: 3px solid var(--accent-blue);
                box-shadow: 0 0 20px rgba(100, 181, 246, 0.3);
            `;
            placeholder.textContent = 'RM';
            profilePic.parentNode.replaceChild(placeholder, profilePic);
        });
    }
});
