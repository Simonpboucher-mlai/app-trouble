// src/utils/particleEffects.ts

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
  alphaSpeed: number;
  growth: number;
  maxSize: number;
  swayAmplitude: number;
  swayFrequency: number;
  swayOffset: number;
}

let animationFrame: number | null = null;

export const createParticles = (container: HTMLElement): HTMLCanvasElement => {
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.className = 'particles absolute inset-0 z-0 pointer-events-none';
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  container.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  
  // Create vapor particles
  const particles: Particle[] = [];
  const particleCount = Math.min(Math.max(Math.floor(canvas.width * canvas.height / 8000), 60), 180);
  
  const colors = [
    'rgba(0, 122, 255, 0.7)',  // Blue
    'rgba(94, 92, 230, 0.7)',  // Purple
    'rgba(255, 149, 0, 0.7)',  // Orange
    'rgba(255, 45, 85, 0.7)',  // Pink
    'rgba(52, 199, 89, 0.7)',  // Green
    'rgba(175, 82, 222, 0.7)'  // Purple
  ];
  
  for (let i = 0; i < particleCount; i++) {
    // For vapor effect, particles should rise and sway
    particles.push({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 20, // Start below the visible area
      size: Math.random() * 8 + 3, // Larger, more cloud-like particles
      speedX: (Math.random() - 0.5) * 0.5, // Gentle horizontal sway
      speedY: -Math.random() * 0.8 - 0.5, // Rise upward at varying speeds
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.1, // More transparency for vapor effect
      alphaSpeed: Math.random() * 0.005 + 0.002,
      // Additional properties for vapor effect
      growth: Math.random() * 0.03 + 0.01, // Size growth rate
      maxSize: Math.random() * 15 + 10, // Maximum size before starting to fade
      swayAmplitude: Math.random() * 2 + 1, // Horizontal sway amplitude
      swayFrequency: Math.random() * 0.05 + 0.01, // Sway frequency
      swayOffset: Math.random() * Math.PI * 2, // Random starting phase
    });
  }
  
  // Resize handler
  const handleResize = () => {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  };
  
  window.addEventListener('resize', handleResize);
  
  // Animation loop with frame counter for sway effect
  let frame = 0;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;
    
    particles.forEach((particle, index) => {
      // Update particle position with vapor-like behavior
      particle.x += particle.speedX + Math.sin((frame * particle.swayFrequency) + particle.swayOffset) * particle.swayAmplitude * 0.1;
      particle.y += particle.speedY;
      
      // Grow size up to a point, then start to fade
      if (particle.size < particle.maxSize) {
        particle.size += particle.growth;
      } else {
        // Increase fade speed when reaching max size
        particle.alpha -= particle.alphaSpeed * 2;
      }
      
      // If particle is out of view or completely faded, reset it
      if (particle.y < -particle.size * 2 || particle.alpha <= 0) {
        // Reset particle to start position
        particles[index] = {
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 20,
          size: Math.random() * 5 + 2,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: -Math.random() * 0.8 - 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.5 + 0.2,
          alphaSpeed: Math.random() * 0.005 + 0.002,
          growth: Math.random() * 0.03 + 0.01,
          maxSize: Math.random() * 15 + 10,
          swayAmplitude: Math.random() * 2 + 1,
          swayFrequency: Math.random() * 0.05 + 0.01,
          swayOffset: Math.random() * Math.PI * 2,
        };
        return;
      }
      
      // Draw particle as a vapor/cloud-like shape
      ctx.beginPath();
      
      // Draw shapes with semi-transparent fill for a vapor effect
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      
      // Use arc for basic shape
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add some fuzziness to the edges
      for (let i = 0; i < 3; i++) {
        const offset = particle.size * 0.4;
        ctx.beginPath();
        ctx.arc(
          particle.x + (Math.random() - 0.5) * offset,
          particle.y + (Math.random() - 0.5) * offset,
          particle.size * (0.7 + Math.random() * 0.3),
          0,
          Math.PI * 2
        );
        ctx.fillStyle = particle.color.replace(')', `, ${particle.alpha * 0.6})`);
        ctx.fill();
      }
      
      // Reset globalAlpha
      ctx.globalAlpha = 1;
    });
    
    animationFrame = requestAnimationFrame(animate);
  };
  
  animate();
  
  return canvas;
};

// Enhanced evaporation effect
export const removeParticles = (canvas: HTMLCanvasElement) => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  
  // Create more dramatic evaporation effect
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }
  
  // Get current state
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Add more particles for the evaporation effect
  const evaporationParticles: {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    alpha: number;
    rotation: number;
    rotationSpeed: number;
  }[] = [];
  
  // Extract color data from the imageData to create matching evaporation particles
  for (let i = 0; i < 100; i++) {
    // Random position on the canvas
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.8; // Focus more on the upper part
    
    // Random color from a predefined set of vibrant colors
    const colors = [
      'rgba(0, 122, 255, 0.7)',  // Blue
      'rgba(94, 92, 230, 0.7)',  // Purple
      'rgba(255, 149, 0, 0.7)',  // Orange
      'rgba(255, 45, 85, 0.7)',  // Pink
      'rgba(52, 199, 89, 0.7)',  // Green
      'rgba(175, 82, 222, 0.7)'  // Purple
    ];
    
    evaporationParticles.push({
      x,
      y,
      size: Math.random() * 15 + 5,
      speedX: (Math.random() - 0.5) * 2,
      speedY: -Math.random() * 3 - 2, // Faster upward movement
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.7 + 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
    });
  }
  
  // Animation for dramatic evaporation
  let frame = 0;
  let globalAlpha = 1;
  
  const fadeOut = () => {
    frame++;
    globalAlpha -= 0.015; // Slower fade for more dramatic effect
    
    if (globalAlpha <= 0 || frame > 120) { // Limit to 120 frames max
      canvas.remove();
      return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // First, draw the original content with reducing opacity
    if (frame < 30) { // Only show original content briefly
      ctx.globalAlpha = Math.max(0, globalAlpha * 2 - 1); // Faster fade for original
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Then draw evaporation particles on top
    evaporationParticles.forEach((particle, index) => {
      // Update particle
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.speedY -= 0.05; // Accelerate upward
      particle.size *= 0.97; // Shrink gradually
      particle.alpha *= 0.99; // Fade slowly
      particle.rotation += particle.rotationSpeed;
      
      // Draw particle with semi-transparent color
      ctx.save();
      ctx.globalAlpha = particle.alpha * globalAlpha;
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      
      // Draw a cloud-like shape using multiple overlapping circles
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
      gradient.addColorStop(0, particle.color.replace(')', ', 0.8)'));
      gradient.addColorStop(1, particle.color.replace(')', ', 0)'));
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add some fuzziness with smaller circles
      for (let i = 0; i < 3; i++) {
        const offset = particle.size * 0.4;
        ctx.beginPath();
        ctx.arc(
          (Math.random() - 0.5) * offset,
          (Math.random() - 0.5) * offset,
          particle.size * (0.6 + Math.random() * 0.4),
          0,
          Math.PI * 2
        );
        ctx.fillStyle = particle.color.replace(')', `, ${0.6 * particle.alpha * globalAlpha})`);
        ctx.fill();
      }
      
      ctx.restore();
      
      // If particle is too small or invisible, remove it
      if (particle.size < 0.5 || particle.alpha < 0.05) {
        evaporationParticles.splice(index, 1);
      }
    });
    
    requestAnimationFrame(fadeOut);
  };
  
  fadeOut();
};
