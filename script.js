// Theme Toggle Controller - Animated dark/light transition
class ThemeToggleController {
    constructor() {
        this.toggleBtn = document.getElementById('theme-toggle-btn');
        this.moonIcon = document.getElementById('theme-icon-moon');
        this.sunIcon = document.getElementById('theme-icon-sun');
        this.animation = null;
        this.animationFrame = null;
        this.currentValue = 0; // 0 = dark, 100 = light
        this.isAnimating = false;

        // Sky transition keyframes - controls stars and clouds opacity
        this.skyKeyframes = {
            0: { // Deep night - dark blue
                sky: ['#0a0a15', '#0f0f1a'],
                stars: 1,
                clouds: 0
            },
            15: { // Night - subtle purple hint
                sky: ['#12122a', '#1a1a35'],
                stars: 1,
                clouds: 0
            },
            30: { // Pre-dawn - deep purple - stars still strong
                sky: ['#1e1540', '#2d2055'],
                stars: 0.95,
                clouds: 0
            },
            42: { // Aurora/twilight - stars start fading, clouds whisper in
                sky: ['#3d2860', '#5a3575'],
                stars: 0.75,
                clouds: 0.02
            },
            52: { // Early sunrise - stars fading but still visible
                sky: ['#6b4070', '#c45c80'],
                stars: 0.45,
                clouds: 0.05
            },
            62: { // Sunrise - warm pink and peach - stars nearly gone
                sky: ['#d4728c', '#f0a090'],
                stars: 0.15,
                clouds: 0.1
            },
            72: { // Golden hour - soft warm tones - last traces of stars
                sky: ['#e8a088', '#b8d8d0'],
                stars: 0.03,
                clouds: 0.2
            },
            82: { // Morning - transitioning to blue
                sky: ['#90c8d0', '#a8dce8'],
                stars: 0,
                clouds: 0.35
            },
            92: { // Late morning - almost day
                sky: ['#85cfeb', '#c0e8f5'],
                stars: 0,
                clouds: 0.55
            },
            100: { // Full day - bright sky blue - clouds reach full opacity
                sky: ['#87ceeb', '#e8f4fc'],
                stars: 0,
                clouds: 1
            }
        };

        this.init();
    }

    init() {
        // Check for saved preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            this.currentValue = 100;
            document.body.classList.add('light-mode');
            this.setThemeColor('#e8f4fc');
        }

        // Set initial icon state
        this.updateIcons();

        // Toggle button click
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', (e) => {
                // Allow interrupting - determine target based on current value
                if (this.currentValue > 50) {
                    // Currently light (or heading light), go to dark
                    this.animateTransition(0);
                } else {
                    // Currently dark (or heading dark), go to light
                    this.animateTransition(100);
                }
            });
        }
    }

    animateTransition(targetValue) {
        // Cancel any existing animation
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.isAnimating = true;
        this.transitionDirection = targetValue > this.currentValue ? 'toDay' : 'toNight';

        // Disable button during transition
        if (this.toggleBtn) {
            this.toggleBtn.classList.add('transitioning');
        }

        const startValue = this.currentValue;
        const diff = targetValue - startValue;
        // Scale duration based on how far we need to travel (for smoother interrupts)
        const fullDuration = 2500;
        const duration = Math.abs(diff / 100) * fullDuration;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Sine ease-in-out - starts noticeably, smooth throughout
            const eased = -(Math.cos(Math.PI * progress) - 1) / 2;

            this.currentValue = Math.round(startValue + diff * eased);
            this.updateSky();
            this.updateBodyClass();
            this.updateIcons();

            if (progress < 1) {
                this.animationFrame = requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
                this.animationFrame = null;
                // Re-enable button after transition
                if (this.toggleBtn) {
                    this.toggleBtn.classList.remove('transitioning');
                }
            }
        };

        this.animationFrame = requestAnimationFrame(animate);
    }

    updateIcons() {
        if (!this.moonIcon || !this.sunIcon) return;

        // Progress from 0 (dark/moon) to 100 (light/sun)
        const progress = this.currentValue / 100;

        // Spin in place - icons rotate on their own axis while crossfading
        const moonOpacity = 1 - progress;
        const moonRotation = progress * 360; // Full rotation as it fades out

        const sunOpacity = progress;
        const sunRotation = -360 + (progress * 360); // Rotates in as it fades in

        // Apply transforms
        this.moonIcon.style.opacity = moonOpacity;
        this.moonIcon.style.transform = `rotate(${moonRotation}deg)`;

        this.sunIcon.style.opacity = sunOpacity;
        this.sunIcon.style.transform = `rotate(${sunRotation}deg)`;

        // Color transition matching sky colors
        const moonColor = this.interpolateColor('#a0c4ff', '#c4b5fd', progress);
        const sunColor = this.interpolateColor('#ff8c42', '#ffd93d', progress);

        this.moonIcon.style.color = moonColor;
        this.sunIcon.style.color = sunColor;
    }

    interpolateColor(color1, color2, progress) {
        // Parse hex colors
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);

        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);

        // Interpolate
        const r = Math.round(r1 + (r2 - r1) * progress);
        const g = Math.round(g1 + (g2 - g1) * progress);
        const b = Math.round(b1 + (b2 - b1) * progress);

        return `rgb(${r}, ${g}, ${b})`;
    }

    updateBodyClass() {
        if (this.currentValue > 50) {
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
            this.setThemeColor('#e8f4fc');
        } else {
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
            this.setThemeColor('#0a0a0a');
        }
    }

    setThemeColor(color) {
        let meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.remove();
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = color;
        document.head.appendChild(meta);
    }

    updateSky() {
        if (!this.animation) return;
        const skyState = this.interpolateSkyState(this.currentValue);
        this.animation.setTimeOfDay(skyState);
    }

    interpolateSkyState(value) {
        const keyframes = Object.keys(this.skyKeyframes).map(Number).sort((a, b) => a - b);

        let lowerKey = keyframes[0];
        let upperKey = keyframes[keyframes.length - 1];

        for (let i = 0; i < keyframes.length - 1; i++) {
            if (value >= keyframes[i] && value <= keyframes[i + 1]) {
                lowerKey = keyframes[i];
                upperKey = keyframes[i + 1];
                break;
            }
        }

        const lowerState = this.skyKeyframes[lowerKey];
        const upperState = this.skyKeyframes[upperKey];

        const range = upperKey - lowerKey;
        const t = range === 0 ? 0 : (value - lowerKey) / range;

        const skyTop = this.interpolateColor(lowerState.sky[0], upperState.sky[0], t);
        const skyBottom = this.interpolateColor(lowerState.sky[1], upperState.sky[1], t);
        const stars = lowerState.stars + (upperState.stars - lowerState.stars) * t;
        const clouds = lowerState.clouds + (upperState.clouds - lowerState.clouds) * t;

        return { skyTop, skyBottom, stars, clouds, value };
    }

    interpolateColor(color1, color2, t) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);
        return `rgb(${r}, ${g}, ${b})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    getInterpolatedValue(property) {
        const state = this.interpolateSkyState(this.currentValue);
        return state[property] || 0;
    }

    setAnimation(animation) {
        this.animation = animation;
        this.updateSky();
    }

    getTheme() {
        return this.currentValue > 50 ? 'light' : 'dark';
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
        // Random direction on each page load
        const baseSpeed = this.isMobile ? 0.002 : 0.0005;
        this.rotationSpeed = Math.random() < 0.5 ? baseSpeed : -baseSpeed;

        // Dark mode: stars and constellations
        this.stars = [];
        this.connections = [];
        this.numStars = this.isMobile ? 140 : 600;
        this.shootingStars = [];

        // Light mode: clouds (image-based)
        this.clouds = [];
        this.cloudImages = {};
        this.cloudImagesLoaded = false;
        this.contrails = []; // Plane streaks
        this.butterflies = []; // Flying butterflies

        // Cloud image definitions - categorized by type
        this.cloudAssets = {
            large: ['Cloud_0001.jpg', 'Cloud_0010.jpg', 'Cloud_0062.jpg'],
            medium: ['Cloud_0050.jpg', 'Cloud_0015.jpg', 'Cloud_0025.jpg', 'Cloud_0035.jpg', 'Cloud_0045.jpg'],
            wispy: ['Cloud_0091.jpg'],
            hazy: ['Cloud_0091.jpg']
        };

        // Time of day mode
        this.timeOfDayState = null; // null = use theme, object = use time-based rendering

        this.preloadCloudImages();
        this.init();
        this.setupEventListeners();
        this.animate();

        window.animation = this;
    }

    preloadCloudImages() {
        const allImages = [
            ...this.cloudAssets.large,
            ...this.cloudAssets.medium,
            ...this.cloudAssets.wispy,
            ...this.cloudAssets.hazy
        ];

        let loadedCount = 0;
        const totalImages = allImages.length;

        allImages.forEach(filename => {
            const img = new Image();
            img.onload = () => {
                this.cloudImages[filename] = img;
                loadedCount++;
                if (loadedCount === totalImages) {
                    this.cloudImagesLoaded = true;
                    this.createClouds(); // Recreate clouds once images are loaded
                }
            };
            img.onerror = () => {
                console.warn('Failed to load cloud image:', filename);
                loadedCount++;
                if (loadedCount === totalImages) {
                    this.cloudImagesLoaded = true;
                }
            };
            img.src = `clouds/${filename}`;
        });
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
        // Clear time of day mode when theme changes
        this.timeOfDayState = null;
    }

    setTimeOfDay(state) {
        this.timeOfDayState = state;
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = Math.max(window.innerHeight, document.documentElement.clientHeight);
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
        const connectionDistance = this.isMobile ? 90 : 110;

        // First pass: create all potential connections
        const potentialConnections = [];
        for (let i = 0; i < this.stars.length; i++) {
            for (let j = i + 1; j < this.stars.length; j++) {
                if (this.stars[i].isFaint || this.stars[j].isFaint) continue;

                const dx = this.stars[i].originalX - this.stars[j].originalX;
                const dy = this.stars[i].originalY - this.stars[j].originalY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    potentialConnections.push({
                        star1: i, star2: j,
                        opacity: 0.12 * (1 - distance / connectionDistance)
                    });
                }
            }
        }

        // Build adjacency list for connected components
        const adjacency = {};
        potentialConnections.forEach(conn => {
            if (!adjacency[conn.star1]) adjacency[conn.star1] = [];
            if (!adjacency[conn.star2]) adjacency[conn.star2] = [];
            adjacency[conn.star1].push(conn.star2);
            adjacency[conn.star2].push(conn.star1);
        });

        // Find connected components using BFS
        const visited = new Set();
        const starToComponent = {};
        let componentId = 0;
        const componentSizes = {};

        Object.keys(adjacency).forEach(startStar => {
            if (visited.has(Number(startStar))) return;

            const queue = [Number(startStar)];
            const component = [];

            while (queue.length > 0) {
                const star = queue.shift();
                if (visited.has(star)) continue;
                visited.add(star);
                component.push(star);
                starToComponent[star] = componentId;

                (adjacency[star] || []).forEach(neighbor => {
                    if (!visited.has(neighbor)) queue.push(neighbor);
                });
            }

            componentSizes[componentId] = component.length;
            componentId++;
        });

        // Only keep connections from components with 3+ stars
        this.connections = potentialConnections.filter(conn =>
            componentSizes[starToComponent[conn.star1]] >= 3
        );
    }

    createShootingStar(clickX, clickY) {
        const angle = Math.random() * Math.PI * 2;
        const speed = this.isMobile ? (0.9 + Math.random() * 0.6) : (0.35 + Math.random() * 0.4);
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
            length, thickness: 0.9 + Math.random() * 0.6,
            opacity: 0.9, life: 1,
            fadeRate: this.isMobile ? 0.0025 : 0.0004,
            color, scale: 1
        });
    }

    // ========== LIGHT MODE: Clouds (Image-based) ==========

    createClouds() {
        this.clouds = [];

        // Don't create clouds until images are loaded
        if (!this.cloudImagesLoaded) return;

        const maxDimension = Math.max(this.canvas.width, this.canvas.height);

        // Create 2-3 TIGHT cloud clusters (bunched up clouds)
        const numTightClusters = this.isMobile ? 2 : 3;

        for (let c = 0; c < numTightClusters; c++) {
            const clusterAngle = (c / numTightClusters) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
            const clusterRadius = 100 + Math.random() * maxDimension * 0.25;
            const clusterX = Math.cos(clusterAngle) * clusterRadius;
            const clusterY = Math.sin(clusterAngle) * clusterRadius;
            const clusterSize = 80 + Math.random() * 60; // Tighter clusters

            // 1-2 large clouds per tight cluster
            const numLarge = 1 + Math.floor(Math.random() * 2);
            for (let i = 0; i < numLarge; i++) {
                const offsetAngle = Math.random() * Math.PI * 2;
                const offsetDist = Math.random() * clusterSize * 0.25;
                this.addImageCloud(
                    clusterX + Math.cos(offsetAngle) * offsetDist,
                    clusterY + Math.sin(offsetAngle) * offsetDist,
                    'large'
                );
            }

            // 3-5 medium clouds bunched around the large ones
            const numMedium = this.isMobile ? 2 : (3 + Math.floor(Math.random() * 3));
            for (let i = 0; i < numMedium; i++) {
                const offsetAngle = Math.random() * Math.PI * 2;
                const offsetDist = Math.random() * clusterSize * 0.5;
                this.addImageCloud(
                    clusterX + Math.cos(offsetAngle) * offsetDist,
                    clusterY + Math.sin(offsetAngle) * offsetDist,
                    'medium'
                );
            }
        }

        // Add isolated drifting clouds in mid-range (not too far out)
        const numDrifting = this.isMobile ? 3 : 6;
        for (let i = 0; i < numDrifting; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 180 + Math.random() * maxDimension * 0.2; // Keep in mid-range only
            const type = Math.random() > 0.4 ? 'medium' : 'large';
            this.addImageCloud(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                type
            );
        }

        // Add hazy atmosphere clouds scattered everywhere
        const numHazy = this.isMobile ? 30 : 25;
        for (let i = 0; i < numHazy; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 100 + Math.random() * maxDimension * 0.7; // Everywhere
            this.addImageCloud(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                'hazy'
            );
        }

        // Add distant semi-transparent clouds scattered everywhere
        const numDistant = this.isMobile ? 35 : 30;
        for (let i = 0; i < numDistant; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 150 + Math.random() * maxDimension * 0.8; // Everywhere
            this.addImageCloud(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                'distant'
            );
        }

        // Sort clouds by depth (furthest first)
        this.clouds.sort((a, b) => a.depth - b.depth);
    }

    addImageCloud(x, y, type) {
        // Select a random image from the appropriate category
        let imageList;
        let scale, opacity, depth;

        if (type === 'large') {
            imageList = this.cloudAssets.large;
            scale = this.isMobile ? (0.15 + Math.random() * 0.1) : (0.3 + Math.random() * 0.2);
            opacity = 0.9 + Math.random() * 0.1;
            depth = 0.6 + Math.random() * 0.4;
        } else if (type === 'medium') {
            imageList = this.cloudAssets.medium;
            scale = this.isMobile ? (0.08 + Math.random() * 0.07) : (0.15 + Math.random() * 0.15);
            opacity = 0.8 + Math.random() * 0.15;
            depth = 0.4 + Math.random() * 0.4;
        } else if (type === 'wispy') {
            imageList = this.cloudAssets.wispy;
            scale = this.isMobile ? (0.1 + Math.random() * 0.08) : (0.2 + Math.random() * 0.15);
            opacity = 0.4 + Math.random() * 0.3;
            depth = 0.2 + Math.random() * 0.3;
        } else if (type === 'distant') {
            // Super soft foggy clouds - use hazy asset, very transparent
            imageList = this.cloudAssets.hazy; // Use soft hazy image, not medium
            scale = this.isMobile ? (0.25 + Math.random() * 0.2) : (0.5 + Math.random() * 0.4);
            opacity = 0.2 + Math.random() * 0.35; // 20-55% opacity
            depth = 0.1 + Math.random() * 0.2;
        } else { // hazy
            imageList = this.cloudAssets.hazy;
            scale = this.isMobile ? (0.3 + Math.random() * 0.2) : (0.6 + Math.random() * 0.4);
            opacity = 0.2 + Math.random() * 0.35; // 20-55% opacity
            depth = 0.05 + Math.random() * 0.15;
        }

        const imageName = imageList[Math.floor(Math.random() * imageList.length)];
        const image = this.cloudImages[imageName];

        if (!image) return;

        this.clouds.push({
            x: x,
            y: y,
            originalX: x,
            originalY: y,
            image: image,
            scale: scale,
            baseOpacity: opacity, // Store base opacity
            cloudType: type, // Store type for transition timing
            depth: depth,
            rotation: (Math.random() - 0.5) * 0.3, // Slight rotation variation
            flipX: Math.random() > 0.5, // Random horizontal flip for variety
            driftX: (Math.random() - 0.5) * 0.005,
            driftY: (Math.random() - 0.5) * 0.003,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.0003 + Math.random() * 0.0002
        });
    }

    addNaturalCloud(x, y, type) {
        const now = Date.now();
        let cloud = {
            x: x,
            y: y,
            originalX: x,
            originalY: y,
            depth: 0.3 + Math.random() * 0.7,
            tint: { r: 255, g: 255, b: 255 },
            morphPhase: Math.random() * Math.PI * 2,
            morphSpeed: 0.0002 + Math.random() * 0.0003,
            driftX: (Math.random() - 0.5) * 0.008,
            driftY: (Math.random() - 0.5) * 0.005,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.0004 + Math.random() * 0.0003,
            birthTime: now,
            puffs: []
        };

        if (type === 'large') {
            cloud.opacity = 0.95;
            const baseWidth = 220 + Math.random() * 180;
            const baseHeight = 200 + Math.random() * 140;

            // Create irregular lobe structure for cauliflower shape
            const numLobes = 6 + Math.floor(Math.random() * 5);
            const lobes = [];

            for (let l = 0; l < numLobes; l++) {
                const lobeAngle = (l / numLobes) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
                const lobeDist = 0.35 + Math.random() * 0.45;
                const lobeSize = 0.4 + Math.random() * 0.6;
                lobes.push({
                    x: Math.cos(lobeAngle) * lobeDist * baseWidth * 0.45,
                    y: Math.sin(lobeAngle) * lobeDist * baseHeight * 0.4 - baseHeight * 0.12,
                    size: lobeSize,
                    angle: lobeAngle
                });
            }

            // Main body puffs around each lobe
            lobes.forEach(lobe => {
                const puffsPerLobe = 6 + Math.floor(Math.random() * 5);
                for (let p = 0; p < puffsPerLobe; p++) {
                    const puffAngle = Math.random() * Math.PI * 2;
                    const puffDist = Math.random() * 40 * lobe.size;
                    const size = (28 + Math.random() * 38) * lobe.size;
                    const isOuter = puffDist > 25 * lobe.size;

                    cloud.puffs.push({
                        offsetX: lobe.x + Math.cos(puffAngle) * puffDist,
                        offsetY: lobe.y + Math.sin(puffAngle) * puffDist,
                        baseSize: size,
                        opacity: isOuter ? (0.7 + Math.random() * 0.25) : (0.85 + Math.random() * 0.15),
                        morphOffset: Math.random() * Math.PI * 2,
                        puffType: isOuter ? 'edge' : 'body',
                        shadowAmount: 0.1 + (lobe.y / baseHeight) * 0.15 // More shadow on bottom
                    });
                }

                // Add wispy trailing bits at some lobe edges
                if (Math.random() > 0.4) {
                    const numWisps = 2 + Math.floor(Math.random() * 3);
                    for (let w = 0; w < numWisps; w++) {
                        const wispAngle = lobe.angle + (Math.random() - 0.5) * 0.8;
                        const wispDist = 45 * lobe.size + Math.random() * 30;
                        const wispSize = 8 + Math.random() * 15;
                        cloud.puffs.push({
                            offsetX: lobe.x + Math.cos(wispAngle) * wispDist,
                            offsetY: lobe.y + Math.sin(wispAngle) * wispDist,
                            baseSize: wispSize,
                            opacity: 0.3 + Math.random() * 0.3,
                            morphOffset: Math.random() * Math.PI * 2,
                            puffType: 'wisp',
                            shadowAmount: 0
                        });
                    }
                }

                // Add cotton-candy tufts at some edges
                if (Math.random() > 0.5) {
                    const numTufts = 1 + Math.floor(Math.random() * 2);
                    for (let t = 0; t < numTufts; t++) {
                        const tuftAngle = lobe.angle + (Math.random() - 0.5) * 0.5;
                        const tuftDist = 35 * lobe.size + Math.random() * 25;
                        // Tufts are clusters of small puffs
                        for (let tp = 0; tp < 4; tp++) {
                            const tpAngle = Math.random() * Math.PI * 2;
                            const tpDist = Math.random() * 12;
                            cloud.puffs.push({
                                offsetX: lobe.x + Math.cos(tuftAngle) * tuftDist + Math.cos(tpAngle) * tpDist,
                                offsetY: lobe.y + Math.sin(tuftAngle) * tuftDist + Math.sin(tpAngle) * tpDist,
                                baseSize: 10 + Math.random() * 14,
                                opacity: 0.6 + Math.random() * 0.3,
                                morphOffset: Math.random() * Math.PI * 2,
                                puffType: 'tuft',
                                shadowAmount: 0.05
                            });
                        }
                    }
                }
            });

            // Dense center fill with varied opacity for internal texture
            const centerPuffs = 18 + Math.floor(Math.random() * 12);
            for (let i = 0; i < centerPuffs; i++) {
                const px = (Math.random() - 0.5) * baseWidth * 0.45;
                const py = (Math.random() - 0.5) * baseHeight * 0.35 - baseHeight * 0.08;
                const size = 32 + Math.random() * 45;
                // Vary opacity to create internal depth/shadows
                const internalShadow = Math.random() > 0.7 ? 0.15 : 0;

                cloud.puffs.push({
                    offsetX: px,
                    offsetY: py,
                    baseSize: size,
                    opacity: 0.8 + Math.random() * 0.2 - internalShadow,
                    morphOffset: Math.random() * Math.PI * 2,
                    puffType: 'core',
                    shadowAmount: 0.08 + (py / baseHeight) * 0.12 + internalShadow
                });
            }

        } else if (type === 'medium') {
            cloud.opacity = 0.9;
            const baseWidth = 110 + Math.random() * 90;
            const baseHeight = 90 + Math.random() * 70;

            const numLobes = 3 + Math.floor(Math.random() * 3);
            for (let l = 0; l < numLobes; l++) {
                const lobeAngle = (l / numLobes) * Math.PI * 2 + (Math.random() - 0.5) * 0.9;
                const lobeDist = 0.28 + Math.random() * 0.4;
                const lobeX = Math.cos(lobeAngle) * lobeDist * baseWidth * 0.45;
                const lobeY = Math.sin(lobeAngle) * lobeDist * baseHeight * 0.38 - 12;

                const puffsPerLobe = 4 + Math.floor(Math.random() * 4);
                for (let p = 0; p < puffsPerLobe; p++) {
                    const puffAngle = Math.random() * Math.PI * 2;
                    const puffDist = Math.random() * 28;
                    const size = 18 + Math.random() * 28;
                    const isOuter = puffDist > 18;

                    cloud.puffs.push({
                        offsetX: lobeX + Math.cos(puffAngle) * puffDist,
                        offsetY: lobeY + Math.sin(puffAngle) * puffDist,
                        baseSize: size,
                        opacity: isOuter ? (0.65 + Math.random() * 0.25) : (0.8 + Math.random() * 0.2),
                        morphOffset: Math.random() * Math.PI * 2,
                        puffType: isOuter ? 'edge' : 'body',
                        shadowAmount: 0.08 + (lobeY / baseHeight) * 0.1
                    });
                }

                // Occasional wisps
                if (Math.random() > 0.6) {
                    const wispAngle = lobeAngle + (Math.random() - 0.5) * 0.6;
                    const wispDist = 32 + Math.random() * 20;
                    cloud.puffs.push({
                        offsetX: lobeX + Math.cos(wispAngle) * wispDist,
                        offsetY: lobeY + Math.sin(wispAngle) * wispDist,
                        baseSize: 7 + Math.random() * 10,
                        opacity: 0.25 + Math.random() * 0.25,
                        morphOffset: Math.random() * Math.PI * 2,
                        puffType: 'wisp',
                        shadowAmount: 0
                    });
                }
            }

            // Center fill
            for (let i = 0; i < 7; i++) {
                const size = 22 + Math.random() * 28;
                cloud.puffs.push({
                    offsetX: (Math.random() - 0.5) * 35,
                    offsetY: (Math.random() - 0.5) * 28 - 6,
                    baseSize: size,
                    opacity: 0.85 + Math.random() * 0.15,
                    morphOffset: Math.random() * Math.PI * 2,
                    puffType: 'core',
                    shadowAmount: 0.1
                });
            }

        } else if (type === 'wispy') {
            cloud.opacity = 0.35 + Math.random() * 0.2;
            const length = 130 + Math.random() * 110;
            const angle = Math.random() * Math.PI;
            const numPuffs = 10 + Math.floor(Math.random() * 6);

            for (let i = 0; i < numPuffs; i++) {
                const t = i / (numPuffs - 1);
                const size = 6 + Math.random() * 12;
                // Vary position more for wispy look
                const perpOffset = (Math.random() - 0.5) * 20 * (1 - Math.abs(t - 0.5) * 2);
                cloud.puffs.push({
                    offsetX: Math.cos(angle) * (t - 0.5) * length + Math.sin(angle) * perpOffset,
                    offsetY: Math.sin(angle) * (t - 0.5) * length * 0.25 - Math.cos(angle) * perpOffset,
                    baseSize: size,
                    opacity: 0.3 + Math.random() * 0.4,
                    morphOffset: Math.random() * Math.PI * 2,
                    puffType: 'wisp',
                    shadowAmount: 0
                });
            }

        } else if (type === 'small') {
            cloud.opacity = 0.8 + Math.random() * 0.15;
            const numPuffs = 7 + Math.floor(Math.random() * 5);

            for (let i = 0; i < numPuffs; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 22;
                const size = 12 + Math.random() * 18;
                cloud.puffs.push({
                    offsetX: Math.cos(angle) * dist,
                    offsetY: Math.sin(angle) * dist * 0.7 - 6,
                    baseSize: size,
                    opacity: 0.65 + Math.random() * 0.35,
                    morphOffset: Math.random() * Math.PI * 2,
                    puffType: dist > 14 ? 'edge' : 'body',
                    shadowAmount: 0.08
                });
            }

            // Add a wisp or two
            if (Math.random() > 0.5) {
                const wispAngle = Math.random() * Math.PI * 2;
                cloud.puffs.push({
                    offsetX: Math.cos(wispAngle) * 28,
                    offsetY: Math.sin(wispAngle) * 20,
                    baseSize: 6 + Math.random() * 8,
                    opacity: 0.2 + Math.random() * 0.2,
                    morphOffset: Math.random() * Math.PI * 2,
                    puffType: 'wisp',
                    shadowAmount: 0
                });
            }

        } else if (type === 'hazy') {
            cloud.opacity = 0.22 + Math.random() * 0.13;
            cloud.depth = 0.1 + Math.random() * 0.2;
            const numPuffs = 6 + Math.floor(Math.random() * 4);

            for (let i = 0; i < numPuffs; i++) {
                const size = 55 + Math.random() * 65;
                cloud.puffs.push({
                    offsetX: (Math.random() - 0.5) * 130,
                    offsetY: (Math.random() - 0.5) * 65,
                    baseSize: size,
                    opacity: 0.3 + Math.random() * 0.3,
                    morphOffset: Math.random() * Math.PI * 2,
                    puffType: 'haze',
                    shadowAmount: 0.05
                });
            }
        }

        this.clouds.push(cloud);
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
        } else if (distribution === 'swirl') {
            // Long wispy swirl clouds with trailing tails
            // These have a fluffy head and a long fading tail
            numPuffs = 10 + Math.floor(Math.random() * 8); // More puffs for the tail
            baseLength = 200 + Math.random() * 180; // Very long
            baseOpacity = 0.5 + Math.random() * 0.3;
            puffSizeRange = { min: 8, max: 50, isSwirl: true }; // Flag for special puff generation
            // Higher curve to follow circular motion - always curves in swirl direction
            curve = 0.4 + Math.random() * 0.5; // Positive curve for consistent swirl direction
        } else if (distribution === 'cumulus') {
            // Natural puffy cumulus clouds - round and billowy
            numPuffs = 8 + Math.floor(Math.random() * 6); // Many overlapping puffs
            baseLength = 60 + Math.random() * 50; // Shorter, rounder shape
            baseOpacity = 0.7 + Math.random() * 0.25;
            puffSizeRange = { min: 30, max: 70, isCumulus: true }; // Flag for cumulus puff generation
            curve = (Math.random() - 0.5) * 0.2; // Minimal curve for round shape
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
        const isSwirl = puffSizeRange.isSwirl;
        const isCumulus = puffSizeRange.isCumulus;

        for (let p = 0; p < numPuffs; p++) {
            const t = numPuffs > 1 ? p / (numPuffs - 1) : 0.5;
            const offsetVariance = puffSizeRange.max * 0.7;

            let actualT, offset, puffSize, puffOpacity;

            if (isCumulus) {
                // Cumulus clouds: irregular billowy arrangement like real clouds
                // Random scattered positions with more puffs overlapping
                actualT = 0.3 + Math.random() * 0.4; // Spread along cloud body
                offset = (Math.random() - 0.5) * offsetVariance * 0.8;

                // Vary sizes significantly for natural look
                const sizeVariation = 0.5 + Math.random() * 0.8;
                puffSize = (puffSizeRange.min + Math.random() * (puffSizeRange.max - puffSizeRange.min)) * sizeVariation;

                // Some puffs larger and brighter (the billowy tops)
                if (Math.random() > 0.6) {
                    puffSize *= 1.3;
                    offset *= 0.5; // Keep big ones more central
                }
                puffOpacity = 0.5 + Math.random() * 0.4;
            } else if (isSwirl) {
                // Swirl clouds: fluffy head transitioning to wispy tail
                actualT = t + (Math.random() - 0.5) * 0.1;
                const tailFactor = 1 - t;
                offset = (Math.random() - 0.5) * offsetVariance * tailFactor * 0.6;
                const headSize = puffSizeRange.max;
                const tailSize = puffSizeRange.min;
                puffSize = headSize * Math.pow(tailFactor, 0.7) + tailSize * (1 - Math.pow(tailFactor, 0.7));
                puffSize *= (0.8 + Math.random() * 0.4);
                puffOpacity = (0.8 * Math.pow(tailFactor, 0.5) + 0.2) * (0.7 + Math.random() * 0.3);
            } else {
                const irregularity = 0.25 + Math.random() * 0.15;
                actualT = t + (Math.random() - 0.5) * irregularity;
                offset = (Math.random() - 0.5) * offsetVariance * (0.8 + Math.random() * 0.4);
                const distFromCenter = Math.sqrt(
                    Math.pow((actualT - 0.5) * 2, 2) +
                    Math.pow(offset / offsetVariance, 2)
                );
                const centerBoost = Math.max(0, 1 - distFromCenter * 0.7);
                const randomVariation = 0.5 + Math.random() * 0.5;
                puffOpacity = (0.3 + centerBoost * 0.7) * randomVariation;
                puffSize = puffSizeRange.min + Math.random() * (puffSizeRange.max - puffSizeRange.min)
                          + Math.sin(t * Math.PI) * (puffSizeRange.max * 0.2) * (0.7 + Math.random() * 0.6);
            }

            puffs.push({
                t: actualT,
                offset: offset,
                size: puffSize,
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
            puffs: puffs,
            // Add subtle color tints for variety
            tint: this.getCloudTint()
        });
    }

    getCloudTint() {
        // Pure white clouds only
        return { r: 255, g: 255, b: 255 };
    }

    generateCloudPuffs() {
        // Not used in new design
        return [];
    }

    createContrail(clickX, clickY) {
        const angle = Math.random() * Math.PI * 2;
        const speed = this.isMobile ? (0.5 + Math.random() * 0.4) : (0.2 + Math.random() * 0.25);
        const length = this.isMobile ? (50 + Math.random() * 40) : (80 + Math.random() * 60);

        this.contrails.push({
            x: clickX, y: clickY, startX: clickX, startY: clickY,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            length: length,
            life: 1,
            fadeRate: this.isMobile ? 0.004 : 0.0008,
            thickness: 1.5 + Math.random() * 1.5,
            opacity: 0.8,
            scale: 1
        });
    }

    createButterfly(clickX, clickY) {
        // Pick a random direction to fly off screen
        const edgeAngles = [
            Math.random() * Math.PI * 0.5 - Math.PI * 0.75, // Top-ish
            Math.random() * Math.PI * 0.5 - Math.PI * 0.25, // Right-ish
            Math.random() * Math.PI * 0.5 + Math.PI * 0.25, // Bottom-ish
            Math.random() * Math.PI * 0.5 + Math.PI * 0.75  // Left-ish
        ];
        const targetAngle = edgeAngles[Math.floor(Math.random() * edgeAngles.length)];

        // Cute pastel butterfly colors
        const colors = [
            { primary: '#FFB6C1', secondary: '#FF69B4', accent: '#FFC0CB' }, // Pink
            { primary: '#E6E6FA', secondary: '#DDA0DD', accent: '#D8BFD8' }, // Lavender
            { primary: '#87CEEB', secondary: '#6BB3D9', accent: '#ADD8E6' }, // Sky blue
            { primary: '#FFDAB9', secondary: '#FFE4B5', accent: '#FFEC8B' }, // Peach
            { primary: '#F0E68C', secondary: '#EEE8AA', accent: '#FFFACD' }, // Butter yellow
            { primary: '#E0BBE4', secondary: '#D291BC', accent: '#FEC8D8' }  // Orchid
        ];
        const colorScheme = colors[Math.floor(Math.random() * colors.length)];

        const speed = this.isMobile ? (0.9 + Math.random() * 0.5) : (0.5 + Math.random() * 0.4);
        const size = this.isMobile ? (12 + Math.random() * 5) : (10 + Math.random() * 6);

        // More opaque on mobile for visibility
        const baseOpacity = this.isMobile ? 0.85 : 0.7;

        this.butterflies.push({
            x: clickX,
            y: clickY,
            vx: Math.cos(targetAngle) * speed,
            vy: Math.sin(targetAngle) * speed,
            size: size,
            baseOpacity: baseOpacity,
            colors: colorScheme,
            wingPhase: Math.random() * Math.PI * 2,
            wingSpeed: 0.2 + Math.random() * 0.15,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleAmount: 0.3 + Math.random() * 0.2,
            // Curved flight path parameters - more pronounced meandering
            curvePhase: Math.random() * Math.PI * 2,
            curveSpeed: 0.015 + Math.random() * 0.01,
            curveAmount: 0.04 + Math.random() * 0.03,
            rotation: targetAngle,
            opacity: 1,
            birthTime: Date.now()
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

                // On mobile, ignore height-only changes (address bar hide/show)
                if (this.isMobile && widthChange < 10) {
                    return;
                }

                if (widthChange > 100 || heightChange > 100) {
                    this.resizeCanvas();
                    this.createStars();
                    this.createConnections();
                    this.createClouds();
                    lastWidth = this.canvas.width;
                    lastHeight = this.canvas.height;
                } else if (widthChange >= 10) {
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
            target?.tagName === 'INPUT' ||
            target?.closest('a') ||
            target?.closest('button') ||
            target?.closest('.icon-link') ||
            target?.closest('.indicator') ||
            target?.closest('.theme-toggle-container') ||
            target?.closest('.theme-toggle-btn');

        // Create effects on non-interactive clicks
        if (!isInteractive) {
            if (this.themeController.getTheme() === 'light') {
                this.createButterfly(x, y);
            } else {
                this.createShootingStar(x, y);
            }
        }
    }

    // ========== Animation Loop ==========

    animate() {
        // Check if we're in time-of-day mode
        if (this.timeOfDayState) {
            this.animateTimeOfDay();
        } else {
            const isLight = this.themeController.getTheme() === 'light';

            // Clear with appropriate background
            if (isLight) {
                this.drawDaySky();
                this.animateClouds();
                this.animateContrails();
                this.animateButterflies();
            } else {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.animateStars();
                this.animateShootingStars();
            }
        }

        this.rotationAngle += this.rotationSpeed;
        requestAnimationFrame(() => this.animate());
    }

    drawDaySky() {
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
    }

    animateTimeOfDay() {
        const state = this.timeOfDayState;
        const sliderValue = state.value; // 0-100

        // Sky transition: night → aurora purple → soft sunrise → deep blue day
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.max(this.canvas.width, this.canvas.height) * 0.9;

        let topColor, bottomColor;

        if (sliderValue <= 25) {
            // Night phase - dark blue/indigo
            const t = sliderValue / 25;
            topColor = this.lerpColor('#0a0a12', '#15152a', t);
            bottomColor = this.lerpColor('#12121f', '#1e1e38', t);
        } else if (sliderValue <= 45) {
            // Aurora phase - purple/violet
            const t = (sliderValue - 25) / 20;
            topColor = this.lerpColor('#15152a', '#3a2855', t);
            bottomColor = this.lerpColor('#1e1e38', '#5a3a70', t);
        } else if (sliderValue <= 60) {
            // Sunrise phase - soft rose/pink (not brown/orange)
            const t = (sliderValue - 45) / 15;
            topColor = this.lerpColor('#3a2855', '#c88aa0', t);
            bottomColor = this.lerpColor('#5a3a70', '#e8b8c8', t);
        } else if (sliderValue <= 80) {
            // Transition to day - pink to sky blue
            const t = (sliderValue - 60) / 20;
            topColor = this.lerpColor('#c88aa0', '#4a90c0', t);
            bottomColor = this.lerpColor('#e8b8c8', '#88c8e8', t);
        } else {
            // Day phase - deep blue sky
            const t = (sliderValue - 80) / 20;
            topColor = this.lerpColor('#4a90c0', '#3080b8', t);
            bottomColor = this.lerpColor('#88c8e8', '#a8d8f0', t);
        }

        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
        gradient.addColorStop(0, topColor);
        gradient.addColorStop(1, bottomColor);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw stars with smooth opacity transition
        if (state.stars > 0) {
            // Get transition direction for asymmetric fading
            const goingToDay = this.themeController?.transitionDirection === 'toDay';

            let smoothStarOpacity;
            if (goingToDay) {
                // Going to day: stars linger longer, then fade out smoothly
                // Use a curve that keeps stars visible longer, then fades at the end
                const lingering = Math.pow(state.stars, 0.5); // Square root = slower initial fade
                smoothStarOpacity = (1 - Math.cos(lingering * Math.PI)) / 2; // Sine easing for smoothness
            } else {
                // Going to night: stars appear gradually with gentle ease-in
                const eased = Math.pow(state.stars, 1.5); // Slower initial appearance
                smoothStarOpacity = (1 - Math.cos(eased * Math.PI)) / 2;
            }

            this.ctx.save();
            this.ctx.globalAlpha = smoothStarOpacity;
            this.animateStars();
            this.ctx.restore();

            // Also draw shooting stars at night (using smooth opacity)
            if (smoothStarOpacity > 0.3) {
                this.animateShootingStars();
            }
        }

        // Draw clouds with opacity
        if (state.clouds > 0) {
            this.ctx.save();
            this.ctx.globalAlpha = state.clouds;
            this.animateClouds();
            this.ctx.restore();
        }

        // Always animate butterflies in day mode (they fly on top)
        if (state.clouds > 0) {
            this.animateButterflies();
        }
    }

    // Unused - kept for compatibility
    drawEdgeGlow(sliderValue) {
        return;
    }

    lerpColor(color1, color2, t) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        const r = Math.round(c1.r + (c2.r - c1.r) * Math.max(0, Math.min(1, t)));
        const g = Math.round(c1.g + (c2.g - c1.g) * Math.max(0, Math.min(1, t)));
        const b = Math.round(c1.b + (c2.b - c1.b) * Math.max(0, Math.min(1, t)));
        return `rgb(${r}, ${g}, ${b})`;
    }

    hexToRgb(hex) {
        // Handle rgb() format
        if (hex.startsWith('rgb')) {
            const match = hex.match(/(\d+),\s*(\d+),\s*(\d+)/);
            if (match) {
                return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
            }
        }
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    drawSunGlow(x, y, intensity, warmth) {
        // warmth: 1 = normal, 2 = sunrise/sunset warm colors
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.4;
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);

        if (warmth > 1.5) {
            // Warm sunrise/sunset colors
            gradient.addColorStop(0, `rgba(255, 200, 100, ${0.6 * intensity})`);
            gradient.addColorStop(0.2, `rgba(255, 150, 80, ${0.4 * intensity})`);
            gradient.addColorStop(0.4, `rgba(255, 100, 80, ${0.2 * intensity})`);
            gradient.addColorStop(0.7, `rgba(200, 80, 100, ${0.1 * intensity})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
            // Normal daytime sun
            gradient.addColorStop(0, `rgba(255, 255, 220, ${0.4 * intensity})`);
            gradient.addColorStop(0.3, `rgba(255, 250, 200, ${0.2 * intensity})`);
            gradient.addColorStop(0.6, `rgba(255, 245, 180, ${0.1 * intensity})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animateStars() {
        // Brightness boost: 20% base + additional 25% on mobile
        const brightnessBoost = this.isMobile ? 1.5 : 1.2;

        // Rotate stars
        this.stars.forEach(star => {
            const parallaxFactor = 0.5 + (star.depth * 0.5);
            const effectiveAngle = this.rotationAngle * parallaxFactor;

            const cos = Math.cos(effectiveAngle);
            const sin = Math.sin(effectiveAngle);
            star.x = star.originalX * cos - star.originalY * sin;
            star.y = star.originalX * sin + star.originalY * cos;

            star.size = star.baseSize * star.depth * (this.isMobile ? 1.25 : 1.1);
            const baseOpacity = 0.35 + (star.depth * 0.55);
            star.opacity = Math.min(1, (baseOpacity + Math.sin(Date.now() * star.twinkleSpeed) * 0.15) * brightnessBoost);
        });

        // Draw connections
        this.connections.forEach(conn => {
            const star1 = this.stars[conn.star1];
            const star2 = this.stars[conn.star2];
            if (!star1 || !star2) return;

            // Safety checks for valid positions
            if (isNaN(star1.x) || isNaN(star1.y) || isNaN(star2.x) || isNaN(star2.y)) return;

            const x1 = this.centerX + star1.x;
            const y1 = this.centerY + star1.y;
            const x2 = this.centerX + star2.x;
            const y2 = this.centerY + star2.y;

            // Skip if both stars are outside viewport
            if ((x1 < -50 && x2 < -50) || (x1 > this.canvas.width + 50 && x2 > this.canvas.width + 50) ||
                (y1 < -50 && y2 < -50) || (y1 > this.canvas.height + 50 && y2 > this.canvas.height + 50)) return;

            // Skip if stars are too close (prevents degenerate gradients)
            const dx = x2 - x1;
            const dy = y2 - y1;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 1) return;

            // Limit max line length to prevent unnaturally long lines
            const maxLineLength = this.isMobile ? 100 : 120;
            if (dist > maxLineLength) return;

            const opacity = conn.opacity * (this.isMobile ? 0.35 : 0.65) * brightnessBoost;
            if (opacity <= 0.001 || opacity > 1 || isNaN(opacity)) return;

            const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, star1.color);
            gradient.addColorStop(1, star2.color);

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = gradient;
            this.ctx.globalAlpha = Math.min(opacity, this.isMobile ? 0.5 : 0.75);
            this.ctx.lineWidth = this.isMobile ? 1.0 : 1.4;
            this.ctx.stroke();
        });

        this.ctx.globalAlpha = 1;

        // Draw stars
        this.stars.forEach(star => {
            if (!star || isNaN(star.x) || isNaN(star.y) || isNaN(star.size)) return;

            const posX = this.centerX + star.x;
            const posY = this.centerY + star.y;

            // Skip stars outside viewport with buffer
            if (posX < -100 || posX > this.canvas.width + 100 ||
                posY < -100 || posY > this.canvas.height + 100) return;

            const starOpacity = Math.max(0, Math.min(1, star.opacity || 0));
            if (starOpacity < 0.01) return;

            if (star.hasGlow && starOpacity > 0.05 && star.size > 0.5) {
                const glowSize = Math.min(star.size * 4, 50); // Cap glow size
                const glowGradient = this.ctx.createRadialGradient(posX, posY, 0, posX, posY, glowSize);
                glowGradient.addColorStop(0, star.color);
                glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                const glowOpacity = Math.min(1, starOpacity * (star.glowIntensity || 0.3) * brightnessBoost);
                this.ctx.globalAlpha = glowOpacity;
                this.ctx.fillStyle = glowGradient;
                this.ctx.beginPath();
                this.ctx.arc(posX, posY, glowSize, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.beginPath();
            this.ctx.arc(posX, posY, Math.max(0.5, Math.min(star.size, 10)), 0, Math.PI * 2);
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = starOpacity;
            this.ctx.fill();
        });

        this.ctx.globalAlpha = 1;
    }

    drawVortexCenter() {
        // Subtle rotating vortex effect at center
        const vortexSize = this.isMobile ? 120 : 180;

        // Outer soft glow
        const outerGlow = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, vortexSize * 1.5
        );
        outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
        outerGlow.addColorStop(0.4, 'rgba(255, 255, 255, 0.04)');
        outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.ctx.fillStyle = outerGlow;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, vortexSize * 1.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner brighter core
        const innerGlow = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, vortexSize * 0.5
        );
        innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
        innerGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
        innerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.ctx.fillStyle = innerGlow;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, vortexSize * 0.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Subtle spiral arms (rotating with the animation)
        const numArms = 3;
        for (let i = 0; i < numArms; i++) {
            const armAngle = this.rotationAngle * 0.5 + (i * Math.PI * 2 / numArms);

            // Draw curved spiral arm
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
            this.ctx.lineWidth = this.isMobile ? 15 : 25;
            this.ctx.lineCap = 'round';

            for (let t = 0; t <= 1; t += 0.05) {
                const spiralRadius = t * vortexSize * 1.2;
                const spiralAngle = armAngle + t * Math.PI * 0.8;
                const x = this.centerX + Math.cos(spiralAngle) * spiralRadius;
                const y = this.centerY + Math.sin(spiralAngle) * spiralRadius;

                if (t === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.stroke();
        }
    }

    animateClouds() {
        // Image-based cloud rendering
        if (!this.cloudImagesLoaded || this.clouds.length === 0) return;

        // Get current cloud visibility from theme controller
        const cloudVisibility = this.themeController ?
            this.themeController.getInterpolatedValue('clouds') : 1;

        // Get stable direction from theme controller
        const goingToDay = this.themeController?.transitionDirection === 'toDay';

        this.clouds.forEach(cloud => {
            // Skip if no image
            if (!cloud.image) return;

            // Calculate opacity based on cloud type and direction
            let typeMultiplier;
            if (cloud.cloudType === 'hazy' || cloud.cloudType === 'distant') {
                if (goingToDay) {
                    // Going to day: hazy appear early
                    typeMultiplier = Math.min(1, cloudVisibility * 4);
                } else {
                    // Going to night: hazy linger longer
                    typeMultiplier = Math.min(1, cloudVisibility * 6);
                }
            } else {
                if (goingToDay) {
                    // Going to day: solid clouds fade in smoothly
                    const delayed = Math.max(0, (cloudVisibility - 0.25) / 0.75);
                    const smooth = delayed <= 0 ? 0 : (1 - Math.cos(delayed * Math.PI)) / 2;
                    typeMultiplier = smooth * smooth;
                } else {
                    // Going to night: solid clouds linger much longer
                    const delayed = Math.max(0, cloudVisibility / 0.8);
                    const smooth = (1 - Math.cos(delayed * Math.PI)) / 2;
                    typeMultiplier = Math.sqrt(smooth); // Square root for slower fade out
                }
            }

            const finalOpacity = cloud.baseOpacity * typeMultiplier;

            // Skip if not visible
            if (finalOpacity < 0.01) return;

            // Update drift
            cloud.originalX += cloud.driftX;
            cloud.originalY += cloud.driftY;
            cloud.pulsePhase += cloud.pulseSpeed;

            // Apply rotation based on depth (parallax)
            const parallaxFactor = 0.2 + (cloud.depth * 0.8);
            const effectiveAngle = this.rotationAngle * parallaxFactor;

            const cos = Math.cos(effectiveAngle);
            const sin = Math.sin(effectiveAngle);
            cloud.x = cloud.originalX * cos - cloud.originalY * sin;
            cloud.y = cloud.originalX * sin + cloud.originalY * cos;

            const posX = this.centerX + cloud.x;
            const posY = this.centerY + cloud.y;

            // Subtle scale pulse
            const pulse = 1 + Math.sin(cloud.pulsePhase) * 0.02;
            const finalScale = cloud.scale * pulse;

            const imgWidth = cloud.image.width * finalScale;
            const imgHeight = cloud.image.height * finalScale;

            // Save context for transformations
            this.ctx.save();

            // Move to cloud position
            this.ctx.translate(posX, posY);

            // Apply rotation
            if (cloud.rotation) {
                this.ctx.rotate(cloud.rotation);
            }

            // Apply horizontal flip if needed
            if (cloud.flipX) {
                this.ctx.scale(-1, 1);
            }

            // Set opacity and blend mode
            this.ctx.globalAlpha = finalOpacity;
            this.ctx.globalCompositeOperation = 'screen'; // Makes black transparent

            // Draw the cloud image centered
            this.ctx.drawImage(
                cloud.image,
                -imgWidth / 2,
                -imgHeight / 2,
                imgWidth,
                imgHeight
            );

            // Restore context
            this.ctx.restore();
        });

        // Reset composite operation
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1;
    }

    animateContrails() {
        this.contrails = this.contrails.filter(contrail => {
            contrail.x += contrail.vx;
            contrail.y += contrail.vy;
            contrail.life -= contrail.fadeRate;

            // Scale decay like shooting stars
            contrail.scale = Math.max(0.2, contrail.scale * 0.998);
            const currentOpacity = Math.pow(contrail.life, 0.6) * contrail.scale * contrail.opacity;

            if (contrail.life <= 0 || contrail.x < -200 || contrail.x > this.canvas.width + 200 ||
                contrail.y < -200 || contrail.y > this.canvas.height + 200) return false;

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
                contrail.x - dirX * trailLength * 0.4, contrail.y - dirY * trailLength * 0.4
            );
            glowGradient.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity * 0.12})`);
            glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.ctx.strokeStyle = glowGradient;
            this.ctx.lineWidth = contrail.thickness * 5 * contrail.scale;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(contrail.x, contrail.y);
            this.ctx.lineTo(contrail.x - dirX * trailLength * 0.4, contrail.y - dirY * trailLength * 0.4);
            this.ctx.stroke();

            // Main wispy trail
            const mainGradient = this.ctx.createLinearGradient(
                contrail.x, contrail.y,
                contrail.x - dirX * trailLength, contrail.y - dirY * trailLength
            );
            mainGradient.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity * 0.65})`);
            mainGradient.addColorStop(0.1, `rgba(255, 255, 255, ${currentOpacity * 0.5})`);
            mainGradient.addColorStop(0.4, `rgba(255, 255, 255, ${currentOpacity * 0.2})`);
            mainGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.ctx.strokeStyle = mainGradient;
            this.ctx.lineWidth = contrail.thickness * 2 * contrail.scale;
            this.ctx.beginPath();
            this.ctx.moveTo(contrail.x, contrail.y);
            this.ctx.lineTo(contrail.x - dirX * trailLength, contrail.y - dirY * trailLength);
            this.ctx.stroke();

            // Small bright head
            const headGradient = this.ctx.createRadialGradient(
                contrail.x, contrail.y, 0,
                contrail.x, contrail.y, 5 * contrail.scale
            );
            headGradient.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity * 0.9})`);
            headGradient.addColorStop(0.5, `rgba(255, 255, 255, ${currentOpacity * 0.4})`);
            headGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.ctx.fillStyle = headGradient;
            this.ctx.beginPath();
            this.ctx.arc(contrail.x, contrail.y, 5 * contrail.scale, 0, Math.PI * 2);
            this.ctx.fill();

            return true;
        });
    }

    animateButterflies() {
        this.butterflies = this.butterflies.filter(butterfly => {
            // Update phases
            butterfly.wobblePhase += 0.03;
            butterfly.wingPhase += butterfly.wingSpeed;
            butterfly.curvePhase += butterfly.curveSpeed;

            // Gentle looping/meandering curve (like real butterfly flight)
            const curveInfluence = Math.sin(butterfly.curvePhase) * butterfly.curveAmount;
            const speed = Math.sqrt(butterfly.vx * butterfly.vx + butterfly.vy * butterfly.vy);
            const currentAngle = Math.atan2(butterfly.vy, butterfly.vx);

            // Apply curve - gradual turn, not instant
            const targetAngle = currentAngle + curveInfluence;
            butterfly.vx = butterfly.vx * 0.97 + Math.cos(targetAngle) * speed * 0.03;
            butterfly.vy = butterfly.vy * 0.97 + Math.sin(targetAngle) * speed * 0.03;

            // Gentle side-to-side flutter (perpendicular to movement)
            const moveAngle = Math.atan2(butterfly.vy, butterfly.vx);
            const flutter = Math.sin(butterfly.wobblePhase) * butterfly.wobbleAmount * 0.12;
            const flutterX = Math.cos(moveAngle + Math.PI / 2) * flutter;
            const flutterY = Math.sin(moveAngle + Math.PI / 2) * flutter;

            butterfly.x += butterfly.vx + flutterX;
            butterfly.y += butterfly.vy + flutterY;

            // Smooth rotation follows movement direction gradually
            const targetRotation = Math.atan2(butterfly.vy, butterfly.vx);
            const angleDiff = Math.atan2(Math.sin(targetRotation - butterfly.rotation), Math.cos(targetRotation - butterfly.rotation));
            butterfly.rotation += angleDiff * 0.04;

            // Remove if off screen
            if (butterfly.x < -50 || butterfly.x > this.canvas.width + 50 ||
                butterfly.y < -50 || butterfly.y > this.canvas.height + 50) {
                return false;
            }

            // Draw the butterfly
            this.drawButterfly(butterfly);

            return true;
        });
    }

    drawButterfly(butterfly) {
        const { x, y, size, colors, wingPhase, rotation, baseOpacity } = butterfly;
        const opacity = baseOpacity || 0.7;

        // Wing flap animation - more gentle range
        const wingFlap = (Math.sin(wingPhase) + 1) / 2;
        const wingAngle = wingFlap * 0.5 + 0.3; // Gentler flap range

        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation + Math.PI / 2);

        // Parse colors
        const primary = this.hexToRgb(colors.primary);
        const secondary = this.hexToRgb(colors.secondary);
        const accent = this.hexToRgb(colors.accent);

        // Delicate wing dimensions
        const upperWingWidth = size * 1.4 * wingAngle;
        const upperWingHeight = size * 1.1;
        const lowerWingWidth = size * 0.9 * wingAngle;
        const lowerWingHeight = size * 0.7;

        // Draw wings with soft, translucent gradients (scaled by opacity)
        // Left upper wing
        this.ctx.beginPath();
        const leftUpperGrad = this.ctx.createRadialGradient(
            -upperWingWidth * 0.4, -upperWingHeight * 0.3, 0,
            -upperWingWidth * 0.4, -upperWingHeight * 0.3, upperWingWidth * 0.9
        );
        leftUpperGrad.addColorStop(0, `rgba(255, 255, 255, ${0.85 * opacity})`);
        leftUpperGrad.addColorStop(0.2, `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.75 * opacity})`);
        leftUpperGrad.addColorStop(0.5, `rgba(${primary.r}, ${primary.g}, ${primary.b}, ${0.65 * opacity})`);
        leftUpperGrad.addColorStop(0.8, `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, ${0.5 * opacity})`);
        leftUpperGrad.addColorStop(1, `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, ${0.15 * opacity})`);

        this.ctx.fillStyle = leftUpperGrad;
        this.ctx.moveTo(0, -size * 0.05);
        this.ctx.bezierCurveTo(
            -upperWingWidth * 0.4, -upperWingHeight * 0.4,
            -upperWingWidth * 0.95, -upperWingHeight * 0.7,
            -upperWingWidth * 0.7, -upperWingHeight * 0.1
        );
        this.ctx.bezierCurveTo(
            -upperWingWidth * 0.8, upperWingHeight * 0.05,
            -upperWingWidth * 0.3, size * 0.1,
            0, size * 0.05
        );
        this.ctx.closePath();
        this.ctx.fill();

        // Right upper wing
        this.ctx.beginPath();
        const rightUpperGrad = this.ctx.createRadialGradient(
            upperWingWidth * 0.4, -upperWingHeight * 0.3, 0,
            upperWingWidth * 0.4, -upperWingHeight * 0.3, upperWingWidth * 0.9
        );
        rightUpperGrad.addColorStop(0, `rgba(255, 255, 255, ${0.85 * opacity})`);
        rightUpperGrad.addColorStop(0.2, `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.75 * opacity})`);
        rightUpperGrad.addColorStop(0.5, `rgba(${primary.r}, ${primary.g}, ${primary.b}, ${0.65 * opacity})`);
        rightUpperGrad.addColorStop(0.8, `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, ${0.5 * opacity})`);
        rightUpperGrad.addColorStop(1, `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, ${0.15 * opacity})`);

        this.ctx.fillStyle = rightUpperGrad;
        this.ctx.moveTo(0, -size * 0.05);
        this.ctx.bezierCurveTo(
            upperWingWidth * 0.4, -upperWingHeight * 0.4,
            upperWingWidth * 0.95, -upperWingHeight * 0.7,
            upperWingWidth * 0.7, -upperWingHeight * 0.1
        );
        this.ctx.bezierCurveTo(
            upperWingWidth * 0.8, upperWingHeight * 0.05,
            upperWingWidth * 0.3, size * 0.1,
            0, size * 0.05
        );
        this.ctx.closePath();
        this.ctx.fill();

        // Left lower wing - rounder, teardrop shape
        this.ctx.beginPath();
        const leftLowerGrad = this.ctx.createRadialGradient(
            -lowerWingWidth * 0.3, lowerWingHeight * 0.3, 0,
            -lowerWingWidth * 0.3, lowerWingHeight * 0.3, lowerWingWidth * 0.8
        );
        leftLowerGrad.addColorStop(0, `rgba(255, 255, 255, ${0.75 * opacity})`);
        leftLowerGrad.addColorStop(0.3, `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.65 * opacity})`);
        leftLowerGrad.addColorStop(0.7, `rgba(${primary.r}, ${primary.g}, ${primary.b}, ${0.5 * opacity})`);
        leftLowerGrad.addColorStop(1, `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, ${0.2 * opacity})`);

        this.ctx.fillStyle = leftLowerGrad;
        this.ctx.moveTo(0, size * 0.02);
        this.ctx.bezierCurveTo(
            -lowerWingWidth * 0.4, size * 0.15,
            -lowerWingWidth * 0.85, lowerWingHeight * 0.6,
            -lowerWingWidth * 0.5, lowerWingHeight * 0.95
        );
        this.ctx.bezierCurveTo(
            -lowerWingWidth * 0.2, lowerWingHeight * 0.6,
            0, size * 0.3,
            0, size * 0.25
        );
        this.ctx.closePath();
        this.ctx.fill();

        // Right lower wing
        this.ctx.beginPath();
        const rightLowerGrad = this.ctx.createRadialGradient(
            lowerWingWidth * 0.3, lowerWingHeight * 0.3, 0,
            lowerWingWidth * 0.3, lowerWingHeight * 0.3, lowerWingWidth * 0.8
        );
        rightLowerGrad.addColorStop(0, `rgba(255, 255, 255, ${0.75 * opacity})`);
        rightLowerGrad.addColorStop(0.3, `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.65 * opacity})`);
        rightLowerGrad.addColorStop(0.7, `rgba(${primary.r}, ${primary.g}, ${primary.b}, ${0.5 * opacity})`);
        rightLowerGrad.addColorStop(1, `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, ${0.2 * opacity})`);

        this.ctx.fillStyle = rightLowerGrad;
        this.ctx.moveTo(0, size * 0.02);
        this.ctx.bezierCurveTo(
            lowerWingWidth * 0.4, size * 0.15,
            lowerWingWidth * 0.85, lowerWingHeight * 0.6,
            lowerWingWidth * 0.5, lowerWingHeight * 0.95
        );
        this.ctx.bezierCurveTo(
            lowerWingWidth * 0.2, lowerWingHeight * 0.6,
            0, size * 0.3,
            0, size * 0.25
        );
        this.ctx.closePath();
        this.ctx.fill();

        // Delicate body - thin and tapered
        this.ctx.fillStyle = `rgba(60, 50, 40, ${0.9 * opacity})`;
        this.ctx.beginPath();
        this.ctx.ellipse(0, size * 0.05, size * 0.04, size * 0.28, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Tiny head
        this.ctx.beginPath();
        this.ctx.arc(0, -size * 0.22, size * 0.05, 0, Math.PI * 2);
        this.ctx.fill();

        // Delicate antennae - thin curved lines
        this.ctx.strokeStyle = `rgba(60, 50, 40, ${0.7 * opacity})`;
        this.ctx.lineWidth = Math.max(0.5, size * 0.015);
        this.ctx.lineCap = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(-size * 0.02, -size * 0.26);
        this.ctx.quadraticCurveTo(-size * 0.1, -size * 0.38, -size * 0.08, -size * 0.45);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(size * 0.02, -size * 0.26);
        this.ctx.quadraticCurveTo(size * 0.1, -size * 0.38, size * 0.08, -size * 0.45);
        this.ctx.stroke();

        this.ctx.restore();
    }

    animateShootingStars() {
        this.shootingStars = this.shootingStars.filter(star => {
            star.x += star.vx;
            star.y += star.vy;
            star.life -= star.fadeRate;

            star.scale = Math.max(0.2, star.scale * 0.998);
            star.opacity = Math.pow(star.life, 0.6) * star.scale * 0.9;
            star.headOpacity = Math.max(0, Math.pow(star.life, 1.5) * star.opacity);
            star.tailOpacity = Math.max(0, star.opacity);

            // Safety checks for invalid values
            if (star.life <= 0 || isNaN(star.x) || isNaN(star.y) ||
                star.x < -200 || star.x > this.canvas.width + 200 ||
                star.y < -200 || star.y > this.canvas.height + 200) return false;

            const currentScale = star.scale;
            const distTraveled = Math.sqrt(Math.pow(star.x - star.startX, 2) + Math.pow(star.y - star.startY, 2));
            const trailLength = Math.min(distTraveled, star.length);
            const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);

            // Prevent division by zero
            if (speed < 0.001) return false;

            const dirX = star.vx / speed;
            const dirY = star.vy / speed;

            // Skip rendering if opacity too low
            if (star.tailOpacity < 0.01) return false;

            // Glow
            const glowGradient = this.ctx.createLinearGradient(
                star.x, star.y, star.x - dirX * trailLength * 0.4, star.y - dirY * trailLength * 0.4
            );
            glowGradient.addColorStop(0, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.tailOpacity * 0.15})`);
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
            mainGradient.addColorStop(0, `rgba(255, 255, 255, ${star.tailOpacity * 0.7})`);
            mainGradient.addColorStop(0.1, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.tailOpacity * 0.55})`);
            mainGradient.addColorStop(0.4, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${star.tailOpacity * 0.25})`);
            mainGradient.addColorStop(1, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, 0)`);

            this.ctx.strokeStyle = mainGradient;
            this.ctx.lineWidth = star.thickness * 2 * currentScale;
            this.ctx.beginPath();
            this.ctx.moveTo(star.x, star.y);
            this.ctx.lineTo(star.x - dirX * trailLength, star.y - dirY * trailLength);
            this.ctx.stroke();

            // Head
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.headOpacity * 0.9})`;
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
    const themeController = new ThemeToggleController();
    const skyAnimation = new SkyAnimation(themeController);
    themeController.setAnimation(skyAnimation);
    new ScrollManager();

    // Hide preloader once everything is ready
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Small delay to ensure animations are initialized
        setTimeout(() => {
            preloader.classList.add('loaded');
        }, 400);
    }

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

    // Fix stuck hover state on iOS
    document.querySelectorAll('.icon-link').forEach(icon => {
        icon.addEventListener('touchstart', () => {
            // Remove reset class immediately so hover effect can show again
            icon.classList.remove('reset-hover');
        }, {passive: true});

        icon.addEventListener('touchend', () => {
            setTimeout(() => {
                icon.classList.add('reset-hover');
            }, 500);
        }, {passive: true});
    });

    // Remove reset class when touching elsewhere
    document.addEventListener('touchstart', (e) => {
        document.querySelectorAll('.icon-link.reset-hover').forEach(icon => {
            if (!icon.contains(e.target)) {
                icon.classList.remove('reset-hover');
            }
        });
    }, {passive: true});

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

    // Detail page navigation
    const mainContainer = document.querySelector('.main-container');
    const cards = document.querySelectorAll('.content-card[data-detail]');

    // Generate detail pages dynamically from card data
    cards.forEach(card => {
        const detailId = card.getAttribute('data-detail');
        const title = card.querySelector('.icon-card-label').textContent.trim();
        const icons = card.querySelectorAll('.icon-group .icon-link');

        const page = document.createElement('div');
        page.className = 'detail-page';
        page.id = detailId;

        let cardsHtml = '';
        icons.forEach(icon => {
            const desc = (icon.getAttribute('data-description') || '').replace(/\|\|/g, '<br><br>');
            cardsHtml += `<article class="content-card detail-card">${icon.outerHTML}<p class="detail-card-text">${desc}</p></article>`;
        });

        page.innerHTML = `
            <button class="back-button" aria-label="Go back">
                <i class="fas fa-chevron-left" aria-hidden="true"></i>
            </button>
            <div class="detail-content">
                <h1 class="detail-title">${title}</h1>
                <div class="cards-row">${cardsHtml}</div>
            </div>`;

        document.body.insertBefore(page, document.querySelector('script'));
    });

    function openDetail(detailId) {
        const detailPage = document.getElementById(detailId);
        if (!detailPage || !mainContainer) return;

        mainContainer.classList.add('hidden');
        detailPage.classList.add('active');
        detailPage.offsetHeight;
        detailPage.classList.add('visible');
        window.scrollTo(0, 0);
        history.pushState({ detail: detailId }, '', '');
    }

    let isClosing = false;

    function closeDetail(source) {
        const activePage = document.querySelector('.detail-page.active');
        if (!activePage || !mainContainer || isClosing) return;

        isClosing = true;

        activePage.classList.remove('visible');
        setTimeout(() => {
            activePage.classList.remove('active');
            mainContainer.classList.remove('hidden');
            isClosing = false;
        }, 300);

        if (source !== 'popstate') {
            history.back();
        }
    }

    window.addEventListener('popstate', () => closeDetail('popstate'));

    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        if (!document.querySelector('.detail-page.active') || isClosing) return;
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (!document.querySelector('.detail-page.active') || isClosing) return;

        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);

        if (dx > 60 && dx > dy) {
            closeDetail();
        }
    }, { passive: true });

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.icon-link')) return;
            const detailId = card.getAttribute('data-detail');
            if (detailId) openDetail(detailId);
        });
    });

    document.querySelectorAll('.back-button').forEach(btn => {
        btn.addEventListener('click', closeDetail);
    });

    // Fix stuck hover on detail page icons (iOS)
    document.querySelectorAll('.detail-page .icon-link').forEach(icon => {
        icon.addEventListener('touchstart', () => {
            icon.classList.remove('reset-hover');
        }, {passive: true});
        icon.addEventListener('touchend', () => {
            setTimeout(() => {
                icon.classList.add('reset-hover');
            }, 500);
        }, {passive: true});
    });
});
