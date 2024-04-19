import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FlyControls } from "three/addons/controls/FlyControls.js";
import { Ref } from "vue";
import cxjPath from "@/assets/models/cxj1.glb";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useSprite } from "../index";

export default function () {
  const { createCanvasSprite } = useSprite();

  const clock = new THREE.Clock();
  let scene: THREE.Scene | any = null;
  let camera: THREE.PerspectiveCamera | any = null;
  let renderer: THREE.WebGLRenderer | any = null;
  let orbitControls: OrbitControls | any = null;
  let flyControls: FlyControls | any = null;

  // 开始时间
  let start = Date.now();

  const init = (sceneRef: Ref<HTMLDivElement>) => {
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
    camera.position.set(758, 182, 21);

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

    // 添加地板
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load("/images/geometry10.png", function (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const grids = 25;
      const singleGridSize = 3000 / grids;

      for (let i = 0; i < grids; i++) {
        for (let j = 0; j < grids; j++) {
          const planeGeometry = new THREE.PlaneGeometry(
            singleGridSize,
            singleGridSize
          );
          planeGeometry.rotateX(-Math.PI / 2);

          const planeMaterial = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
            // 在这里设置材质的颜色
            color: new THREE.Color("#2f5dbd"),
          });

          const plane = new THREE.Mesh(planeGeometry, planeMaterial);
          plane.name = "floorTile";
          plane.position.y = -200;
          plane.position.x = (i + 0.5 - grids / 2) * singleGridSize;
          plane.position.z = (j + 0.5 - grids / 2) * singleGridSize;
          scene.add(plane);
        }
      }
    });

    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

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

    // 动画
    animate();
  };

  const animate = () => {
    const delta = clock.getDelta();
    // lightCircleLoop(scene)

    requestAnimationFrame(animate);
    orbitControls.update();
    flyControls.update(delta);

    // 地板颜色脉冲
    // 计算已过去的时间
    let elapsed = Date.now() - start;
    scene.children.forEach(function (child: any) {
      if (child.name === "floorTile") {
        let originPoint = new THREE.Vector3(0, 0, 0); // 坐标原点
        let distance = child.position.distanceTo(originPoint); // 计算Mesh离原点的距离
        let value = Math.sin((distance / 3000) * Math.PI * 2 - elapsed / 1000); // 计算正弦值
        let colorValue = map(value, -1, 1, 0, 1); // 将正弦函数值重新映射到 0 到 1
        child.material.color.setRGB(colorValue, colorValue, 1);
      }
    });

    renderer.render(scene, camera);
  };

  // 映射函数
  const map = (
    value: any,
    start1: any,
    stop1: any,
    start2: any,
    stop2: any
  ) => {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  };

  const openOrbitControls = () => {
    orbitControls.enabled = true;
    flyControls.enabled = false;
  }

  const openFlyControls = () => {
    orbitControls.enabled = false;
    flyControls.enabled = true;
  }

  const sceneResize = (sceneRef: Ref<HTMLDivElement>) => {
    console.log('sceneResize', sceneRef.value)
    camera!.aspect = sceneRef.value.clientWidth / sceneRef.value.clientHeight;
    camera!.updateProjectionMatrix();
    renderer!.setSize(sceneRef.value.clientWidth, sceneRef.value.clientHeight);
  }

  return {
    init,
    sceneResize,
    openOrbitControls,
    openFlyControls
  };
}
