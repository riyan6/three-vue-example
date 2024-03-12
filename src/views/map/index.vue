<template>
  <div id="scene" ref="sceneRef"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

const sceneRef = ref(null) as any;
const settings = ref<any>({
  color: "#cccccc",
  density: 0.002,
});

let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let controls: MapControls | null = null;
let raycaster: THREE.Raycaster | null = null;

onMounted(() => {
  init();
});

const init = () => {
  // raycaster
  raycaster = new THREE.Raycaster();

  // scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);
  scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  sceneRef.value.appendChild(renderer.domElement);

  // camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1500
  );
  camera.position.set(0, 200, -400);

  // controls
  controls = new MapControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = false;

  controls.minDistance = 100;
  controls.maxDistance = 500;

  controls.maxPolarAngle = Math.PI / 2;

  // world
  const geometry = new THREE.BoxGeometry();
  geometry.translate(0, 0.5, 0);
  const material = new THREE.MeshPhongMaterial({
    color: 0x999999,
    flatShading: true,
  });

  for (let i = 0; i < 20; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = Math.random() * 1600 - 800;
    mesh.position.y = 0;
    mesh.position.z = Math.random() * 1600 - 800;
    mesh.scale.x = 20;
    mesh.scale.y = Math.random() * 100 + 10;
    mesh.scale.z = 20;
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    scene.add(mesh);
  }

  // lights
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
  dirLight1.position.set(1, 1, 1);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x002288, 3);
  dirLight2.position.set(-1, -1, -1);
  scene.add(dirLight2);

  const ambientLight = new THREE.AmbientLight(0x555555);
  scene.add(ambientLight);

  window.addEventListener("resize", onWindowResize);

  const gui = new GUI();
  gui.add(controls, "zoomToCursor");
  gui.add(controls, "screenSpacePanning");

  gui.addColor(settings.value, "color").onChange((newColor) => {
    settings.value.color = newColor;
    scene!.fog = new THREE.FogExp2(new THREE.Color(newColor), 0.002);
  });

  gui.add(settings.value, "density", 0, 0.01).onChange((newVal) => {
    settings.value.density = newVal;
    scene!.fog = new THREE.FogExp2(
      new THREE.Color(settings.value.color),
      newVal
    );
  });

  // 鼠标点击 与 mesh 交互
  renderer.domElement.addEventListener("click", (event: any) => {
    // 计算鼠标点击位置与屏幕的相对坐标（范围是[-1, 1]）
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 将射线投射器的观察点和方向设置为鼠标点击的位置
    raycaster!.setFromCamera(mouse, camera!);

    // 计算射线与场景中的对象相交的结果
    const intersects = raycaster!.intersectObjects(scene!.children, true);

    if (intersects.length > 0) {
      // 获取与射线相交的第一个 mesh 对象
      const mesh = intersects[0].object;

      // 在这里可以实现鼠标点击 mesh 后的逻辑
      console.log("点击了mesh", mesh);

      // 移除 mesh
      scene!.remove(mesh);

      // 添加对几何图形和材质的清理
      if (mesh instanceof THREE.Mesh) {
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
    }
  });

  // 动画
  animate();
};

const animate = () => {
  requestAnimationFrame(animate);
  controls!.update();
  renderer!.render(scene!, camera!);
};

const onWindowResize = () => {
  camera!.aspect = window.innerWidth / window.innerHeight;
  camera!.updateProjectionMatrix();

  renderer!.setSize(window.innerWidth, window.innerHeight);
};
</script>

<style scoped>
#scene {
  position: relative;
  width: 100%;
  height: 100vh;
}
</style>
