// Theme and Animation Controller
class ThemeController {
    constructor() {
        this.isLightMode = false;
        this.toggle = document.getElementById('theme-toggle');
        this.icon = document.getElementById('theme-icon');
        this.init();
    }

    init() {
        // Check for saved preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            this.enableLightMode();
        }

        if (this.toggle) {
            this.toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleTheme();
            });
        }
    }

    toggleTheme() {
        if (this.isLightMode) {
            this.enableDarkMode();
        } else {
            this.enableLightMode();
        }
    }

    enableLightMode() {
        this.isLightMode = true;
        document.body.classList.add('light-mode');
        if (this.icon) {
            this.icon.className = 'fa-regular fa-sun';
        }
        localStorage.setItem('theme', 'light');
        if (window.animation) {
            window.animation.setTheme('light');
        }
    }

    enableDarkMode() {
        this.isLightMode = false;
        document.body.classList.remove('light-mode');
        if (this.icon) {
            this.icon.className = 'fas fa-moon';
            this.icon.style.color = '';
        }
        localStorage.setItem('theme', 'dark');
        if (window.animation) {
            window.animation.setTheme('dark');
        }
    }

    getTheme() {
        return this.isLightMode ? 'light' : 'dark';
    }
}

// Unified Animation (Constellations or Clouds)
class SkyAnimation {
    constructor(themeController) {
        this.canvas = document.getElementById('constellation-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.themeController = themeController;

        this.isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;

        // Shared properties
        this.rotationAngle = 0;
        this.rotationSpeed = this.isMobile ? 0.0008 : 0.0005;

        // Dark mode: stars and constellations
        this.stars = [];
        this.connections = [];
        this.numStars = this.isMobile ? 120 : 400;
        this.shootingStars = [];

        // Light mode: clouds
        this.clouds = [];
        this.numClouds = this.isMobile ? 28 : 55;
        this.contrails = []; // Plane streaks

        this.init();
        this.setupEventListeners();
        this.animate();

        window.animation = this;
    }

    init() {
        this.resizeCanvas();
        this.createStars();
        this.createConnections();
        this.createClouds();
    }

    setTheme(theme) {
        // Theme change - reinitialize if needed
        if (theme === 'light') {
            this.createClouds();
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    // ========== DARK MODE: Stars and Constellations ==========

    createStars() {
        this.stars = [];
        const types = [
            { name: 'star', color: '#ffffff', glow: false, weight: 0.5 },
            { name: 'blue-star', color: '#7eb3ff', glow: true, weight: 0.15 },
            { name: 'warm-star', color: '#ffb366', glow: true, weight: 0.12 },
            { name: 'yellow-star', color: '#ffe680', glow: true, weight: 0.08 },
            { name: 'pink-star', color: '#ff99cc', glow: true, weight: 0.08 },
            { name: 'cyan-star', color: '#80e6e0', glow: true, weight: 0.05 },
            { name: 'bright-star', color: '#ffffff', glow: true, weight: 0.02 }
        ];

        const maxDimension = Math.max(this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.numStars * 0.75; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * maxDimension * 1.2;
            const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 200;
            const y = Math.sin(angle) * radius + (Math.random() - 0.5) * 200;
            this.addStar(x, y, types);
        }

        // Clusters
        const numClusters = 6;
        const starsPerCluster = Math.floor((this.numStars * 0.2) / numClusters);
        for (let cluster = 0; cluster < numClusters; cluster++) {
            const clusterAngle = Math.random() * Math.PI * 2;
            const clusterRadius = Math.random() * maxDimension * 0.9;
            const clusterX = Math.cos(clusterAngle) * clusterRadius;
            const clusterY = Math.sin(clusterAngle) * clusterRadius;

            for (let i = 0; i < starsPerCluster; i++) {
                const offsetAngle = Math.random() * Math.PI * 2;
                const offsetRadius = Math.random() * 250;
                this.addStar(clusterX + Math.cos(offsetAngle) * offsetRadius,
                           clusterY + Math.sin(offsetAngle) * offsetRadius, types);
            }
        }

        // Background
        for (let i = 0; i < this.numStars * 0.05; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * maxDimension * 1.3;
            this.addStar(Math.cos(angle) * radius, Math.sin(angle) * radius, types, true);
        }
    }

    addStar(x, y, types, isFaint = false) {
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

        const baseSize = isFaint ? 0.5 + Math.random() * 0.5 :
            (selectedType.name === 'bright-star' ? 2 + Math.random() * 2 :
            0.8 + Math.random() * Math.random() * 1.5);

        const depth = isFaint ? Math.random() * 0.2 + 0.2 : Math.random() * 0.6 + 0.3;

        this.stars.push({
            x, y, originalX: x, originalY: y,
            size: baseSize, baseSize, depth,
            opacity: isFaint ? 0.5 : (Math.random() * 0.25 + 0.65),
            twinkleSpeed: Math.random() * 0.0008 + 0.0003,
            color: selectedType.color,
            hasGlow: selectedType.glow,
            glowIntensity: Math.random() * 0.35 + 0.25,
            isFaint
        });
    }

    createConnections() {
        this.connections = [];
        const connectionDistance = 140;

        for (let i = 0; i < this.stars.length; i++) {
            for (let j = i + 1; j < this.stars.length; j++) {
                if (this.stars[i].isFaint || this.stars[j].isFaint) continue;

                const dx = this.stars[i].originalX - this.stars[j].originalX;
                const dy = this.stars[i].originalY - this.stars[j].originalY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    this.connections.push({
                        star1: i, star2: j,
                        opacity: 0.12 * (1 - distance / connectionDistance)
                    });
                }
            }
        }
    }

    createShootingStar(clickX, clickY) {
        const angle = Math.random() * Math.PI * 2;
        const speed = this.isMobile ? (0.7 + Math.random() * 0.5) : (0.25 + Math.random() * 0.35);
        const length = this.isMobile ? (70 + Math.random() * 50) : (120 + Math.random() * 80);

        const colorType = Math.random();
        let color;
        if (colorType < 0.3) color = { r: 255, g: 255, b: 255 };
        else if (colorType < 0.5) color = { r: 180 + Math.random() * 75, g: 200 + Math.random() * 55, b: 255 };
        else if (colorType < 0.7) color = { r: 255, g: 200 + Math.random() * 55, b: 180 + Math.random() * 50 };
        else color = { r: 220 + Math.random() * 35, g: 220 + Math.random() * 35, b: 255 };

        this.shootingStars.push({
            x: clickX, y: clickY, startX: clickX, startY: clickY,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            length, thickness: 0.7 + Math.random() * 0.5,
            opacity: 0.85, life: 1,
            fadeRate: this.isMobile ? 0.0025 : 0.0004,
            color, scale: 1
        });
    }

    // ========== LIGHT MODE: Clouds ==========

    createClouds() {
        this.clouds = [];
        const maxDimension = Math.max(this.canvas.width, this.canvas.height);

        // First, add a few massive anchor clouds scattered around
        const numMassiveClouds = 2 + Math.floor(Math.random() * 2); // 2-3 massive clouds
        for (let i = 0; i < numMassiveClouds; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 100 + Math.random() * maxDimension * 0.4;
            this.addCloud(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                'massive'
            );
        }

        // Create dense cloud clusters - areas with many clouds bunched together
        const numDenseClusters = 3 + Math.floor(Math.random() * 2); // More dense clusters
        for (let c = 0; c < numDenseClusters; c++) {
            const clusterAngle = Math.random() * Math.PI * 2;
            const clusterRadius = 80 + Math.random() * maxDimension * 0.35;
            const clusterX = Math.cos(clusterAngle) * clusterRadius;
            const clusterY = Math.sin(clusterAngle) * clusterRadius;
            const clusterSize = 80 + Math.random() * 120; // Tighter clusters
            const cloudCount = 8 + Math.floor(Math.random() * 8); // More clouds per cluster

            for (let i = 0; i < cloudCount; i++) {
                const offsetAngle = Math.random() * Math.PI * 2;
                // More clouds closer to center of cluster
                const offsetDist = Math.pow(Math.random(), 1.5) * clusterSize;
                this.addCloud(
                    clusterX + Math.cos(offsetAngle) * offsetDist,
                    clusterY + Math.sin(offsetAngle) * offsetDist,
                    'dense'
                );
            }
        }

        // Create medium clusters
        const numMediumClusters = 2 + Math.floor(Math.random() * 2);
        for (let c = 0; c < numMediumClusters; c++) {
            const clusterAngle = Math.random() * Math.PI * 2;
            const clusterRadius = 150 + Math.random() * maxDimension * 0.45;
            const clusterX = Math.cos(clusterAngle) * clusterRadius;
            const clusterY = Math.sin(clusterAngle) * clusterRadius;
            const clusterSize = 80 + Math.random() * 100;
            const cloudCount = 4 + Math.floor(Math.random() * 4);

            for (let i = 0; i < cloudCount; i++) {
                const offsetAngle = Math.random() * Math.PI * 2;
                const offsetDist = Math.random() * clusterSize;
                this.addCloud(
                    clusterX + Math.cos(offsetAngle) * offsetDist,
                    clusterY + Math.sin(offsetAngle) * offsetDist,
                    'medium'
                );
            }
        }

        // Add sparse scattered clouds - fewer and no tiny dots
        const scatteredCount = Math.max(0, Math.floor((this.numClouds - this.clouds.length) * 0.6));
        for (let i = 0; i < scatteredCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 100 + Math.random() * maxDimension * 0.7;

            // Only medium-sized scattered clouds, no tiny dots
            const typeRoll = Math.random();
            let type;
            if (typeRoll < 0.4) type = 'wisp';
            else if (typeRoll < 0.7) type = 'scattered';
            else type = 'lone';

            this.addCloud(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                type
            );
        }
    }

    addCloud(x, y, distribution) {
        const cloudType = Math.random();
        let numPuffs, baseLength, baseOpacity, puffSizeRange, curve;

        // Different distributions favor different cloud types
        if (distribution === 'massive') {
            // Very large anchor clouds
            numPuffs = 12 + Math.floor(Math.random() * 8);
            baseLength = 180 + Math.random() * 150;
            baseOpacity = 0.7 + Math.random() * 0.25;
            puffSizeRange = { min: 45, max: 95 };
            curve = (Math.random() - 0.5) * 0.4;
        } else if (distribution === 'tiny') {
            // Tiny wisps only
            numPuffs = 1 + Math.floor(Math.random() * 2);
            baseLength = 15 + Math.random() * 25;
            baseOpacity = 0.15 + Math.random() * 0.2;
            puffSizeRange = { min: 6, max: 15 };
            curve = (Math.random() - 0.5) * 0.2;
        } else if (distribution === 'wisp') {
            // Small thin wisps
            numPuffs = 2 + Math.floor(Math.random() * 2);
            baseLength = 30 + Math.random() * 50;
            baseOpacity = 0.2 + Math.random() * 0.2;
            puffSizeRange = { min: 10, max: 20 };
            curve = (Math.random() - 0.5) * 0.4;
        } else if (distribution === 'dense' && cloudType < 0.7) {
            // Dense clusters favor bigger clouds
            if (cloudType < 0.3) {
                // Large fluffy
                numPuffs = 7 + Math.floor(Math.random() * 5);
                baseLength = 90 + Math.random() * 100;
                baseOpacity = 0.6 + Math.random() * 0.3;
                puffSizeRange = { min: 28, max: 60 };
                curve = (Math.random() - 0.5) * 0.5;
            } else {
                // Medium-large
                numPuffs = 5 + Math.floor(Math.random() * 4);
                baseLength = 70 + Math.random() * 70;
                baseOpacity = 0.5 + Math.random() * 0.3;
                puffSizeRange = { min: 22, max: 48 };
                curve = (Math.random() - 0.5) * 0.5;
            }
        } else if (distribution === 'lone') {
            // Lone clouds can be any size but tend larger
            if (cloudType < 0.4) {
                numPuffs = 8 + Math.floor(Math.random() * 6);
                baseLength = 100 + Math.random() * 120;
                baseOpacity = 0.55 + Math.random() * 0.35;
                puffSizeRange = { min: 25, max: 55 };
                curve = (Math.random() - 0.5) * 0.6;
            } else {
                numPuffs = 4 + Math.floor(Math.random() * 4);
                baseLength = 60 + Math.random() * 80;
                baseOpacity = 0.4 + Math.random() * 0.35;
                puffSizeRange = { min: 18, max: 40 };
                curve = (Math.random() - 0.5) * 0.5;
            }
        } else {
            // Default variety
            if (cloudType < 0.2) {
                numPuffs = 2 + Math.floor(Math.random() * 2);
                baseLength = 30 + Math.random() * 40;
                baseOpacity = 0.25 + Math.random() * 0.2;
                puffSizeRange = { min: 10, max: 22 };
                curve = (Math.random() - 0.5) * 0.3;
            } else if (cloudType < 0.45) {
                numPuffs = 4 + Math.floor(Math.random() * 3);
                baseLength = 50 + Math.random() * 60;
                baseOpacity = 0.4 + Math.random() * 0.3;
                puffSizeRange = { min: 16, max: 35 };
                curve = (Math.random() - 0.5) * 0.5;
            } else if (cloudType < 0.7) {
                numPuffs = 5 + Math.floor(Math.random() * 4);
                baseLength = 70 + Math.random() * 80;
                baseOpacity = 0.5 + Math.random() * 0.3;
                puffSizeRange = { min: 20, max: 45 };
                curve = (Math.random() - 0.5) * 0.55;
            } else if (cloudType < 0.85) {
                // Long streaky
                numPuffs = 5 + Math.floor(Math.random() * 5);
                baseLength = 110 + Math.random() * 130;
                baseOpacity = 0.28 + Math.random() * 0.22;
                puffSizeRange = { min: 12, max: 25 };
                curve = (Math.random() - 0.5) * 0.25;
            } else {
                // Big cumulus
                numPuffs = 9 + Math.floor(Math.random() * 6);
                baseLength = 110 + Math.random() * 90;
                baseOpacity = 0.65 + Math.random() * 0.25;
                puffSizeRange = { min: 32, max: 65 };
                curve = (Math.random() - 0.5) * 0.4;
            }
        }

        // Generate puffs with organic placement and varied opacity
        const puffs = [];
        for (let p = 0; p < numPuffs; p++) {
            const t = numPuffs > 1 ? p / (numPuffs - 1) : 0.5;
            const offsetVariance = puffSizeRange.max * 0.7;
            // More irregular placement
            const irregularity = 0.25 + Math.random() * 0.15;
            const actualT = t + (Math.random() - 0.5) * irregularity;
            const offset = (Math.random() - 0.5) * offsetVariance * (0.8 + Math.random() * 0.4);

            // Calculate distance from cloud center (0 = center, 1 = edge)
            const distFromCenter = Math.sqrt(
                Math.pow((actualT - 0.5) * 2, 2) +
                Math.pow(offset / offsetVariance, 2)
            );

            // Puffs closer to center are more opaque, edges fade out
            // Add random variation too
            const centerBoost = Math.max(0, 1 - distFromCenter * 0.7);
            const randomVariation = 0.5 + Math.random() * 0.5;
            const puffOpacity = (0.3 + centerBoost * 0.7) * randomVariation;

            puffs.push({
                t: actualT,
                offset: offset,
                size: puffSizeRange.min + Math.random() * (puffSizeRange.max - puffSizeRange.min)
                      + Math.sin(t * Math.PI) * (puffSizeRange.max * 0.2) * (0.7 + Math.random() * 0.6),
                opacity: puffOpacity
            });
        }

        this.clouds.push({
            x: x,
            y: y,
            originalX: x,
            originalY: y,
            opacity: baseOpacity,
            depth: 0.15 + Math.random() * 0.85,
            length: baseLength,
            curve: curve,
            puffs: puffs
        });
    }

    generateCloudPuffs() {
        // Not used in new design
        return [];
    }

    createContrail(clickX, clickY) {
        const angle = Math.random() * Math.PI * 2;
        const speed = this.isMobile ? (0.6 + Math.random() * 0.4) : (0.25 + Math.random() * 0.3);
        const length = this.isMobile ? (60 + Math.random() * 40) : (100 + Math.random() * 60);

        this.contrails.push({
            x: clickX, y: clickY, startX: clickX, startY: clickY,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            length: length,
            life: 1,
            fadeRate: this.isMobile ? 0.002 : 0.0004,
            thickness: 3 + Math.random() * 3,
            opacity: 0.7
        });
    }

    // ========== Event Listeners ==========

    setupEventListeners() {
        let resizeTimeout;
        let lastWidth = this.canvas.width;
        let lastHeight = this.canvas.height;

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const widthChange = Math.abs(window.innerWidth - lastWidth);
                const heightChange = Math.abs(window.innerHeight - lastHeight);

                if (widthChange > 100 || heightChange > 100) {
                    this.resizeCanvas();
                    this.createStars();
                    this.createConnections();
                    this.createClouds();
                    lastWidth = this.canvas.width;
                    lastHeight = this.canvas.height;
                } else {
                    this.resizeCanvas();
                }
            }, 250);
        });

        let touchStartX = 0, touchStartY = 0, lastTouchTime = 0;

        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        document.addEventListener('click', (e) => {
            if (Date.now() - lastTouchTime < 500) return;
            this.handleClick(e.clientX, e.clientY, e.target);
        });

        document.addEventListener('touchend', (e) => {
            lastTouchTime = Date.now();
            if (e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                const deltaX = Math.abs(touch.clientX - touchStartX);
                const deltaY = Math.abs(touch.clientY - touchStartY);
                if (deltaX > 30 || deltaY > 30) return;

                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                this.handleClick(touch.clientX, touch.clientY, target);
            }
        });
    }

    handleClick(x, y, target) {
        const isInteractive = target?.tagName === 'A' ||
            target?.tagName === 'BUTTON' ||
            target?.tagName === 'IMG' ||
            target?.closest('a') ||
            target?.closest('button') ||
            target?.closest('.icon-link') ||
            target?.closest('.indicator') ||
            target?.closest('.theme-toggle');

        // Reverse rotation on any click
        this.rotationSpeed = -this.rotationSpeed;

        if (!isInteractive) {
            if (this.themeController.getTheme() === 'light') {
                this.createContrail(x, y);
            } else {
                this.createShootingStar(x, y);
            }
        }
    }

    // ========== Animation Loop ==========

    animate() {
        const isLight = this.themeController.getTheme() === 'light';

        // Clear with appropriate background
        if (isLight) {
            // Natural sky with rich variation
            // Base gradient
            const gradient = this.ctx.createRadialGradient(
                this.centerX * 0.35, this.centerY * 0.25, 0,
                this.centerX, this.centerY, Math.max(this.canvas.width, this.canvas.height) * 1.1
            );
            gradient.addColorStop(0, '#F0F8FC');      // Almost white bright spot
            gradient.addColorStop(0.08, '#DCF0FA');   // Very pale blue
            gradient.addColorStop(0.18, '#C4E6F7');   // Pale sky
            gradient.addColorStop(0.3, '#A8D8F2');    // Light sky blue
            gradient.addColorStop(0.45, '#8CCAEC');   // Soft blue
            gradient.addColorStop(0.6, '#70BCE4');    // Medium sky blue
            gradient.addColorStop(0.75, '#58AEDC');   // Richer blue
            gradient.addColorStop(0.9, '#42A0D4');    // Deeper blue
            gradient.addColorStop(1, '#3090C8');      // Blue at far edges
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Secondary warm bright spot (like sun glow area)
            const gradient2 = this.ctx.createRadialGradient(
                this.canvas.width * 0.9, this.canvas.height * 0.15, 0,
                this.canvas.width * 0.9, this.canvas.height * 0.15, this.canvas.width * 0.55
            );
            gradient2.addColorStop(0, 'rgba(255, 250, 240, 0.35)');
            gradient2.addColorStop(0.2, 'rgba(240, 245, 255, 0.25)');
            gradient2.addColorStop(0.5, 'rgba(200, 225, 250, 0.15)');
            gradient2.addColorStop(1, 'rgba(180, 210, 240, 0)');
            this.ctx.fillStyle = gradient2;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Cool shadow area
            const gradient3 = this.ctx.createRadialGradient(
                this.canvas.width * 0.1, this.canvas.height * 0.85, 0,
                this.canvas.width * 0.1, this.canvas.height * 0.85, this.canvas.width * 0.4
            );
            gradient3.addColorStop(0, 'rgba(100, 160, 210, 0.2)');
            gradient3.addColorStop(0.5, 'rgba(120, 175, 220, 0.1)');
            gradient3.addColorStop(1, 'rgba(140, 190, 230, 0)');
            this.ctx.fillStyle = gradient3;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Additional variation patch
            const gradient4 = this.ctx.createRadialGradient(
                this.canvas.width * 0.6, this.canvas.height * 0.5, 0,
                this.canvas.width * 0.6, this.canvas.height * 0.5, this.canvas.width * 0.35
            );
            gradient4.addColorStop(0, 'rgba(190, 225, 250, 0.2)');
            gradient4.addColorStop(0.6, 'rgba(170, 210, 245, 0.08)');
            gradient4.addColorStop(1, 'rgba(150, 200, 240, 0)');
            this.ctx.fillStyle = gradient4;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Subtle haze near edges
            const gradient5 = this.ctx.createRadialGradient(
                this.centerX, this.centerY, Math.max(this.canvas.width, this.canvas.height) * 0.5,
                this.centerX, this.centerY, Math.max(this.canvas.width, this.canvas.height) * 1.2
            );
            gradient5.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient5.addColorStop(0.5, 'rgba(200, 220, 240, 0.05)');
            gradient5.addColorStop(1, 'rgba(180, 200, 230, 0.12)');
            this.ctx.fillStyle = gradient5;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.animateClouds();
            this.animateContrails();
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.animateStars();
            this.animateShootingStars();
        }

        this.rotationAngle += this.rotationSpeed;
        requestAnimationFrame(() => this.animate());
    }

    animateStars() {
        // Rotate stars
        this.stars.forEach(star => {
            const parallaxFactor = 0.5 + (star.depth * 0.5);
            const effectiveAngle = this.rotationAngle * parallaxFactor;

            const cos = Math.cos(effectiveAngle);
            const sin = Math.sin(effectiveAngle);
            star.x = star.originalX * cos - star.originalY * sin;
            star.y = star.originalX * sin + star.originalY * cos;

            star.size = star.baseSize * star.depth;
            const baseOpacity = 0.3 + (star.depth * 0.5);
            star.opacity = baseOpacity + Math.sin(Date.now() * star.twinkleSpeed) * 0.15;
        });

        // Draw connections
        this.connections.forEach(conn => {
            const star1 = this.stars[conn.star1];
            const star2 = this.stars[conn.star2];
            if (!star1 || !star2) return;

            const opacity = conn.opacity * 0.35;
            if (opacity <= 0 || isNaN(opacity)) return;

            const gradient = this.ctx.createLinearGradient(
                this.centerX + star1.x, this.centerY + star1.y,
                this.centerX + star2.x, this.centerY + star2.y
            );
            gradient.addColorStop(0, star1.color);
            gradient.addColorStop(1, star2.color);

            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX + star1.x, this.centerY + star1.y);
            this.ctx.lineTo(this.centerX + star2.x, this.centerY + star2.y);
            this.ctx.strokeStyle = gradient;
            this.ctx.globalAlpha = opacity;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });

        this.ctx.globalAlpha = 1;

        // Draw stars
        this.stars.forEach(star => {
            if (!star || isNaN(star.x) || isNaN(star.y)) return;

            const posX = this.centerX + star.x;
            const posY = this.centerY + star.y;
            const starOpacity = Math.max(0, Math.min(1, star.opacity || 0));

            if (star.hasGlow && starOpacity > 0) {
                const glowGradient = this.ctx.createRadialGradient(posX, posY, 0, posX, posY, star.size * 4);
                glowGradient.addColorStop(0, star.color);
                glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                this.ctx.globalAlpha = starOpacity * (star.glowIntensity || 0.3);
                this.ctx.fillStyle = glowGradient;
                this.ctx.beginPath();
                this.ctx.arc(posX, posY, star.size * 4, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.beginPath();
            this.ctx.arc(posX, posY, Math.max(0.5, star.size), 0, Math.PI * 2);
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = starOpacity;
            this.ctx.fill();
        });

        this.ctx.globalAlpha = 1;
    }

    animateClouds() {
        // Rotate clouds in swirl pattern like constellations
        this.clouds.forEach(cloud => {
            const parallaxFactor = 0.5 + (cloud.depth * 0.5);
            const effectiveAngle = this.rotationAngle * parallaxFactor;

            const cos = Math.cos(effectiveAngle);
            const sin = Math.sin(effectiveAngle);
            cloud.x = cloud.originalX * cos - cloud.originalY * sin;
            cloud.y = cloud.originalX * sin + cloud.originalY * cos;

            const posX = this.centerX + cloud.x;
            const posY = this.centerY + cloud.y;

            // Calculate tangent direction for cloud orientation
            const tangentAngle = Math.atan2(cloud.y, cloud.x) + Math.PI / 2 + cloud.curve;
            const dirX = Math.cos(tangentAngle);
            const dirY = Math.sin(tangentAngle);
            const perpX = -dirY;
            const perpY = dirX;

            // Draw each puff as a soft fluffy circle along the cloud path
            cloud.puffs.forEach(puff => {
                const puffPosX = posX + dirX * cloud.length * (puff.t - 0.5) + perpX * puff.offset;
                const puffPosY = posY + dirY * cloud.length * (puff.t - 0.5) + perpY * puff.offset;

                // Combine cloud base opacity with per-puff opacity for natural variation
                const finalOpacity = cloud.opacity * puff.opacity;

                // Soft fluffy gradient with varied density
                const gradient = this.ctx.createRadialGradient(
                    puffPosX, puffPosY - puff.size * 0.15, 0,
                    puffPosX, puffPosY, puff.size * 1.2
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity * 0.95})`);
                gradient.addColorStop(0.25, `rgba(255, 255, 255, ${finalOpacity * 0.75})`);
                gradient.addColorStop(0.5, `rgba(255, 255, 255, ${finalOpacity * 0.45})`);
                gradient.addColorStop(0.75, `rgba(255, 255, 255, ${finalOpacity * 0.15})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(puffPosX, puffPosY, puff.size * 1.2, 0, Math.PI * 2);
                this.ctx.fill();
            });
        });
    }

    animateContrails() {
        this.contrails = this.contrails.filter(contrail => {
            contrail.x += contrail.vx;
            contrail.y += contrail.vy;
            contrail.life -= contrail.fadeRate;

            if (contrail.life <= 0) return false;

            // Calculate trail like shooting stars
            const distTraveled = Math.sqrt(
                Math.pow(contrail.x - contrail.startX, 2) +
                Math.pow(contrail.y - contrail.startY, 2)
            );
            const trailLength = Math.min(distTraveled, contrail.length);
            const speed = Math.sqrt(contrail.vx * contrail.vx + contrail.vy * contrail.vy);
            const dirX = contrail.vx / speed;
            const dirY = contrail.vy / speed;

            // Soft glow behind
            const glowGradient = this.ctx.createLinearGradient(
                contrail.x, contrail.y,
                contrail.x - dirX * trailLength * 0.5, contrail.y - dirY * trailLength * 0.5
            );
            glowGradient.addColorStop(0, `rgba(255, 255, 255, ${contrail.life * 0.15})`);
            glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.ctx.strokeStyle = glowGradient;
            this.ctx.lineWidth = contrail.thickness * 4;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(contrail.x, contrail.y);
            this.ctx.lineTo(contrail.x - dirX * trailLength * 0.5, contrail.y - dirY * trailLength * 0.5);
            this.ctx.stroke();

            // Main wispy trail
            const mainGradient = this.ctx.createLinearGradient(
                contrail.x, contrail.y,
                contrail.x - dirX * trailLength, contrail.y - dirY * trailLength
            );
            mainGradient.addColorStop(0, `rgba(255, 255, 255, ${contrail.life * contrail.opacity * 0.8})`);
            mainGradient.addColorStop(0.2, `rgba(255, 255, 255, ${contrail.life * contrail.opacity * 0.5})`);
            mainGradient.addColorStop(0.6, `rgba(255, 255, 255, ${contrail.life * contrail.opacity * 0.2})`);
            mainGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.ctx.strokeStyle = mainGradient;
            this.ctx.lineWidth = contrail.thickness;
            this.ctx.beginPath();
            this.ctx.moveTo(contrail.x, contrail.y);
            this.ctx.lineTo(contrail.x - dirX * trailLength, contrail.y - dirY * trailLength);
            this.ctx.stroke();

            // Small bright head
            const headGradient = this.ctx.createRadialGradient(
                contrail.x, contrail.y, 0,
                contrail.x, contrail.y, 6
            );
            headGradient.addColorStop(0, `rgba(255, 255, 255, ${contrail.life * 0.9})`);
            headGradient.addColorStop(0.5, `rgba(255, 255, 255, ${contrail.life * 0.4})`);
            headGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.ctx.fillStyle = headGradient;
            this.ctx.beginPath();
            this.ctx.arc(contrail.x, contrail.y, 6, 0, Math.PI * 2);
            this.ctx.fill();

            return true;
        });
    }

    animateShootingStars() {
        this.shootingStars = this.shootingStars.filter(star => {
            star.x += star.vx;
            star.y += star.vy;
            star.life -= star.fadeRate;

            star.scale = Math.max(0.2, star.scale * 0.998);
            star.opacity = Math.pow(star.life, 0.6) * star.scale * 0.85;
            star.headOpacity = Math.max(0, Math.pow(star.life, 1.5) * star.opacity);
            star.tailOpacity = Math.max(0, star.opacity);

            if (star.life <= 0 || star.x < -200 || star.x > this.canvas.width + 200 ||
                star.y < -200 || star.y > this.canvas.height + 200) return false;

            const currentScale = star.scale;
            const distTraveled = Math.sqrt(Math.pow(star.x - star.startX, 2) + Math.pow(star.y - star.startY, 2));
            const trailLength = Math.min(distTraveled, star.length);
            const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
            const dirX = star.vx / speed;
            const dirY = star.vy / speed;

            // Glow
            const glowGradient = this.ctx.createLinearGradient(
                star.x, star.y, star.x - dirX * trailLength * 0.4, star.y - dirY * trailLength * 0.4
            );
            glowGradient.addColorStop(0, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.tailOpacity * 0.12})`);
            glowGradient.addColorStop(1, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, 0)`);

            this.ctx.strokeStyle = glowGradient;
            this.ctx.lineWidth = star.thickness * 7 * currentScale;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(star.x, star.y);
            this.ctx.lineTo(star.x - dirX * trailLength * 0.4, star.y - dirY * trailLength * 0.4);
            this.ctx.stroke();

            // Main trail
            const mainGradient = this.ctx.createLinearGradient(
                star.x, star.y, star.x - dirX * trailLength, star.y - dirY * trailLength
            );
            mainGradient.addColorStop(0, `rgba(255, 255, 255, ${star.tailOpacity * 0.65})`);
            mainGradient.addColorStop(0.1, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.tailOpacity * 0.5})`);
            mainGradient.addColorStop(0.4, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.tailOpacity * 0.2})`);
            mainGradient.addColorStop(1, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, 0)`);

            this.ctx.strokeStyle = mainGradient;
            this.ctx.lineWidth = star.thickness * 2 * currentScale;
            this.ctx.beginPath();
            this.ctx.moveTo(star.x, star.y);
            this.ctx.lineTo(star.x - dirX * trailLength, star.y - dirY * trailLength);
            this.ctx.stroke();

            // Head
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.headOpacity * 0.8})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, 1.2 * currentScale, 0, Math.PI * 2);
            this.ctx.fill();

            return true;
        });
    }
}

// Scroll Manager
class ScrollManager {
    constructor() {
        this.container = document.querySelector('.scroll-container');
        this.sections = document.querySelectorAll('.scroll-section');
        this.indicators = document.querySelectorAll('.indicator');
        this.init();
    }

    init() {
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.sections[index]?.scrollIntoView({ behavior: 'smooth' });
            });
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Add/remove visible class for section animations
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    const sectionIndex = parseInt(entry.target.dataset.section);
                    this.indicators.forEach((ind, i) => {
                        ind.classList.toggle('active', i === sectionIndex);
                    });
                }
            });
        }, { root: this.container, threshold: 0.3 });

        this.sections.forEach(section => observer.observe(section));

        // Make first section visible immediately
        if (this.sections[0]) {
            this.sections[0].classList.add('visible');
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const themeController = new ThemeController();
    new SkyAnimation(themeController);
    new ScrollManager();

    // Email copy
    const emailButton = document.querySelector('.email-copy');
    if (emailButton) {
        const copyEmail = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const email = emailButton.getAttribute('data-email');
            const label = emailButton.querySelector('.icon-label');
            const originalLabel = label?.textContent || '';

            try {
                await navigator.clipboard.writeText(email);
                emailButton.classList.add('copied');
                emailButton.setAttribute('data-tooltip', 'Copied!');
                if (label) label.textContent = 'Copied!';

                setTimeout(() => {
                    emailButton.classList.remove('copied');
                    emailButton.setAttribute('data-tooltip', 'Copy email');
                    if (label) label.textContent = originalLabel;
                }, 2000);
            } catch (err) {
                const textArea = document.createElement('textarea');
                textArea.value = email;
                textArea.style.cssText = 'position:fixed;left:-9999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                emailButton.classList.add('copied');
                if (label) label.textContent = 'Copied!';
                setTimeout(() => {
                    emailButton.classList.remove('copied');
                    if (label) label.textContent = originalLabel;
                }, 2000);
            }
        };

        emailButton.addEventListener('click', copyEmail);
        emailButton.addEventListener('touchend', (e) => { e.preventDefault(); copyEmail(e); });
    }

    // Profile fallback
    const profilePic = document.getElementById('profile-pic');
    if (profilePic) {
        profilePic.addEventListener('error', () => {
            const placeholder = document.createElement('div');
            placeholder.style.cssText = 'width:140px;height:140px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;font-size:3rem;font-weight:bold;color:white;border:2px solid var(--border-color)';
            placeholder.textContent = 'RM';
            profilePic.parentNode.replaceChild(placeholder, profilePic);
        });
    }
});
