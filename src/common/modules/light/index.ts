import Viewer from "../viewer";
import AmbientLight from "./ambient-light";
import BaseLight from "./base";
import DirectionalLight from "./directional-light";

export default class Lights {
  viewer: Viewer;
  lightList: BaseLight[];

  constructor(v: Viewer) {
    this.viewer = v;
    this.lightList = [];
  }

  /**
   * 添加环境光
   * @returns
   */
  addAmbientLight = () => {
    const ambientLight = new AmbientLight(this.viewer);
    this.lightList.push(ambientLight);
    return ambientLight;
  };

  /**
   * 添加平行光源
   * @param option
   */
  addDirectionalLight(
    position = [200, 200, 200],
    option = { color: "rgb(255,255,255)" }
  ) {
    const directionalLight = new DirectionalLight(
      this.viewer,
      position,
      option
    );
    this.lightList.push(directionalLight);
    return directionalLight;
  }
}
