import * as THREE from "three";
import { Ref } from "vue";
import useControls from "../controls/use-controls.ts";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GltfUtil } from "../util/gltf-util.ts";
import littlestTokyoPath from "../../../../assets/models/LittlestTokyo.glb";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

const { createOrbitControls } = useControls();

let scene: THREE.Scene | null;
let renderer: THREE.WebGLRenderer | null;
let camera: THREE.PerspectiveCamera | null;
let controls: OrbitControls | null;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

const mixers: THREE.AnimationMixer[] = [];
const clock = new THREE.Clock();
const gltfUtil = new GltfUtil();
const stats = new Stats();

class MainScene {
  constructor(sceneDom: Ref<HTMLDivElement | null>) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xc6e2dd);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(sceneDom.value!.clientWidth, sceneDom.value!.clientHeight);
    sceneDom.value!.appendChild(renderer.domElement);
    sceneDom.value!.appendChild(stats.dom);

    camera = new THREE.PerspectiveCamera(
      40,
      sceneDom.value!.clientWidth / sceneDom.value!.clientHeight,
      1,
      1000
    );
    camera.position.set(5, 2, 8);

    // controls
    controls = createOrbitControls(camera, renderer);
    controls.target.set(0, 0.5, 0);
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2;
    controls.enableZoom = false;

    // world
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    gltfUtil.getInstance()!.setDRACOLoader(dracoLoader);
    gltfUtil.getInstance()!.load(littlestTokyoPath, (gltf) => {
      const model = gltf.scene;
      model.position.set(1, 1, 0);
      model.scale.set(0.01, 0.01, 0.01);
      scene!.add(model);

      const mixer = new THREE.AnimationMixer(model);
      mixers.push(mixer);
      mixer.clipAction(gltf.animations[0]).play();
    });

    // lights
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
    dirLight1.position.set(1, 1, 1);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 3);
    dirLight2.position.set(-1, -1, -1);
    scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight("white");
    scene.add(ambientLight);

    // 动画
    this.animate();

    window.addEventListener(
      "click",
      (event) => {
        event.preventDefault();

        // 将鼠标点击位置的坐标（屏幕坐标系）转为标准化设备坐标（范围在-1到1之间）
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // 通过摄像机和当前鼠标位置更新射线
        raycaster.setFromCamera(mouse, camera!);

        // 计算物体和射线的焦点，返回一个数组，集合了射线和物体的交点
        let intersects = raycaster.intersectObjects(scene!.children, true);

        if (intersects.length > 0) {
          let clickedObject = intersects[0].object;

          // 判断当前对象是否为Mesh类型
          if (clickedObject instanceof THREE.Mesh) {
            // 如果为Mesh，就访问它的'material'属性
            clickedObject.material.color.set(0xff0000); // 将颜色改为红色
          }

          // 打印点击事件信息
          console.log(`Clicked on ${clickedObject.name}`);
        }
      },
      false
    );
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    const delta = clock.getDelta();
    for (const mixer of mixers) {
      mixer.update(delta);
    }
    controls?.update();
    renderer?.render(scene!, camera!);
  };

  resize = (sceneDom: Ref<HTMLDivElement | null>) => {
    camera!.aspect = sceneDom.value!.clientWidth / sceneDom.value!.clientHeight;
    camera!.updateProjectionMatrix();
    stats.update();
    renderer!.setSize(
      sceneDom.value!.clientWidth,
      sceneDom.value!.clientHeight
    );
  };
}

export { MainScene };
