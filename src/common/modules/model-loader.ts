import Viewer from "./viewer";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import DsModel from "./ds-model";

export default class ModelLoader {
  viewer: Viewer;
  scene: THREE.Scene;
  loaderGLTF: GLTFLoader;
  dracoLoader: DRACOLoader;

  constructor(v: Viewer) {
    this.viewer = v;
    this.scene = v.scene;
    this.loaderGLTF = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    // 设置draco模型解码器路径
    this.dracoLoader.setDecoderPath("/draco/");
    // 设置draco模型加载器
    this.loaderGLTF.setDRACOLoader(this.dracoLoader);
  }

  /**
   * 记载模型数据并添加到场景中
   * @param url 模型的路径
   * @param callback 返回模型对象，常用一些功能挂接在模型对象上
   * @param progress 返回加载进度，还有问题，需要修改
   */
  loadModelToScene = (url: string, callback: Function, progress: Function) => {
    this.loadModel(
      url,
      (model: any) => {
        this.scene.add(model.object); // 加载模型
        callback?.(model);
      },
      (num: number) => {
        progress?.(num); // 加载进度
      }
    );
  };

  /**
   * 加载模型
   * @param url 模型的路径
   * @param callback 回调模型
   * @param progress 返回加载进度
   */
  loadModel = (url: string, callback: Function, progress: Function) => {
    this.loaderGLTF.load(url, model => {
        callback?.(new DsModel(model, this.viewer))
      }, xhr => {
        progress?.((xhr.loaded / xhr.total).toFixed(2))
      }, (error) => {
        console.error('模型渲染报错：', error)
      })
  };
}
