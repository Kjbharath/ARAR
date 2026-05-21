// particle-noise.js
(function() {
  const canvas = document.getElementById('particleNoiseCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = canvas.offsetWidth;
  let height = canvas.height = canvas.offsetHeight;

  const particles = [];
  const particleCount = window.innerWidth < 768 ? 300 : 800;

  // Simple pseudo-noise function mimicking Perlin noise flow
  function getNoise(x, y, time) {
    const scale = 0.0015;
    // Layered sines to create a more organic flow field
    let noise = Math.sin(x * scale + time) * Math.cos(y * scale + time);
    noise += Math.sin(y * scale * 2 - time * 0.5) * Math.cos(x * scale * 2 + time * 0.5) * 0.5;
    return noise * Math.PI * 2;
  }

  class Particle {
    constructor() {
      this.reset();
      this.x = Math.random() * width;
      this.y = Math.random() * height;
    }
    
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.5 + 0.5;
      this.baseSpeed = Math.random() * 0.6 + 0.1;
      // Vibrant red particles
      const op = Math.random() * 0.6 + 0.1;
      this.color = `rgba(255, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 50)}, ${op})`;
      this.life = Math.random() * 200 + 100;
      this.age = 0;
    }

    update(time) {
      const angle = getNoise(this.x, this.y, time);
      this.x += Math.cos(angle) * this.baseSpeed;
      this.y += Math.sin(angle) * this.baseSpeed;
      
      this.age++;
      if (this.age > this.life) {
        this.reset();
      }

      // Wrap around smoothly
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw() {
      // Fade in and out based on life
      let alphaMultiplier = 1;
      if (this.age < 20) {
        alphaMultiplier = this.age / 20;
      } else if (this.age > this.life - 20) {
        alphaMultiplier = (this.life - this.age) / 20;
      }
      
      ctx.globalAlpha = alphaMultiplier;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  let time = Math.random() * 100;
  function animate() {
    ctx.clearRect(0, 0, width, height);
    time += 0.003;
    
    ctx.globalAlpha = 1;
    particles.forEach(p => {
      p.update(time);
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.offsetWidth;
    // Use clientHeight of the parent element for reliable full coverage
    height = canvas.height = canvas.parentElement
      ? canvas.parentElement.offsetHeight
      : window.innerHeight;
  });
})();
