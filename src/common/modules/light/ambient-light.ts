import * as THREE from "three";
import Viewer from "../viewer";
import Light from "./base";

export default class AmbientLight extends Light {
  viewer: Viewer;
  light: THREE.AmbientLight;
  
  constructor(v: Viewer, option: any = { color: "rgb(255,255,255)" }) {
    super(v);
    this.viewer = v;
    this.light = new THREE.AmbientLight(0x404040); // soft white light
    this.setOption(option);
    this.viewer.scene.add(this.light);
  }

  /**
   * 设置灯光参数
   * @param opt
   */
  setOption = (opt: any) => {
    this.light.intensity = opt.intensity || 1;
  };
}
