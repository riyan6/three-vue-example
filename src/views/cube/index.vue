<template>
    <div class="scene-container" ref="sceneRef"></div>
  </template>
  
  <script setup lang="ts">
  import { onMounted, ref } from "vue";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import * as THREE from "three";
  
  const sceneRef = ref(null) as any;
  
  let scene: THREE.Scene | any = null;
  let camera: THREE.PerspectiveCamera | any = null;
  let renderer: THREE.WebGLRenderer | any = null;
  let cube: THREE.Mesh | any = null;
  
  onMounted(() => {
    init();
    cubeAnimate();
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
    camera.position.z = 5;
    // 渲染器
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 添加dom元素
    sceneRef.value.appendChild(renderer.domElement);
  
    // 增加一个立方体
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const meterial = new THREE.MeshBasicMaterial({
      color: "purple",
      transparent: true,
      opacity: 0.5,
    });
    cube = new THREE.Mesh(geometry, meterial);
  
    // 添加立方体的线条
    const edges = new THREE.EdgesGeometry(cube.geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: "red" })
    );
    cube.add(line);
    scene.add(cube);
  
    // 增加一个光源
    const pointLight = new THREE.PointLight("white");
    pointLight.position.set(10, 20, 30);
    scene.add(pointLight)
  
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x404040)
    scene.add(ambientLight)
  
    // 创建控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", () => {
      renderer.render(scene, camera);
    });
  
    // 开始渲染
    renderer.render(scene, camera);
  };

  const cubeAnimate = () => {
    requestAnimationFrame(cubeAnimate);
  
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  };
  </script>
  
  <style scoped>
  .scene-container {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: skyblue;
  }
  </style>
  