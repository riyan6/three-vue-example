import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { Ref, ref } from "vue";
import useFloor from "../components/floor";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { AMFLoader } from "three/examples/jsm/loaders/AMFLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import rookPath from "@/assets/models/rook.amf";
import parrotPath from "@/assets/models/Parrot.glb";
import storkPath from "@/assets/models/Stork.glb";
import TWEEN from "@tweenjs/tween.js";

export default function () {
  // 控制面板显示
  const blockerVisible = ref(true);
  const instructionsVisible = ref(true);
  const position = ref({
    x: 0,
    y: 0,
    z: 0,
  });
  // 获取地板
  const { floor } = useFloor();

  let camera: THREE.PerspectiveCamera | any = null;
  let renderer: THREE.Renderer | any = null;
  let scene: THREE.Scene | any = null;
  let raycaster: THREE.Raycaster | any = null;
  let controls: PointerLockControls | any = null;

  let clock = new THREE.Clock();
  const stats = new Stats();

  let run = false;
  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let canJump = false;

  // 方向
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();

  // 动画混合器集合
  let mixers: THREE.AnimationMixer[] = [];

  // 场景中的所有对象
  const objects: any[] = [];

  // 初始化场景
  const initScene = (sceneRef: Ref<any>) => {
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
    scene.fog = new THREE.Fog(0x8a8a94, 0, 1500);

    // 创建灯
    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 2.5);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);

    // 创建控制器
    controls = new PointerLockControls(camera, sceneRef.value);
    controls.addEventListener("lock", onControlsLock);
    controls.addEventListener("unlock", onControlsUnlock);
    scene.add(controls.getObject());

    // 添加帧率监控 stats
    sceneRef.value.appendChild(stats.dom);

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

    // 添加国际象棋
    const amfLoader = new AMFLoader();
    amfLoader.load(rookPath, (obj) => {
      obj.scale.set(50, 50, 50);
      obj.position.set(100, 0, 100);
      obj.rotation.x = -(Math.PI / 2);
      scene.add(obj);
      objects.push(obj);
    });

    // 添加鸟
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(parrotPath, (obj) => {
      const model = obj.scene;
      model.position.set(0, 30, -50);
      // 创建动画相关
      const clip = obj.animations[0];
      const mixer = new THREE.AnimationMixer(model);
      mixers.push(mixer);
      // 开始动作
      const action = mixer.clipAction(clip);
      action.play();
      scene.add(model);
      objects.push(model);
    });

    gltfLoader.load(storkPath, (obj) => {
      const model = obj.scene;
      model.position.set(0, 500, -100);
      model.scale.set(10, 10, 10);
      model.rotation.set(0, Math.PI / 3, 0);
      // 创建动画相关
      const clip = obj.animations[0];
      const mixer = new THREE.AnimationMixer(model);
      mixers.push(mixer);
      // 开始动作
      const action = mixer.clipAction(clip);
      action.play();
      scene.add(model);
      objects.push(model);
    });

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    sceneRef.value.appendChild(renderer.domElement);

    // 监听窗口变化 实时改变场景大小
    window.addEventListener("resize", onWindowResize);

    // 监听触控
    document.addEventListener("touchstart", onTouchStart, false);
    document.addEventListener("touchmove", onTouchMove, false);
    document.addEventListener("touchend", onTouchEnd, false);

    animate();
  };

  // 刷新帧
  const animate = () => {
    requestAnimationFrame(animate);
    if (controls.isLocked === true) {
      // 获取玩家位置
      const playerPosition = controls.getObject().position;
      const floorHalfSize = 2000 / 2;
      const minBound = -floorHalfSize;
      const maxBound = floorHalfSize;

      // 检查玩家是否在边界内，如果不在则调整出去 做一个空气墙
      if (playerPosition.x < minBound) {
        playerPosition.x = minBound;
      } else if (playerPosition.x > maxBound) {
        playerPosition.x = maxBound;
      }

      if (playerPosition.z < minBound) {
        playerPosition.z = minBound;
      } else if (playerPosition.z > maxBound) {
        playerPosition.z = maxBound;
      }

      raycaster.ray.origin.copy(controls.getObject().position);
      raycaster.ray.origin.y -= 10;

      // 计算操作人和环境光是否有碰撞
      const intersections = raycaster.intersectObjects(objects, true);
      const onObject = intersections.length > 0;
      const delta = clock.getDelta();

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
        // 当在空中时y垂直速度小于0，在实物上垂直速度等于 0。设置为 0 则静止在实物上。
        velocity.y = Math.max(0, velocity.y);
        canJump = true;
      }

      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);
      // new behavior
      controls.getObject().position.y += velocity.y * delta;

      if (controls.getObject().position.y < 10) {
        velocity.y = 0;
        controls.getObject().position.y = 10;
        canJump = true;
      }
    }

    // 更新位置
    position.value = {
      x: parseInt(controls.getObject().position.x),
      y: parseInt(controls.getObject().position.y),
      z: parseInt(controls.getObject().position.z),
    };

    TWEEN.update();
    // 更新帧率
    stats.update();
    // 渲染
    renderer.render(scene, camera);
  };

  const handleControlsLock = () => {
    controls.lock();
  };

  const move = () => {
    const now = {
      x: controls.getObject().position.x,
      y: controls.getObject().position.y,
      z: controls.getObject().position.z,
    };
    var tween = new TWEEN.Tween(now)
      .to({ x: 999, y: 10, z: -999 }, 3000)
      // .easing( TWEEN.Easing.Elastic.InOut )
      .onStart(() => {
        console.log("tween start");
      })
      .onUpdate((obj) => {
        controls.getObject().position.x = obj.x;
        controls.getObject().position.y = obj.y;
        controls.getObject().position.z = obj.z;
        console.log(obj);
      })
      .start();
  };

  const onControlsLock = () => {
    blockerVisible.value = false;
    instructionsVisible.value = false;
  };

  const onControlsUnlock = () => {
    blockerVisible.value = true;
    instructionsVisible.value = true;
  };

  // 键盘 按下按键
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

  // 键盘 松开按键
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

  // 浏览器窗口大小变动
  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  let touchStartPos = { x: 0, y: 0 };
  let touchEndPos = { x: 0, y: 0 };

  // 处理开始触摸事件
  const onTouchStart = (event: any) => {
    touchStartPos.x = event.touches[0].clientX;
    touchStartPos.y = event.touches[0].clientY;
  };

  // 处理触摸移动事件
  const onTouchMove = (event: any) => {
    // 获取滑动当前位置
    touchEndPos.x = event.touches[0].clientX;
    touchEndPos.y = event.touches[0].clientY;

    // 计算滑动偏移
    let delatX = touchEndPos.x - touchStartPos.x;
    let deltaY = touchEndPos.y - touchStartPos.y;

    // 根据滑动方向和距离模拟 WASD 移动或视角旋转

    if (Math.abs(delatX) > Math.abs(deltaY)) {
      // 左右滑动
      if (delatX > 0) {
        // 右滑
        moveRight = true;
        moveLeft = false;
      } else {
        // 左滑
        moveLeft = true;
        moveRight = false;
      }
    } else {
      // 上下滑动
      if (deltaY > 0) {
        // 下滑
        moveBackward = true;
        moveForward = false;
      } else {
        // 上滑
        moveForward = true;
        moveBackward = false;
      }
    }
  };

  // 处理触摸结束事件
  const onTouchEnd = (event: any) => {
    moveForward = false;
    moveBackward = false;
    moveLeft = false;
    moveRight = false;
  };

  return {
    initScene,
    handleControlsLock,
    blockerVisible,
    instructionsVisible,
    position,
  };
}
