<template>
  <div class="scene-container" ref="sceneRef"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

import parrotModelPath from "@/assets/models/Parrot.glb";
import flamingoModelPath from "@/assets/models/Flamingo.glb";
import storkModelPath from "@/assets/models/Stork.glb";

const sceneRef = ref(null) as any;

let scene: THREE.Scene | any = null;
let camera: THREE.PerspectiveCamera | any = null;
let renderer: THREE.WebGLRenderer | any = null;
let mixers: THREE.AnimationMixer[] = []
const clock = new THREE.Clock();

onMounted(() => {
  init();
});

// 初始化
const init = () => {
  // 场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color("skyblue");
  // 相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // 渲染器
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 添加dom元素
  sceneRef.value.appendChild(renderer.domElement);

  // 创建控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", () => {
    renderer.render(scene, camera);
  });

  // 环境光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 4);
  scene.add(ambientLight);

  // 点光源
  const pointLight = new THREE.PointLight(0xffffff, 4);
  pointLight.position.set(50, 50, 50);
  scene.add(pointLight);

  // 开始渲染
  renderer.render(scene, camera);

  // 添加鸟
  loadBirds();
};

// 加载鸟的模型
const loadBirds = async () => {
  const loader = new GLTFLoader();
  const [parrotData, flamingoData, storkData] = await Promise.all([
    loader.loadAsync(parrotModelPath),
    loader.loadAsync(flamingoModelPath),
    loader.loadAsync(storkModelPath),
  ]);

  const parrot = setupModel(parrotData);
  parrot.position.set(-100, 0, -100);

  const flamingo = setupModel(flamingoData);
  flamingo.position.set(75, 0, -200);

  const stork = setupModel(storkData);
  stork.position.set(0, -2.5, 0);
  
  // 将模型添加至场景中
  scene.add(parrot);
  scene.add(flamingo);
  scene.add(stork);

  // 渲染
  camera.position.z = 200;
  renderer.render(scene, camera);

  animate();
};

const setupModel = (data: any) => {
  // 获取模型
  const model = data.scene.children[0];
  // 获取动画
  const clip = data.animations[0]
  // 创建动画混合器
  const mixer = new THREE.AnimationMixer(model)
  mixers.push(mixer)
  // 创建动作 并绑定剪辑
  const action = mixer.clipAction(clip)
  console.log(action)
  action.play();
  return model;
};

const animate = () => {
  for (const mixer of mixers) {
    mixer.update(clock.getDelta())
  }
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
</script>

<style scoped>
.scene-container {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: skyblue;
}
</style>
