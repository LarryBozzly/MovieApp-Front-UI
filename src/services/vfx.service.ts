class VFXService {
  private static instance: VFXService;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  private particles: any[] = [];
  private animationFrame: number | null = null;

  private popcornImg = new Image();
  private offscreenPopcorn: HTMLCanvasElement | null = null;

  private dpr = window.devicePixelRatio || 1;

  private container!: HTMLDivElement;

  private running = false;

  // ----------------------------
  // Reactive burst scheduler
  // ----------------------------
  private burstQueue: number[] = [];
  private nextBurstAt = 0;
  private burstInterval = 480;

  private constructor() {
    this.createTopLayerContainer();
    this.createCanvas();
    this.loadSVG();

    window.addEventListener('resize', () => this.resize());
  }

  public static getInstance(): VFXService {
    if (!VFXService.instance) {
      VFXService.instance = new VFXService();
    }
    return VFXService.instance;
  }

  // ---------------------------------------------------
  // TOP LAYER
  // ---------------------------------------------------

  private createTopLayerContainer() {
    const container = document.createElement('div');

    container.setAttribute('popover', 'manual');
    container.style.position = 'fixed';
    container.style.background = 'transparent';
    container.style.inset = '0';
    container.style.pointerEvents = 'none';

    document.body.appendChild(container);

    (container as any).showPopover?.();

    this.container = container;
  }

  private promoteToTopLayer() {
    try {
      (this.container as any).hidePopover?.();
    } catch {}

    (this.container as any).showPopover?.();
  }

  // ---------------------------------------------------
  // CANVAS
  // ---------------------------------------------------

  private createCanvas() {
    this.canvas = document.createElement('canvas');

    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';

    this.container.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    this.ctx = ctx;

    this.resize();
  }

  private resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.dpr = window.devicePixelRatio || 1;

    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  // ---------------------------------------------------
  // ASSET
  // ---------------------------------------------------

  private loadSVG() {
    this.popcornImg.onload = () => {
      const maxParticleSize = (10 + 18) * 2.4;
      const px = Math.ceil(maxParticleSize * this.dpr);

      const offscreen = document.createElement('canvas');
      offscreen.width = px;
      offscreen.height = px;

      const octx = offscreen.getContext('2d')!;
      octx.drawImage(this.popcornImg, 0, 0, px, px);

      this.offscreenPopcorn = offscreen;
    };

    this.popcornImg.onerror = (e) => {
      console.error('Failed ❌', e);
    };

    this.popcornImg.src = '/images/popcorn/popcorn.svg';
  }

  // ---------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------

  public popcornBurst() {
    this.promoteToTopLayer();

    // queue burst sequence instead of setTimeout chain
    this.burstQueue.push(2);

    this.start();
  }

  // ---------------------------------------------------
  // PHYSICS
  // ---------------------------------------------------

  private spawnBurst() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = 0; i < 25; i++) {
      this.particles.push({
        x: w / 2,
        y: h * 0.7,
        vx: (Math.random() - 0.5) * 7,
        vy: -(Math.random() * 10 + 10),
        size: Math.random() * 10 + 18,
        tilt: Math.random() * 0.5,
      });
    }
  }

  // ---------------------------------------------------
  // LOOP CONTROL
  // ---------------------------------------------------

  private start() {
    if (this.running) return;

    this.running = true;
    this.nextBurstAt = performance.now() + this.burstInterval;

    this.animationFrame = requestAnimationFrame(this.loop);
  }

  // ---------------------------------------------------
  // MAIN LOOP (reactive scheduler)
  // ---------------------------------------------------

  private loop = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const now = performance.now();

    this.ctx.clearRect(0, 0, w, h);

    // ----------------------------
    // reactive burst timing
    // ----------------------------
    if (this.burstQueue.length > 0 && now >= this.nextBurstAt) {
      this.spawnBurst();

      // decrement current burst group
      this.burstQueue[0]--;

      if (this.burstQueue[0] <= 0) {
        this.burstQueue.shift();
      }

      this.nextBurstAt = now + this.burstInterval;
    }

    // ----------------------------
    // physics update
    // ----------------------------
    const ground = h - 20;

    for (const p of this.particles) {
      p.vy += 0.18;
      p.x += p.vx;
      p.y += p.vy;

      this.draw(p);
    }

    this.particles = this.particles.filter((p) => p.y < ground);

    // ----------------------------
    // stop condition
    // ----------------------------
    if (this.particles.length === 0 && this.burstQueue.length === 0) {
      this.running = false;
      this.animationFrame = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    this.animationFrame = requestAnimationFrame(this.loop);
  };

  // ---------------------------------------------------
  // DRAW
  // ---------------------------------------------------

  private draw(p: any) {
    if (!this.offscreenPopcorn) return;

    const ctx = this.ctx;
    const size = p.size * 2.4;

    ctx.save();
    ctx.translate(p.x, p.y);

    const wobble = Math.sin((p.x + p.y) * 0.02) * p.tilt;
    ctx.rotate(wobble);

    ctx.drawImage(this.offscreenPopcorn, -size / 2, -size / 2, size, size);

    ctx.restore();
  }

  // ---------------------------------------------------
  // CLEANUP
  // ---------------------------------------------------

  public destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.container?.remove();
  }
}

export default VFXService;
