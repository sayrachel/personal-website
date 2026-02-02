// Constellation Animation
class ConstellationAnimation {
    constructor() {
        this.canvas = document.getElementById('constellation-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.numStars = 100;
        this.connections = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.0005;

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
        for (let i = 0; i < this.numStars; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * Math.min(this.canvas.width, this.canvas.height) * 0.6;

            this.stars.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                originalX: Math.cos(angle) * radius,
                originalY: Math.sin(angle) * radius,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.3,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }

    createConnections() {
        this.connections = [];
        const connectionDistance = 150;

        for (let i = 0; i < this.stars.length; i++) {
            for (let j = i + 1; j < this.stars.length; j++) {
                const dx = this.stars[i].originalX - this.stars[j].originalX;
                const dy = this.stars[i].originalY - this.stars[j].originalY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    this.connections.push({
                        star1: i,
                        star2: j,
                        opacity: 0.2 * (1 - distance / connectionDistance)
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

        const handleInteraction = (x, y) => {
            this.mouseX = x - this.centerX;
            this.mouseY = y - this.centerY;
            const angle = Math.atan2(this.mouseY, this.mouseX);
            const distance = Math.sqrt(this.mouseX * this.mouseX + this.mouseY * this.mouseY);
            const influence = Math.min(distance / 200, 1);
            this.rotationSpeed = 0.001 + influence * 0.003;
        };

        document.addEventListener('mousemove', (e) => {
            handleInteraction(e.clientX, e.clientY);
        });

        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            handleInteraction(touch.clientX, touch.clientY);
        });

        document.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            handleInteraction(touch.clientX, touch.clientY);
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.rotationAngle += this.rotationSpeed;

        // Rotate stars
        this.stars.forEach(star => {
            const cos = Math.cos(this.rotationAngle);
            const sin = Math.sin(this.rotationAngle);
            star.x = star.originalX * cos - star.originalY * sin;
            star.y = star.originalX * sin + star.originalY * cos;

            // Twinkle effect
            star.opacity = 0.5 + Math.sin(Date.now() * star.twinkleSpeed) * 0.3;
        });

        // Draw connections
        this.ctx.strokeStyle = 'rgba(100, 181, 246, 0.3)';
        this.connections.forEach(conn => {
            const star1 = this.stars[conn.star1];
            const star2 = this.stars[conn.star2];

            this.ctx.beginPath();
            this.ctx.moveTo(
                this.centerX + star1.x,
                this.centerY + star1.y
            );
            this.ctx.lineTo(
                this.centerX + star2.x,
                this.centerY + star2.y
            );
            this.ctx.globalAlpha = conn.opacity;
            this.ctx.stroke();
        });

        // Draw stars
        this.stars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(
                this.centerX + star.x,
                this.centerY + star.y,
                star.size,
                0,
                Math.PI * 2
            );
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = star.opacity;
            this.ctx.fill();
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
