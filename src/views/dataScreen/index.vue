<template>
  <div class="data-screen-container">
    <div class="data-screen-content" ref="dataScreenRef">
      <div class="data-screen-scene" ref="sceneRef"></div>
      <div class="data-screen-header">
        <h2>XXX设备监控平台 ({{ pos.x }},{{ pos.y }},{{ pos.z }})</h2>
      </div>
      <div class="data-screen-main">
        <div class="data-screen-left" v-if="showBothSideInfo">
          <div class="data-screen-left-top">board_1</div>
          <div class="data-screen-left-center">board_2</div>
          <div class="data-screen-left-bottom">board_3</div>
        </div>
        <div class="data-screen-right" v-if="showBothSideInfo">
          <div class="data-screen-right-top">board_4</div>
          <div class="data-screen-right-center">board_5</div>
          <div class="data-screen-right-bottom">board_6</div>
        </div>
        <div class="data-screen-footer">
          <el-button
            :type="isRoamingMode ? 'primary' : ''"
            @click="switchRoamingMode"
            >漫游模式：{{ isRoamingMode ? "开" : "关" }}</el-button
          >
          <el-button
            :type="showBothSideInfo ? 'primary' : ''"
            @click="showBothSideInfo = !showBothSideInfo"
            >显示两侧信息：{{ showBothSideInfo ? "是" : "否" }}</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { onBeforeUnmount, onMounted, ref, h } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FlyControls } from "three/addons/controls/FlyControls.js";
import cxjPath from "@/assets/models/cxj1.glb";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useSprite } from "./scene";
import { reactive } from "vue";
import { ElMessage } from "element-plus";
// import useLightCircle from './scene/useLightCircle'

// 显示两边信息
const showBothSideInfo = ref(false);
// 漫游模式
const isRoamingMode = ref(false);
// 坐标信息
const pos = reactive({
  x: "0",
  y: "0",
  z: "0",
});

const dataScreenRef = ref<HTMLElement | any>(null);
const sceneRef = ref<HTMLElement | any>(null);

const clock = new THREE.Clock();
let scene: THREE.Scene | any = null;
let camera: THREE.PerspectiveCamera | any = null;
let renderer: THREE.WebGLRenderer | any = null;
let orbitControls: OrbitControls | any = null;
let flyControls: FlyControls | any = null;

const { createCanvasSprite } = useSprite();
// const { createLightCircle, lightCircleLoop } = useLightCircle();

onMounted(() => {
  if (dataScreenRef.value) {
    dataScreenRef.value.style.transform = `scale(${getScale()}) translate(-50%, -50%)`;
    dataScreenRef.value.style.width = `1920px`;
    dataScreenRef.value.style.height = `1080px`;
  }
  init();
  window.addEventListener("resize", onWindowResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
});

const init = () => {
  // scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x252f4a);

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
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
  // camera.position.set(0,0,0);

  // orbitControls
  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.05;
  orbitControls.screenSpacePanning = false;
  orbitControls.minDistance = 100;
  orbitControls.maxDistance = 1000;
  orbitControls.maxPolarAngle = Math.PI / 2;

  // flyControls
  flyControls = new FlyControls(camera, renderer.domElement);
  flyControls.movementSpeed = 500;
  flyControls.domElement = renderer.domElement;
  flyControls.rollSpeed = Math.PI / 24;
  flyControls.autoForward = false;
  flyControls.dragToLook = false;
  flyControls.enabled = false;

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
  const planeMaterial = new THREE.ShadowMaterial({
    color: 0x000000,
    opacity: 0.2,
  });

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
    model.scale.set(500, 500, 500);
    model.position.set(0, 0, 0);
    // 计算模型的边界
    const box = new THREE.Box3().setFromObject(model);
    // 计算模型的高度
    const modelHeight = box.max.y - box.min.y;
    // 将模型沿y轴向下移动模型高度的一半，使其在原点处
    model.position.y -= modelHeight;

    const sprite = createCanvasSprite(
      "机台名称:包装机1#  当前牌号:牌号A  运行状态：正常运行"
    );
    model.children.push(sprite);
    // 场景添加模型
    scene.add(model);
  });
  //
  // billboard = createBillboard(['机台名称：包装机1#', '当前牌号：牌号A', '运行状态：正常运行']);
  // billboard.position.set(0, 10, 0);
  // billboard.scale.set(100, 50, 50);
  // scene.add(billboard);

  // 创建一个点光源并添加到场景内
  // const pointLight = new THREE.PointLight(0xffffff, 1, 3000);
  // pointLight.position.set(0, 0, 0);
  // scene.add(pointLight);

  // 添加一个对应光源的helper
  // const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
  // scene.add(pointLightHelper);

  // const meshCircle = createLightCircle();
  // scene.add(meshCircle)

  // 动画
  animate();
};

const animate = () => {
  const delta = clock.getDelta();
  // lightCircleLoop(scene)

  requestAnimationFrame(animate);
  orbitControls.update();
  flyControls.update(delta);

  renderer!.render(scene!, camera!);

  // 更新坐标
  pos.x = Number(camera.position.x).toFixed(2);
  pos.y = Number(camera.position.y).toFixed(2);
  pos.z = Number(camera.position.z).toFixed(2);
};

// const roamingMsg = ref<any>({})
// 在el-button点击事件触发时，切换漫游模式
const switchRoamingMode = () => {
  isRoamingMode.value = !isRoamingMode.value;
  if (isRoamingMode.value) {
    // 开启漫游模式时，禁用 OrbitControls
    orbitControls.enabled = false;
    flyControls.enabled = true;
    // WASD移动，R|F上|下，Q|E滚动，上|下俯仰，左|右偏航
    ElMessage({
      message: h("p", { style: "line-height: 1; font-size: 14px" }, [
        h("p", null, [
          h("span", { style: "color: teal" }, "WASD"),
          h("span", null, "移动,"),
          h("span", { style: "color: teal" }, "RF"),
          h("span", null, "上下,"),
          h("span", { style: "color: teal" }, "QE"),
          h("span", null, "滚动,"),
          h("span", { style: "color: teal" }, "鼠标滚轮"),
          h("span", null, "调节俯仰视角,"),
          h("span", { style: "color: teal" }, "鼠标左键右键"),
          h("span", null, "拉伸视角"),
        ]),
      ]),
      duration: 0,
      type: "success",
      plain: true,
      offset: 60
    });
  } else {
    // 关闭漫游模式时，启用 OrbitControls
    orbitControls.enabled = true;
    flyControls.enabled = false;
    ElMessage.closeAll();
  }
};

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
