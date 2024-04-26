import Viewer from "../viewer";

/**
 * 灯光基类
 */
export default class Light {
  viewer: Viewer;
  light: any;
  
  /**
   * 灯光基类
   */
  constructor(v: Viewer) {
    this.viewer = v;
    this.light = {};
  }

  /**
   * 设置灯光位置
   * @param x
   * @param y
   * @param z
   */
  setPosition([x, y, z]: number[]) {
    if (this.light) this.light.position.set(x, y, z);
  }
}
