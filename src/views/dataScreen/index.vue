<template>
  <div class="data-screen-container">
    <div class="data-screen-content" ref="dataScreenRef">
      <div class="data-screen-scene" ref="sceneRef"></div>
      <div class="data-screen-header">
        <h2>标题五个字</h2>
      </div>
      <div class="data-screen-main">
        <div class="data-screen-left">
          <div class="data-screen-left-top">board_1</div>
          <div class="data-screen-left-center">board_2</div>
          <div class="data-screen-left-bottom">board_3</div>
        </div>
        <div class="data-screen-right">
          <div class="data-screen-right-top">board_4</div>
          <div class="data-screen-right-center">board_5</div>
          <div class="data-screen-right-bottom">board_6</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import {onBeforeUnmount, onMounted, ref} from "vue";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import cxjPath from '@/assets/models/cxj1.glb';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

const dataScreenRef = ref<HTMLElement | null>(null);
const sceneRef = ref<HTMLElement | null>(null);

let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let controls: OrbitControls | null = null;

onMounted(() => {
  if (dataScreenRef.value) {
    dataScreenRef.value.style.transform = `scale(${getScale()}) translate(-50%, -50%)`;
    dataScreenRef.value.style.width = `1920px`;
    dataScreenRef.value.style.height = `1080px`;
  }
  init();
  window.addEventListener("resize", onWindowResize);
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
});

const init = () => {
  // scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x252f4a);

  // renderer
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(sceneRef.value.clientWidth, sceneRef.value.clientHeight);
  sceneRef.value.appendChild(renderer.domElement);

  // camera
  camera = new THREE.PerspectiveCamera(
      60,
      sceneRef.value.clientWidth / sceneRef.value.clientHeight,
      1,
      2500
  );
  camera.position.set(20, 77, 493);

  // controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 100;
  controls.maxDistance = 1000;
  controls.maxPolarAngle = Math.PI / 2;

  // lights
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
  dirLight1.position.set(1, 1, 1);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x002288, 3);
  dirLight2.position.set(-1, -1, -1);
  scene.add(dirLight2);

  const ambientLight = new THREE.AmbientLight(0x555555);
  scene.add(ambientLight);

  // 添加地板
  const planeGeometry = new THREE.PlaneGeometry(3000, 3000);
  planeGeometry.rotateX(-Math.PI / 2);
  const planeMaterial = new THREE.ShadowMaterial({color: 0x000000, opacity: 0.2});

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.y = -200;
  plane.receiveShadow = true;
  scene.add(plane);

  const helper = new THREE.GridHelper(2000, 100, 0x128dfd, 0x128dfd);
  helper.position.y = -199;
  helper.material.opacity = 0.25;
  helper.material.transparent = true;
  scene.add(helper);

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(cxjPath, (obj) => {
    const model = obj.scene;
    model.scale.set(500,500,500)
    model.position.set(0,0,0)
    console.log(model)

    // 计算模型的边界
    const box = new THREE.Box3().setFromObject(model);

    // 计算模型的高度
    const modelHeight = box.max.y - box.min.y;

    // 将模型沿y轴向下移动模型高度的一半，使其在原点处
    model.position.y -= modelHeight;

    scene!.add(model);
  });

  // 动画
  animate();
}

const animate = () => {
  requestAnimationFrame(animate);
  controls!.update();
  renderer!.render(scene!, camera!);
}

// 设置响应式
const resize = () => {
  if (dataScreenRef.value) {
    dataScreenRef.value.style.transform = `scale(${getScale()}) translate(-50%, -50%)`;
  }
};

// 根据浏览器大小推断缩放比例
const getScale = (width = 1920, height = 1080) => {
  let ww = window.innerWidth / width;
  let wh = window.innerHeight / height;
  return ww < wh ? ww : wh;
};

const onWindowResize = () => {
  camera!.aspect = sceneRef.value.clientWidth / sceneRef.value.clientHeight;
  camera!.updateProjectionMatrix();
  renderer!.setSize(sceneRef.value.clientWidth, sceneRef.value.clientHeight);

  resize();
};
</script>

<style scoped lang="less">
@import "./index.less";
</style>