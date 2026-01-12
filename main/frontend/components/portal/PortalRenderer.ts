/**
 * 传送门渲染器核心类
 * 封装Three.js渲染逻辑，独立于现有Canvas 2D渲染
 * 
 * 注意：需要安装Three.js依赖
 * npm install three @types/three
 */

import type { PortalRenderConfig, PortalRendererOptions, VisualQuality } from './types';
import { PortalAnimationState } from './types';

// Three.js类型定义（动态导入，避免在未安装时报错）
type THREE = any; // 使用any避免类型检查错误，运行时动态导入

/**
 * PortalRenderer - 传送门3D渲染器
 * 使用独立的WebGL Context，不干扰现有Canvas渲染
 */
export class PortalRenderer {
  private container: HTMLElement | null = null;
  private scene: any = null; // THREE.Scene
  private camera: any = null; // THREE.PerspectiveCamera
  private renderer: any = null; // THREE.WebGLRenderer
  public portals: Map<number, PortalRenderInstance> = new Map(); // 改为public以便PortalLayer访问
  private animationFrameId: number | null = null;
  private options: Required<PortalRendererOptions>;
  private isInitialized: boolean = false;

  constructor(options: PortalRendererOptions = {}) {
    this.options = {
      quality: options.quality || 'medium',
      enableParticles: options.enableParticles !== false,
      enableLighting: options.enableLighting !== false,
      maxParticles: options.maxParticles || this.getMaxParticlesByQuality(options.quality || 'medium'),
      targetFPS: options.targetFPS || 60,
    };
  }

  /**
   * 根据质量设置获取最大粒子数
   */
  private getMaxParticlesByQuality(quality: VisualQuality): number {
    switch (quality) {
      case 'low':
        return 50;
      case 'medium':
        return 200;
      case 'high':
        return 500;
      default:
        return 200;
    }
  }

  /**
   * 初始化渲染器
   */
  async init(container: HTMLElement): Promise<void> {
    if (this.isInitialized) {
      console.warn('[PortalRenderer] 渲染器已初始化');
      return;
    }

    // 动态导入Three.js（按需加载）
    let THREE: any;
    try {
      THREE = await import('three');
    } catch (error) {
      throw new Error('Three.js未安装，请运行: npm install three @types/three');
    }

    this.container = container;

    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = null; // 透明背景，不干扰现有渲染

    // 创建相机
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({
      alpha: true, // 透明背景
      antialias: this.options.quality !== 'low',
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制像素比以提高性能
    this.renderer.setClearColor(0x000000, 0); // 透明

    // 添加到容器
    container.appendChild(this.renderer.domElement);

    // 添加光照（如果需要）
    if (this.options.enableLighting) {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      this.scene.add(directionalLight);
    }

    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize.bind(this));

    this.isInitialized = true;
    this.startRenderLoop();

    console.log('[PortalRenderer] 渲染器初始化完成');
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    if (!this.container || !this.camera || !this.renderer) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * 创建传送门实例
   */
  async createPortal(portalId: number, config: PortalRenderConfig): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('渲染器未初始化，请先调用init()');
    }

    // 动态导入Three.js
    const THREE = await import('three');

    // 根据类型创建不同的传送门渲染器
    let portalInstance: PortalRenderInstance;
    switch (config.portalType) {
      case 'stargate':
        portalInstance = new StargatePortalRenderer(portalId, config, this.scene, THREE, this.options);
        break;
      case 'wormhole':
        portalInstance = new WormholePortalRenderer(portalId, config, this.scene, THREE, this.options);
        break;
      case 'quantum':
        portalInstance = new QuantumPortalRenderer(portalId, config, this.scene, THREE, this.options);
        break;
      default:
        throw new Error(`未知的传送门类型: ${config.portalType}`);
    }

    await portalInstance.init();
    this.portals.set(portalId, portalInstance);
  }

  /**
   * 更新传送门状态
   */
  updatePortalState(portalId: number, state: PortalAnimationState): void {
    const portal = this.portals.get(portalId);
    if (portal) {
      portal.setState(state);
    }
  }

  /**
   * 更新传送门配置
   */
  updatePortalConfig(portalId: number, config: Partial<PortalRenderConfig>): void {
    const portal = this.portals.get(portalId);
    if (portal) {
      portal.updateConfig(config);
    }
  }

  /**
   * 移除传送门
   */
  removePortal(portalId: number): void {
    const portal = this.portals.get(portalId);
    if (portal) {
      portal.dispose();
      this.portals.delete(portalId);
    }
  }

  /**
   * 开始渲染循环
   */
  private startRenderLoop(): void {
    const render = () => {
      if (!this.isInitialized || !this.scene || !this.camera || !this.renderer) {
        return;
      }

      // 更新所有传送门
      this.portals.forEach(portal => {
        portal.update(0.016); // 假设60fps，每帧约16ms
      });

      // 渲染场景
      this.renderer.render(this.scene, this.camera);

      this.animationFrameId = requestAnimationFrame(render);
    };

    this.animationFrameId = requestAnimationFrame(render);
  }

  /**
   * 停止渲染循环
   */
  private stopRenderLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * 销毁渲染器
   */
  dispose(): void {
    this.stopRenderLoop();

    // 销毁所有传送门
    this.portals.forEach(portal => portal.dispose());
    this.portals.clear();

    // 清理Three.js资源
    if (this.renderer) {
      this.renderer.dispose();
      if (this.container && this.renderer.domElement) {
        this.container.removeChild(this.renderer.domElement);
      }
    }

    // 移除事件监听
    window.removeEventListener('resize', this.handleResize.bind(this));

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.container = null;
    this.isInitialized = false;

    console.log('[PortalRenderer] 渲染器已销毁');
  }
}

/**
 * 传送门渲染实例接口
 */
interface PortalRenderInstance {
  init(): Promise<void>;
  update(deltaTime: number): void;
  setState(state: PortalAnimationState): void;
  updateConfig(config: Partial<PortalRenderConfig>): void;
  dispose(): void;
}

/**
 * 星门传送门渲染器
 */
class StargatePortalRenderer implements PortalRenderInstance {
  private portalId: number;
  private config: PortalRenderConfig;
  private scene: any;
  private THREE: any;
  private options: Required<PortalRendererOptions>;
  private mesh: any = null;
  private particleSystem: any = null;
  private state: PortalAnimationState;
  private time: number = 0;

  constructor(
    portalId: number,
    config: PortalRenderConfig,
    scene: any,
    THREE: any,
    options: Required<PortalRendererOptions>
  ) {
    this.portalId = portalId;
    this.config = config;
    this.scene = scene;
    this.THREE = THREE;
    this.options = options;
    this.state = config.state;
  }

  async init(): Promise<void> {
    const THREE = this.THREE;
    const size = this.config.size;

    // 创建圆形框架（星门的外圈）
    const ringGeometry = new THREE.RingGeometry(size * 0.9, size, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x4c5fd9, // 蓝紫色
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(
      this.config.position.x,
      this.config.position.y,
      this.config.position.z
    );
    this.scene.add(ring);
    this.mesh = ring;

    // 创建粒子系统（如果启用）
    if (this.options.enableParticles) {
      this.createParticleSystem();
    }

    console.log(`[StargatePortalRenderer] 传送门 ${this.portalId} 初始化完成`);
  }

  private createParticleSystem(): void {
    const THREE = this.THREE;
    const particleCount = Math.min(this.options.maxParticles, 200);

    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // 粒子在传送门中心周围随机分布
      const radius = Math.random() * this.config.size * 0.5;
      const theta = Math.random() * Math.PI * 2;
      positions[i3] = Math.cos(theta) * radius;
      positions[i3 + 1] = Math.sin(theta) * radius;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.1;

      // 蓝紫色粒子
      colors[i3] = 0.3 + Math.random() * 0.2; // R
      colors[i3 + 1] = 0.4 + Math.random() * 0.3; // G
      colors[i3 + 2] = 0.8 + Math.random() * 0.2; // B
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });

    this.particleSystem = new THREE.Points(particles, particleMaterial);
    this.particleSystem.position.set(
      this.config.position.x,
      this.config.position.y,
      this.config.position.z
    );
    this.scene.add(this.particleSystem);
  }

  update(deltaTime: number): void {
    this.time += deltaTime;

    if (this.mesh) {
      // 旋转能量环
      const rotationSpeed = this.state === PortalAnimationState.ACTIVATED ? 0.05 : 0.01;
      this.mesh.rotation.z += rotationSpeed * deltaTime * 60;
    }

    if (this.particleSystem) {
      // 更新粒子位置（从中心向外扩散）
      const positions = this.particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const radius = Math.sqrt(positions[i] ** 2 + positions[i + 1] ** 2);
        const angle = Math.atan2(positions[i + 1], positions[i]);
        const newRadius = radius + deltaTime * 2;
        positions[i] = Math.cos(angle) * newRadius;
        positions[i + 1] = Math.sin(angle) * newRadius;
      }
      this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }
  }

  setState(state: PortalAnimationState): void {
    this.state = state;
    // 根据状态调整动画速度
    if (this.mesh) {
      const material = this.mesh.material;
      if (state === PortalAnimationState.ACTIVATED || state === PortalAnimationState.TELEPORTING) {
        material.opacity = 1.0;
        material.emissive = new this.THREE.Color(0xffffff);
        material.emissiveIntensity = 0.5;
      } else {
        material.opacity = 0.8;
        material.emissive = new this.THREE.Color(0x000000);
        material.emissiveIntensity = 0;
      }
    }
  }

  updateConfig(config: Partial<PortalRenderConfig>): void {
    if (config.position && this.mesh) {
      this.mesh.position.set(config.position.x, config.position.y, config.position.z);
      if (this.particleSystem) {
        this.particleSystem.position.set(config.position.x, config.position.y, config.position.z);
      }
    }
    if (config.size !== undefined) {
      this.config.size = config.size;
      // 重建几何体
      this.rebuild();
    }
    if (config.opacity !== undefined && this.mesh) {
      this.mesh.material.opacity = config.opacity;
    }
  }

  private rebuild(): void {
    // TODO: 重建传送门几何体
  }

  dispose(): void {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
    if (this.particleSystem) {
      this.scene.remove(this.particleSystem);
      this.particleSystem.geometry.dispose();
      this.particleSystem.material.dispose();
      this.particleSystem = null;
    }
  }
}

/**
 * 虫洞传送门渲染器
 */
class WormholePortalRenderer implements PortalRenderInstance {
  private portalId: number;
  private config: PortalRenderConfig;
  private scene: any;
  private THREE: any;
  private options: Required<PortalRendererOptions>;
  private mesh: any = null;
  private state: PortalAnimationState;
  private time: number = 0;

  constructor(
    portalId: number,
    config: PortalRenderConfig,
    scene: any,
    THREE: any,
    options: Required<PortalRendererOptions>
  ) {
    this.portalId = portalId;
    this.config = config;
    this.scene = scene;
    this.THREE = THREE;
    this.options = options;
    this.state = config.state;
  }

  async init(): Promise<void> {
    const THREE = this.THREE;
    const size = this.config.size;

    // 创建椭圆形的虫洞效果
    const geometry = new THREE.PlaneGeometry(size * 1.2, size * 0.8, 32, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        distortion: { value: 0.5 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float distortion;
        varying vec2 vUv;
        void main() {
          vec2 uv = vUv - 0.5;
          float dist = length(uv);
          float warp = sin(dist * 10.0 - time * 2.0) * distortion;
          vec3 color = mix(vec3(0.1, 0.0, 0.2), vec3(0.0, 0.5, 0.8), dist);
          gl_FragColor = vec4(color, 0.7);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(
      this.config.position.x,
      this.config.position.y,
      this.config.position.z
    );
    this.scene.add(this.mesh);

    console.log(`[WormholePortalRenderer] 传送门 ${this.portalId} 初始化完成`);
  }

  update(deltaTime: number): void {
    this.time += deltaTime;
    if (this.mesh && this.mesh.material.uniforms) {
      this.mesh.material.uniforms.time.value = this.time;
      const distortion = this.state === PortalAnimationState.TELEPORTING ? 1.5 : 0.5;
      this.mesh.material.uniforms.distortion.value = distortion;
    }
  }

  setState(state: PortalAnimationState): void {
    this.state = state;
  }

  updateConfig(config: Partial<PortalRenderConfig>): void {
    if (config.position && this.mesh) {
      this.mesh.position.set(config.position.x, config.position.y, config.position.z);
    }
    if (config.opacity !== undefined && this.mesh) {
      this.mesh.material.opacity = config.opacity;
    }
  }

  dispose(): void {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
  }
}

/**
 * 量子传送门渲染器
 */
class QuantumPortalRenderer implements PortalRenderInstance {
  private portalId: number;
  private config: PortalRenderConfig;
  private scene: any;
  private THREE: any;
  private options: Required<PortalRendererOptions>;
  private mesh: any = null;
  private state: PortalAnimationState;
  private time: number = 0;

  constructor(
    portalId: number,
    config: PortalRenderConfig,
    scene: any,
    THREE: any,
    options: Required<PortalRendererOptions>
  ) {
    this.portalId = portalId;
    this.config = config;
    this.scene = scene;
    this.THREE = THREE;
    this.options = options;
    this.state = config.state;
  }

  async init(): Promise<void> {
    const THREE = this.THREE;
    const size = this.config.size;

    // 创建六边形框架
    const shape = new THREE.Shape();
    const sides = 6;
    const radius = size * 0.5;
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }

    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffff, // 青色
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      wireframe: false,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(
      this.config.position.x,
      this.config.position.y,
      this.config.position.z
    );
    this.scene.add(this.mesh);

    console.log(`[QuantumPortalRenderer] 传送门 ${this.portalId} 初始化完成`);
  }

  update(deltaTime: number): void {
    this.time += deltaTime;
    if (this.mesh) {
      // 闪烁效果
      const opacity = 0.6 + Math.sin(this.time * 5) * 0.2;
      this.mesh.material.opacity = opacity;
    }
  }

  setState(state: PortalAnimationState): void {
    this.state = state;
  }

  updateConfig(config: Partial<PortalRenderConfig>): void {
    if (config.position && this.mesh) {
      this.mesh.position.set(config.position.x, config.position.y, config.position.z);
    }
    if (config.opacity !== undefined && this.mesh) {
      this.mesh.material.opacity = config.opacity;
    }
  }

  dispose(): void {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
  }
}
