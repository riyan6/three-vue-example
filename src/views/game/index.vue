<template>
  <div id="blocker" ref="blockerRef">
    <div id="instructions" ref="instructionsRef">
      <p style="font-size: 36px">点击开始</p>
      <p>
        移动: WASD键<br />
        跳跃: 空格键<br />
        旋转视觉: 鼠标移动
      </p>
    </div>
  </div>
  <div id="scene-container" ref="sceneRef"></div>
</template>

<script lang="ts" setup>
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { onMounted, ref } from "vue";
import useFloor from "./components/floor";
import useBoxs from "./components/boxs";
import parrotPath from "@/assets/models/Parrot.glb";
import flamingoPath from "@/assets/models/Flamingo.glb";
import storkPath from "@/assets/models/Stork.glb";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";


import useMainScene from './scene/main'

const sceneRef = ref(null) as any;
const blockerRef = ref(null) as any;
const instructionsRef = ref(null) as any;

let camera, scene, renderer, controls, raycaster;
const objects: any[] = [];

const {} = useMainScene()

// 环境光
let run = false;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let mixers: THREE.AnimationMixer[] = [];

const { floor } = useFloor();

onMounted(() => {
  init();
});

const init = async () => {
  // 创建摄像头
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.y = 10;

  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd6e2fb);
  scene.fog = new THREE.Fog(0xffffff, 0, 1000);

  // 创建灯
  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 2.5);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  // 创建控制器
  controls = new PointerLockControls(camera, sceneRef.value);

  instructionsRef.value.addEventListener("click", () => {
    controls.lock();
  });

  // 进入全屏模式，关闭所有控制面板显示
  controls.addEventListener("lock", () => {
    instructionsRef.value.style.display = "none";
    blockerRef.value.style.display = "none";
  });

  // 退出全屏模式
  controls.addEventListener("unlock", () => {
    console.log("unlock");
    instructionsRef.value.style.display = "";
    blockerRef.value.style.display = "block";
  });
  scene.add(controls.getObject());

  // 监控按键变化
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  // 创建一个三维光线投射 用于光线追踪和碰撞检测
  raycaster = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, -1, 0),
    0,
    10
  );

  // 添加地板
  scene.add(floor);

  // 添加 3D 模型
  const loader = new GLTFLoader();

  // 鸟 1
  const parrotData = await loader.loadAsync(parrotPath);
  const parrot = parrotData.scene.children[0];
  const clip = parrotData.animations[0];
  const mixer = new THREE.AnimationMixer(parrot);
  mixers.push(mixer);
  const action = mixer.clipAction(clip);
  action.play();
  parrot.position.y = 25;
  parrot.position.z = -50;
  scene.add(parrot);
  objects.push(parrot);

  const flamingoData = await loader.loadAsync(flamingoPath);
  const flamingo = flamingoData.scene.children[0];
  const clip2 = parrotData.animations[0];
  const mixer2 = new THREE.AnimationMixer(flamingo);
  mixers.push(mixer2);
  const action2 = mixer2.clipAction(clip2);
  action2.play();
  flamingo.position.x = 150;
  flamingo.position.y = 55;
  flamingo.position.z = -50;
  scene.add(flamingo);
  objects.push(flamingo);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  sceneRef.value.appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize);

  // 开始动画
  animate();
};

// 动画
const animate = () => {
  requestAnimationFrame(animate);
  const time = performance.now();
  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    // 计算操作人和环境光是否有碰撞
    const intersections = raycaster.intersectObjects(objects, false);
    const onObject = intersections.length > 0;
    const delta = (time - prevTime) / 1000;

    // 开始动画
    for (const mixer of mixers) {
      mixer.update(delta);
    }

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    // 100.0 = mass
    velocity.y -= 9.8 * 100.0 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    // 普通速度是400，按 shift 进行加速为 800
    if (moveForward || moveBackward)
      velocity.z -= direction.z * delta * (run ? 800.0 : 400.0);
    if (moveLeft || moveRight)
      velocity.x -= direction.x * delta * (run ? 800.0 : 400.0);

    // 有碰撞 即人站在箱子上，所以可以跳
    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    controls.getObject().position.y += velocity.y * delta; // new behavior

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;
    }

    // 获取玩家位置
    const playerPosition = controls.getObject().position;
    const floorHalfSize = 2000 / 2;
    const minBound = -floorHalfSize;
    const maxBound = floorHalfSize;

    if (
      playerPosition.x < minBound ||
      playerPosition.x > maxBound ||
      playerPosition.z < minBound ||
      playerPosition.z > maxBound
    ) {
      console.log("超出地图边界");
    }
  }

  prevTime = time;

  renderer.render(scene, camera);
};

// 浏览器窗口大小变动
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};

// 按下按键
const onKeyDown = (event: any) => {
  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      moveForward = true;
      break;

    case "ArrowLeft":
    case "KeyA":
      moveLeft = true;
      break;

    case "ArrowDown":
    case "KeyS":
      moveBackward = true;
      break;

    case "ArrowRight":
    case "KeyD":
      moveRight = true;
      break;

    case "Space":
      if (canJump === true) velocity.y += 350;
      canJump = false;
      break;

    case "ShiftLeft":
    case "ShiftRight":
      run = true;
      break;
  }
};

// 松开按键
const onKeyUp = (event: any) => {
  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      moveForward = false;
      break;

    case "ArrowLeft":
    case "KeyA":
      moveLeft = false;
      break;

    case "ArrowDown":
    case "KeyS":
      moveBackward = false;
      break;

    case "ArrowRight":
    case "KeyD":
      moveRight = false;
      break;

    case "ShiftLeft":
    case "ShiftRight":
      run = false;
      break;
  }
};
</script>

<style>
#blocker {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

#instructions {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  text-align: center;
  font-size: 14px;
  cursor: pointer;
  color: white;
  user-select: none;
}

#scene-container {
  width: 100%;
  height: 100vh;
}
</style>
