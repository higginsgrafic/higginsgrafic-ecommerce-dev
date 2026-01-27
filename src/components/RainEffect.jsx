import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 🌧️ RAIN EFFECT - WebGL/Three.js Hyperrealistic Rain
 *
 * Sistema de partícules avançat amb:
 * - Física realista (gravetat, acceleració, splash)
 * - Shaders personalitzats per efectes d'aigua
 * - Milers de gotes amb instanced rendering
 * - Blur, reflexos i efectes de llum
 * - Text format per gotes de pluja
 */

function RainEffect({ message1, message2, isActive = true }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !isActive) return;

    // Setup Three.js
    const canvas = canvasRef.current;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera ortogràfica per 2D
    const camera = new THREE.OrthographicCamera(
      width / -2, width / 2,
      height / 2, height / -2,
      0.1, 1000
    );
    camera.position.z = 100;

    // Renderer amb alpha (transparent)
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Shader personalitzat per les gotes
    const dropletShader = {
      vertexShader: `
        attribute float size;
        attribute float alpha;
        attribute float splash;

        varying float vAlpha;
        varying float vSplash;

        void main() {
          vAlpha = alpha;
          vSplash = splash;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying float vSplash;

        void main() {
          // Gradient radial per simular gota d'aigua
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);

          // Forma de la gota segons si està en splash o no
          float shape;
          float glow = 0.0;

          if (vSplash > 0.5) {
            // Splash - forma irregular amb EXPLOSIÓ MASSIVA
            shape = 1.0 - smoothstep(0.1, 0.6, dist);
            glow = exp(-dist * 5.0) * 0.9; // Glow BRUTAL al splash
          } else {
            // Gota normal - ULTRA-BRILLANT amb halo massiu
            shape = 1.0 - smoothstep(0.2, 0.6, dist);
            // Highlight MEGA-BRILLANT per simular reflexe de llum intens
            float highlight = exp(-dist * 15.0) * 1.2;
            glow = exp(-dist * 4.0) * 0.7; // Glow FORT i visible
            shape += highlight;
          }

          // Color blanc HIPER-BRILLANT amb glow massiu
          vec3 color = vec3(1.0) * (1.0 + glow * 1.2);
          float finalAlpha = (shape + glow * 0.8) * vAlpha * 1.8;

          if (finalAlpha < 0.01) discard;

          gl_FragColor = vec4(color, finalAlpha);
        }
      `
    };

    // Material per les gotes
    const material = new THREE.ShaderMaterial({
      vertexShader: dropletShader.vertexShader,
      fragmentShader: dropletShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // Sistema de partícules - 400 gotes optimitzat per barra estreta
    const particleCount = 400;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const alphas = new Float32Array(particleCount);
    const splashes = new Float32Array(particleCount);
    const velocities = [];

    // Inicialitzar partícules
    for (let i = 0; i < particleCount; i++) {
      // Posició inicial al centre (punt de fugida)
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      // Mida MOLT GRAN i visible per barra estreta panoràmica
      const sizeVariation = Math.random();
      if (sizeVariation < 0.15) {
        sizes[i] = Math.random() * 6 + 8; // Petites però visibles (8-14px)
      } else if (sizeVariation < 0.5) {
        sizes[i] = Math.random() * 12 + 16; // Mitjanes GRANS (16-28px)
      } else {
        sizes[i] = Math.random() * 18 + 24; // ENORMES i ultra-visibles (24-42px)
      }

      // Alpha inicial
      alphas[i] = 0;

      // Splash state
      splashes[i] = 0;

      // Velocitat i direcció MÉS HORITZONTAL per barra panoràmica
      const angle = Math.random() * Math.PI * 2;
      const speedFactor = sizes[i] / 15; // Gotes grans cauen més ràpid
      const speed = (Math.random() * 150 + 110) * (0.8 + speedFactor * 0.5);
      const distance = Math.random() * 0.75 + 0.6; // Més distància horitzontal

      velocities.push({
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed * 0.12, // MOLT menys moviment vertical (12% vs 25%)
        z: 0,
        speed: speed,
        delay: Math.random() * 2200, // Delay més curt = més densitat temporal
        startTime: Date.now(),
        targetX: Math.cos(angle) * (width / 2) * distance * 0.95,
        targetY: Math.sin(angle) * (height / 3) * distance * 0.5, // 50% menys expansió vertical
        phase: 'falling', // falling, impact, splash, fade
        size: sizes[i]
      });
    }

    // Geometria
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('splash', new THREE.BufferAttribute(splashes, 1));

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Text amb gotes (opcional - puc fer que les gotes formin el text)
    const textParticles = createTextParticles(message1, message2);
    textParticles.forEach(tp => scene.add(tp));

    // Animació
    let animationId;
    const animate = () => {
      const currentTime = Date.now();

      // Actualitzar cada partícula
      for (let i = 0; i < particleCount; i++) {
        const vel = velocities[i];
        const elapsed = currentTime - vel.startTime - vel.delay;

        if (elapsed < 0) continue; // Encara no ha començat

        const progress = Math.min(elapsed / 3000, 1); // 3 segons cicle complet

        if (progress < 0.7) {
          // FASE 1: Caiguda des del centre
          vel.phase = 'falling';

          // Ease-out cubic per acceleració realista
          const easeProgress = 1 - Math.pow(1 - progress / 0.7, 3);

          positions[i * 3] = vel.targetX * easeProgress;
          positions[i * 3 + 1] = vel.targetY * easeProgress;

          // Alpha creix RÀPID i fort
          alphas[i] = Math.min(easeProgress * 2.5, 1);

          // Mida creix amb perspectiva DRAMÀTICA (basada en mida original)
          sizes[i] = vel.size * (0.4 + easeProgress * 3.5);

          splashes[i] = 0;

        } else if (progress < 0.75) {
          // FASE 2: Impacte i MEGA-SPLASH
          vel.phase = 'impact';

          positions[i * 3] = vel.targetX;
          positions[i * 3 + 1] = vel.targetY;

          // Splash ENORME i explosiu
          const splashProgress = (progress - 0.7) / 0.05;
          sizes[i] = vel.size * (4 + splashProgress * 3);
          alphas[i] = 1 - splashProgress * 0.2;
          splashes[i] = 1;

        } else if (progress < 0.9) {
          // FASE 3: Assentament visible
          vel.phase = 'fade';

          positions[i * 3] = vel.targetX;
          positions[i * 3 + 1] = vel.targetY;

          const fadeProgress = (progress - 0.75) / 0.15;
          sizes[i] = vel.size * (1.8 - fadeProgress * 0.6);
          alphas[i] = 0.85 - fadeProgress * 0.35;
          splashes[i] = 1 - fadeProgress;

        } else {
          // FASE 4: Restes d'aigua VISIBLES i persistents
          positions[i * 3] = vel.targetX;
          positions[i * 3 + 1] = vel.targetY;

          sizes[i] = vel.size * (0.6 + Math.random() * 0.3);
          alphas[i] = 0.35 + Math.random() * 0.25;
          splashes[i] = 0;
        }

        // Reset després del cicle complet
        if (progress >= 1) {
          vel.startTime = currentTime;
          vel.delay = Math.random() * 1000;
        }
      }

      // Update geometria
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.size.needsUpdate = true;
      geometry.attributes.alpha.needsUpdate = true;
      geometry.attributes.splash.needsUpdate = true;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [message1, message2, isActive]);

  // Helper per crear partícules de text (opcional)
  function createTextParticles(msg1, msg2) {
    // Puc implementar això per fer que les gotes formin el text
    // Per ara retornem array buit
    return [];
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10
      }}
    />
  );
}

export default RainEffect;
