import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-inventory-scene',
  standalone: true,
  template: '<div #sceneHost class="scene-canvas"></div>',
  styles: [
    `
      :host, .scene-canvas { display: block; width: 100%; height: 100%; }
      .scene-canvas { cursor: grab; }
      .scene-canvas:active { cursor: grabbing; }
    `
  ]
})
export class InventorySceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sceneHost', { static: true }) private readonly sceneHost!: ElementRef<HTMLDivElement>;

  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
  private readonly cartons = new THREE.Group();
  private renderer?: THREE.WebGLRenderer;
  private resizeObserver?: ResizeObserver;
  private animationFrame = 0;
  private targetRotationX = 0;
  private targetRotationY = -0.18;
  private prefersReducedMotion = false;

  private readonly onPointerMove = (event: PointerEvent): void => {
    const bounds = this.sceneHost.nativeElement.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
    this.targetRotationY = -0.18 + horizontal * 0.22;
    this.targetRotationX = vertical * 0.1;
  };

  private readonly onPointerLeave = (): void => {
    this.targetRotationX = 0;
    this.targetRotationY = -0.18;
  };

  private readonly renderFrame = (): void => {
    if (!this.renderer) return;

    if (!this.prefersReducedMotion) {
      this.cartons.rotation.y += (this.targetRotationY - this.cartons.rotation.y) * 0.025;
      this.cartons.rotation.x += (this.targetRotationX - this.cartons.rotation.x) * 0.025;
    }

    this.renderer.render(this.scene, this.camera);
    if (!this.prefersReducedMotion) {
      this.animationFrame = window.requestAnimationFrame(this.renderFrame);
    }
  };

  ngAfterViewInit(): void {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.scene.background = null;
    this.camera.position.set(5.6, 4.1, 7.2);
    this.camera.lookAt(0, 0.65, 0);

    this.scene.add(new THREE.AmbientLight('#ffffff', 2.2));
    const keyLight = new THREE.DirectionalLight('#fff5df', 3.4);
    keyLight.position.set(-4, 7, 6);
    this.scene.add(keyLight);

    this.buildCartons();
    this.scene.add(this.cartons);

    try {
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
        preserveDrawingBuffer: true
      });
    } catch {
      return;
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.sceneHost.nativeElement.appendChild(this.renderer.domElement);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.sceneHost.nativeElement);
    if (!this.prefersReducedMotion) {
      this.sceneHost.nativeElement.addEventListener('pointermove', this.onPointerMove);
      this.sceneHost.nativeElement.addEventListener('pointerleave', this.onPointerLeave);
    }
    this.resize();
    this.renderFrame();
  }

  ngOnDestroy(): void {
    window.cancelAnimationFrame(this.animationFrame);
    this.resizeObserver?.disconnect();
    this.sceneHost.nativeElement.removeEventListener('pointermove', this.onPointerMove);
    this.sceneHost.nativeElement.removeEventListener('pointerleave', this.onPointerLeave);

    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
    this.renderer?.dispose();
  }

  private resize(): void {
    if (!this.renderer) return;
    const { width, height } = this.sceneHost.nativeElement.getBoundingClientRect();
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.renderer.render(this.scene, this.camera);
  }

  private buildCartons(): void {
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(2.15, 48),
      new THREE.MeshBasicMaterial({ color: '#426d58', transparent: true, opacity: 0.1, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.015;
    this.cartons.add(shadow);

    this.addCarton(0, 0.72, -0.12, 1.6, 1.42, 1.42, '#398f78');
    this.addCarton(-1.02, 0.42, 0.42, 0.95, 0.82, 0.98, '#ed7049');
    this.addCarton(1.05, 0.43, -0.42, 0.9, 0.84, 0.92, '#e4b64f');
    this.addCarton(0.15, 1.83, -0.12, 0.82, 0.78, 0.84, '#d96a47');
  }

  private addCarton(x: number, y: number, z: number, width: number, height: number, depth: number, color: string): void {
    const baseColor = new THREE.Color(color);
    const materials = [
      this.material(baseColor.clone().multiplyScalar(0.84)),
      this.material(baseColor.clone().multiplyScalar(0.78)),
      this.material(baseColor.clone().multiplyScalar(1.13)),
      this.material(baseColor.clone().multiplyScalar(0.72)),
      this.material(baseColor),
      this.material(baseColor.clone().multiplyScalar(0.82))
    ];
    const box = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), materials);
    box.position.set(x, y, z);
    this.cartons.add(box);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(box.geometry),
      new THREE.LineBasicMaterial({ color: '#294638', transparent: true, opacity: 0.18 })
    );
    edges.position.copy(box.position);
    this.cartons.add(edges);

    const label = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.3, height * 0.2, 0.018),
      new THREE.MeshStandardMaterial({ color: '#f8f6ec', roughness: 0.9 })
    );
    label.position.set(x - width * 0.18, y - height * 0.08, z + depth / 2 + 0.012);
    this.cartons.add(label);
  }

  private material(color: THREE.Color): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.88 });
  }
}