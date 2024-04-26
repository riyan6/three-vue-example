import {
  Cache,
  WebGLRenderer,
  PerspectiveCamera,
  Color,
  AxesHelper,
} from "three";
import * as THREE from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js"; // 二维标签渲染器
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js"; // 三维标签渲染器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import SkyBoxs from "./sky-boxs";
import Lights from "./light";


interface AnimationType {
  fun: any;
  content: any;
}

export default class Viewer {
  viewerDom: HTMLDivElement;

  scene: THREE.Scene;
  css3dScene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  labelRenderer: CSS2DRenderer;
  css3DRenderer: CSS3DRenderer;
  camera: THREE.PerspectiveCamera;
  skyboxs: SkyBoxs;
  controls: OrbitControls;

  // 状态控制器以及对应配置
  statsControls: Stats;
  statsUpdateObj: AnimationType;

  // 灯光
  lights: Lights;

  // animate方法回调
  animateCallbck: Function | any;

  // 全局动画列表
  animateEventList: any[];

  constructor(viewerDom: HTMLDivElement) {
    // 开启缓存
    Cache.enabled = true;
    this.viewerDom = viewerDom;

    // 创建初始化场景界面
    this.renderer = new WebGLRenderer({
      // logarithmicDepthBuffer: true, // true/false 表示是否使用对数深度缓冲，true性能不好
      antialias: true, // true/false表示是否开启反锯齿
      alpha: true, // true/false 表示是否可以设置背景色透明
      precision: "highp", // highp/mediump/lowp 表示着色精度选择
      premultipliedAlpha: true, // true/false 表示是否可以设置像素深度（用来度量图像的分辨率）
    });
    this.renderer.clearDepth(); // 设置深度缓冲区
    this.renderer.shadowMap.enabled = true; // 场景中的阴影自动更新
    this.viewerDom.appendChild(this.renderer.domElement); // 将渲染器添加到画布中

    // 二维标签
    this.labelRenderer = new CSS2DRenderer(); // 标签渲染器
    this.labelRenderer.domElement.style.zIndex = "2";
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.top = "0px";
    this.labelRenderer.domElement.style.left = "0px";
    this.labelRenderer.domElement.style.pointerEvents = "none"; // 避免HTML标签遮挡三维场景的鼠标事件
    this.viewerDom.appendChild(this.labelRenderer.domElement);

    // 三维标签
    this.css3DRenderer = new CSS3DRenderer(); // 标签渲染器
    this.css3DRenderer.domElement.style.zIndex = "0";
    this.css3DRenderer.domElement.style.position = "absolute";
    this.css3DRenderer.domElement.style.top = "0px";
    this.css3DRenderer.domElement.style.left = "0px";
    this.css3DRenderer.domElement.style.pointerEvents = "none"; // 避免HTML标签遮挡三维场景的鼠标事件
    this.viewerDom.appendChild(this.css3DRenderer.domElement);

    // 渲染相机
    this.camera = new PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      2500
    ); // 透视相机
    this.camera.position.set(599, 436, 44);
    this.camera.rotation.set(-2, 1, 1);

    // 渲染场景
    this.scene = new THREE.Scene();
    this.css3dScene = new THREE.Scene();
    this.scene.background = new Color("rgb(5,24,38)");

    // 初始化轨道控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 100;
    this.controls.maxDistance = 1500;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.target.set(-303.6, 4, 55);

    // 初始化帧率控制器
    this.statsControls = new Stats();
    this.statsUpdateObj = {
      fun: () => {
        this.statsControls.update();
      },
      content: this.statsControls,
    };

    // 初始化天空盒
    this.skyboxs = new SkyBoxs(this);
    this.skyboxs.setSkybox();

    // 初始化灯光
    this.lights = new Lights(this);

    // 动画处理
    this.animateEventList = [];

    // 动画
    this.animate();
  }

  animate = () => {
    requestAnimationFrame(this.animate);

    this.updateDom();
    this.renderDom();
    // 全局的公共动画函数，添加函数可同步执行
    this.animateEventList.forEach((event) => {
      event.fun && event.content && event.fun(event.content);
    });

    if (this.animateCallbck) {
      this.animateCallbck();
    }
  };

  // 添加状态检测
  addStats = () => {
    this.statsControls.dom.style.position = "absolute";
    this.viewerDom.appendChild(this.statsControls.dom);
    // 添加到动画
    this.addAnimate(this.statsUpdateObj);
  };

  // 添加坐标轴
  addAxis = () => {
    this.scene.add(new AxesHelper(100))
  }

  // 更新Dom
  updateDom = () => {
    this.controls.update();
    this.camera.aspect =
      this.viewerDom.clientWidth / this.viewerDom.clientHeight; // 摄像机视锥体的长宽比，通常是使用画布的宽/画布的高
    this.camera.updateProjectionMatrix(); // 更新摄像机投影矩阵 在任何参数被改变以后必须被调用,来使得这些改变生效
    this.renderer.setSize(
      this.viewerDom.clientWidth,
      this.viewerDom.clientHeight
    ); // 设置渲染器的尺寸
    this.renderer.setPixelRatio(window.devicePixelRatio); // 设置渲染器的像素比
    this.labelRenderer.setSize(
      this.viewerDom.clientWidth,
      this.viewerDom.clientHeight
    ); // 设置标签渲染器的尺寸
    this.css3DRenderer.setSize(
      this.viewerDom.clientWidth,
      this.viewerDom.clientHeight
    ); // 设置标签渲染器的尺寸
  };

  // 渲染Dom
  renderDom = () => {
    this.renderer.render(this.scene, this.camera); // 渲染场景
    this.labelRenderer.render(this.scene, this.camera); // 渲染2d标签场景
    this.css3DRenderer.render(this.css3dScene, this.camera); // 渲染3d标签场景
  };

  // 添加动画
  addAnimate = (animate: AnimationType) => {
    this.animateEventList.push(animate);
  };

  // 移除全局的动画事件
  removeAnimate(animate: any) {
    this.animateEventList.map((val, i) => {
      if (val === animate) this.animateEventList.splice(i, 1);
    });
  }


}
