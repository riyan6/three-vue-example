<template>
  <div class="container">
    <div class="tooltip">
      <p v-for="(item, index) in tooltips" :key="index">{{ item }}</p>
    </div>
    <div class="scene" ref="sceneRef"></div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import SkyBoxs from "@/common/modules/sky-boxs";
import Viewer from "@/common/modules/viewer";
import Lights from "@/common/modules/light";
import Floor from "@/common/modules/floor";
import ModelLoader from "@/common/modules/model-loader";
import { onMounted, ref } from "vue";

const tooltips = ref<string[]>([]);
const sceneRef = ref<HTMLDivElement | any>(null);

let viewer: Viewer | any;
let skyboxs: SkyBoxs;
let lights: Lights | any;
let modelLoader: ModelLoader;

onMounted(() => {
  init();
});

const init = () => {
  // 创建视图
  viewer = new Viewer(sceneRef.value);
  // viewer.camera.position.set(17, 10, 52);
  // viewer.controls.maxPolarAngle = Math.PI / 2.1;
  viewer.renderer.shadowMap.enabled = true;
  viewer.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // 创建天空盒
  skyboxs = new SkyBoxs(viewer);
  // 创建灯光
  lights = new Lights(viewer);
  // 添加环境光
  const ambientLight = lights.addAmbientLight();
  ambientLight.setOption({
    color: 0xffffff,
    intensity: 1, // 环境光强度
  });
  ambientLight.light.name = "AmbientLight";
  // 添加平行光
  lights.addDirectionalLight([100, 100, -10], {
    color: "rgb(253,253,253)",
    intensity: 3,
    castShadow: true, // 是否投射阴影
  });

  // 添加地板
  const floor = new Floor(viewer);
  console.log(floor);

  // 添加状态
  viewer.addStats();

  // 添加坐标轴
  viewer.addAxis();

  // 创建模型加载器
  modelLoader = new ModelLoader(viewer);

  // 创建模型
  initCxjModel("cxj1", [0, 20, 0]);
  initCxjModel("cxj2", [-500, 20, 0]);
    initCxjModel("cxj3", [500, 0, 0]);
  //   initCxjModel("cxj4", [0, 0, 55]);
  //   initCxjModel("cxj5", [20, 0, 55]);
  //   initCxjModel("cxj6", [-20, 0, 55]);
  //   initCxjModel("cxj4", [0, 0, -55]);
  //   initCxjModel("cxj5", [20, 0, -55]);
  //   initCxjModel("cxj6", [-20, 0, -55]);

  // viewer.animateCallbck = () => {
  //   tooltips.value = [
  //     `camera position [${[Math.floor(viewer.camera.position.x), Math.floor(viewer.camera.position.y), Math.floor(viewer.camera.position.z)].join(',')}]`,
  //     `camera rotation [${[Math.floor(viewer.camera.rotation.x), Math.floor(viewer.camera.rotation.y), Math.floor(viewer.camera.rotation.z)].join(',')}]`,
  //     `controls target [${[Math.floor(viewer.controls.target.x), Math.floor(viewer.controls.target.y), Math.floor(viewer.controls.target.z)].join(',')}]`,
  //   ]
  // }
};

const initCxjModel = (name: string, pos: number[]) => {
  modelLoader.loadModelToScene(
    "/models/cxj1.glb",
    (model: any) => {
      model.object.name = name;
      model.object.scale.set(500, 500, 500);
      model.object.position.set(...pos);
      model.openCastShadow(); // 开启投射阴影
      model.openReceiveShadow(); // 开启接收阴影
    },
    (pgs: number) => {
      pgs = Math.floor(pgs * 100);
      console.log(`进度：${pgs}%`);
    }
  );
};
</script>

<style scoped lang="less">
.container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: black;
  .scene {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .tooltip {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    color: black;
    font-size: 18px;
    z-index: 2;
  }
}
</style>
