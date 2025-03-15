class AvatarRenderer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.animationFrame = null;
        this.currentAnimation = null;
        this.lipSyncData = null;
        this.startTime = 0;
    }

    async initialize(avatarUrl) {
        try {
            const response = await fetch(avatarUrl);
            const svgText = await response.text();
            this.svg.innerHTML = svgText;
            
            this.initializeTransforms();
        } catch (error) {
            console.error('Error initializing avatar:', error);
        }
    }

    initializeTransforms() {
        const avatar = this.svg.querySelector('svg');
        if (!avatar) return;

        this.headGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.headGroup.setAttribute('id', 'head-group');
        
        this.bodyGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.bodyGroup.setAttribute('id', 'body-group');

        // Head और Body को सीधे Move करने का सही तरीका
        const headElements = avatar.querySelectorAll('[id*="head"], [id*="face"], [id*="mouth"]');
        const bodyElements = avatar.querySelectorAll('[id*="body"], [id*="cloth"]');

        headElements.forEach(el => {
            this.headGroup.appendChild(el);
        });
        bodyElements.forEach(el => {
            this.bodyGroup.appendChild(el);
        });

        // Avatar को री-बिल्ड करो
        avatar.innerHTML = '';
        avatar.appendChild(this.bodyGroup);
        avatar.appendChild(this.headGroup);
    }

    setAnimation(animationData) {
        this.currentAnimation = animationData;
        this.startTime = performance.now();
    }

    setLipSync(lipSyncData) {
        this.lipSyncData = lipSyncData;
    }

    animate() {
        if (!this.currentAnimation || !this.headGroup || !this.bodyGroup) return;

        const currentTime = (performance.now() - this.startTime) / 1000;
        const frame = this.getCurrentFrame(currentTime);
        if (!frame) return;

        this.applyTransforms(frame);
        if (this.lipSyncData) {
            this.applyLipSync(currentTime);
        }

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    getCurrentFrame(currentTime) {
        if (!this.currentAnimation || this.currentAnimation.length === 0) return null;

        let prevFrame = null;
        let nextFrame = null;

        for (const frame of this.currentAnimation) {
            if (frame.timestamp <= currentTime) {
                prevFrame = frame;
            }
            if (frame.timestamp > currentTime && !nextFrame) {
                nextFrame = frame;
                break;
            }
        }

        if (!prevFrame) return this.currentAnimation[0];
        if (!nextFrame) return prevFrame;

        const t = (currentTime - prevFrame.timestamp) / 
                 (nextFrame.timestamp - prevFrame.timestamp);
        
        return this.interpolateFrames(prevFrame, nextFrame, t);
    }

    interpolateFrames(a, b, t) {
        return {
            position: {
                x: this.lerp(a.position.x, b.position.x, t),
                y: this.lerp(a.position.y, b.position.y, t),
                z: this.lerp(a.position.z, b.position.z, t)
            },
            rotation: {
                x: this.lerp(a.rotation.x, b.rotation.x, t),
                y: this.lerp(a.rotation.y, b.rotation.y, t),
                z: this.lerp(a.rotation.z, b.rotation.z, t)
            }
        };
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    applyTransforms(frame) {
        if (!this.headGroup || !this.bodyGroup) return;

        const headTransform = `
            translate(${frame.position.x * 10}, ${frame.position.y * 10})
            rotate(${frame.rotation.z * 45})
        `;
        this.headGroup.setAttribute("transform", headTransform);

        const bodyTransform = `
            translate(${frame.position.x * 5}, ${frame.position.y * 5})
            rotate(${frame.rotation.z * 10})
        `;
        this.bodyGroup.setAttribute("transform", bodyTransform);
    }

    applyLipSync(currentTime) {
        const lipData = this.getLipSyncData(currentTime);
        if (!lipData) return;

        const mouthElements = this.headGroup.querySelectorAll('[id*="mouth"]');
        mouthElements.forEach(mouth => {
            mouth.setAttribute("transform", `scale(${lipData.mouth_shape.width}, ${lipData.mouth_shape.height})`);
        });
    }

    getLipSyncData(currentTime) {
        if (!this.lipSyncData || this.lipSyncData.length === 0) return null;

        return this.lipSyncData.find(frame => 
            frame.timestamp <= currentTime && 
            frame.timestamp + 0.1 > currentTime
        ) || this.lipSyncData[this.lipSyncData.length - 1];
    }

    startAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.animate();
    }

    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
}

// Initialize avatar rendering when page loads
document.addEventListener('DOMContentLoaded', () => {
    const avatarContainer = document.getElementById('avatar-container');
    if (avatarContainer) {
        window.avatarRenderer = new AvatarRenderer(avatarContainer);
    }
});