import * as THREE from "three";
import Viewer from "./viewer";

const skyboxType = {
  day: "day",
  dusk: "dusk",
  night: "night",
};

export default class SkyBoxs {
  viewer: Viewer;

  constructor(v: Viewer) {
    this.viewer = v;
  }

  setSkybox = (type = skyboxType.day) => {
    // 加载贴图
    const loaderbox = new THREE.CubeTextureLoader();
    const cubeTexture = loaderbox.load([
      `/images/skybox/${type}/posx.jpg`,
      `/images/skybox/${type}/negx.jpg`,
      `/images/skybox/${type}/posy.jpg`,
      `/images/skybox/${type}/negy.jpg`,
      `/images/skybox/${type}/posz.jpg`,
      `/images/skybox/${type}/negz.jpg`,
    ]);
    this.viewer.scene.background = cubeTexture
  };
}
