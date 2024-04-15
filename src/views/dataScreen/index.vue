<template>
  <div class="data-screen-container">
    <div class="data-screen-content" ref="dataScreenRef">
      <div class="data-screen-scene" ref="sceneRef"></div>
      <div class="data-screen-header">
        <h2>XXX设备监控平台</h2>
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
  renderer.setSize(sceneRef.value!.clientWidth, sceneRef.value!.clientHeight);
  sceneRef.value!.appendChild(renderer.domElement);

  // camera
  camera = new THREE.PerspectiveCamera(
      60,
      sceneRef.value!.clientWidth / sceneRef.value!.clientHeight,
      1,
      2500
  );
  camera.position.set(489, 98, -19);

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

  const helper1 = new THREE.GridHelper(3000, 100, 0x68cbe0, 0x68cbe0);
  helper1.position.y = -199;
  helper1.material.opacity = 0.25;
  helper1.material.transparent = true;
  scene.add(helper1);
  // 颜色稍有不同
  const helper2 = new THREE.GridHelper(3000, 100, 0xffffff, 0xffffff);
  // 确保与helper1在同一高度，形成双重线条效果
  helper2.position.y = -190;
  helper2.material.opacity = 0.25;
  helper2.material.transparent = true;
  scene.add(helper2);

  // 添加机台模型
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(cxjPath, (obj) => {
    const model = obj.scene;
    model.scale.set(500, 500, 500)
    model.position.set(0, 0, 0)
    // 计算模型的边界
    const box = new THREE.Box3().setFromObject(model);
    // 计算模型的高度
    const modelHeight = box.max.y - box.min.y;
    // 将模型沿y轴向下移动模型高度的一半，使其在原点处
    model.position.y -= modelHeight;
    // 场景添加模型
    scene!.add(model);
  });

  billboard = createBillboard("45号ZB48包装机");
  billboard.position.set(0, 10, 0);
  billboard.scale.set(100, 50, 50);
  scene.add(billboard);

  // 创建一个新的平面几何体
  // 创建一个点光源并添加到场景内
  var pointLight = new THREE.PointLight(0xffffff, 1, 3000);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);

  // 添加一个对应光源的helper
  var pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
  scene.add(pointLightHelper);

  circle = new THREE.RingGeometry(ringInnerRadius, lightRadius, 100);
  material = new THREE.MeshBasicMaterial({
    color: 0x84a8e2, // 这是圆形颜色，你可以根据需要更改
    side: THREE.DoubleSide
  });
  meshCircle = new THREE.Mesh(circle, material);
  meshCircle.position.set(0, -200, 0); // 这个是圆形位置
  meshCircle.rotateX(-Math.PI / 2);
  scene.add(meshCircle);

  // 动画
  animate();
}

let billboard: THREE.Sprite | null = null;
let ringInnerRadius = 200;
let lightRadius = 0;
let material: THREE.MeshBasicMaterial | null = null;
let circle: THREE.RingGeometry | null = null;
let meshCircle: THREE.Mesh | null = null;

const animate = () => {
  // 更新光圈移动半径
  if (lightRadius > 1500) {  // 圆形半径大于地板尺寸的一半，即超出地板
    lightRadius = 50;  // 外半径重置为50
    ringInnerRadius = 0; // 内半径重置为0
    scene!.remove(meshCircle!); // 移除旧的环形

    // 重新生成新的环形
    circle = new THREE.RingGeometry(ringInnerRadius, lightRadius, 32);
    meshCircle = new THREE.Mesh(circle, material!);
    meshCircle.position.set(0, -200, 0);
    meshCircle.rotateX(-Math.PI / 2);
    scene!.add(meshCircle);
  } else {
    lightRadius += 12;  // 外半径逐渐增大
    ringInnerRadius += 12; //内半径逐渐增大
    scene!.remove(meshCircle!); // 移除旧的环形

    // 根据新的半径生成新的环形
    circle = new THREE.RingGeometry(ringInnerRadius, lightRadius, 32);
    meshCircle = new THREE.Mesh(circle, material!);
    meshCircle.position.set(0, -200, 0);
    meshCircle.rotateX(-Math.PI / 2);
    scene!.add(meshCircle);
  }

  // 看向摄像头
  billboard!.lookAt(camera!.position);

  requestAnimationFrame(animate);
  controls!.update();
  renderer!.render(scene!, camera!);
}

// 创建看板
const createBillboard = (text: string) => {
  var canvas = document.createElement('canvas');
  var ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  
  // 设置canvas的尺寸
  canvas.width = 512;
  canvas.height = 128;
  
  // 填充背景色
  ctx!.fillStyle = '#3265cb';
  ctx!.fillRect(0, 0, canvas.width, canvas.height);
  
  // 设置文字样式
  ctx!.font = '60px Arial';
  ctx!.fillStyle = 'white';
  
  // 将文字写在canvas中央
  ctx!.textAlign = 'center';
  ctx!.textBaseline = 'middle';
  ctx!.fillText(text, canvas.width / 2, canvas.height / 2);
  
  // 创建一个纹理，其源为canvas
  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  
  // 创建一个material，将此纹理应用于material上
  var material = new THREE.SpriteMaterial({map: texture});
  
  // 然后创建一个sprite并返回
  return new THREE.Sprite(material);
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
  camera!.aspect = sceneRef.value!.clientWidth / sceneRef.value!.clientHeight;
  camera!.updateProjectionMatrix();
  renderer!.setSize(sceneRef.value!.clientWidth, sceneRef.value!.clientHeight);

  resize();
};
</script>

<style scoped lang="less">
@import "./index.less";
</style>