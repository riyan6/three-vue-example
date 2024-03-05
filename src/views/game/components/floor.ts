import * as THREE from "three";
import floorColorPath from "@/assets/textures/floors/FloorsCheckerboard_S_Diffuse.jpg";
import floorNormalPath from "@/assets/textures/floors/FloorsCheckerboard_S_Normal.jpg";

/**
 * 创建地板
 * @returns
 */
export default function () {
  const color: THREE.Color = new THREE.Color();

  // 创建地板 一个 2000x2000 分为 100 段的地板
  let floorGeometry: any = new THREE.PlaneGeometry(2000, 2000, 500, 500);
  // 设置平面延x轴旋转 90度
  floorGeometry.rotateX(-Math.PI / 2);

  // // 将地板的几何体从索引形式转换为非索引形式
  // // 索引形式统一管理，非索引形式单独管理可以单独访问和修改
  // floorGeometry = floorGeometry.toNonIndexed();

  // // 随机地板颜色
  // let position = floorGeometry.attributes.position;
  // const colorsFloor = [];
  // for (let i = 0, l = position.count; i < l; i++) {
  //   color.setHSL(Math.random(), 1, Math.random(), THREE.SRGBColorSpace);
  //   colorsFloor.push(color.r, color.g, color.b);
  // }
  // floorGeometry.setAttribute(
  //   "color",
  //   new THREE.Float32BufferAttribute(colorsFloor, 3)
  // );

  // // 创建地板网格 并且颜色跟随 刚刚随机配置好的各个顶点颜色
  // const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
  // const floor = new THREE.Mesh(floorGeometry, floorMaterial);

  let textureLoader = new THREE.TextureLoader();

  let floorColorTexture = textureLoader.load(floorColorPath);
  let floorNormalTexture = textureLoader.load(floorNormalPath);


  // 设置贴图的水平和垂直重复
floorColorTexture.repeat.set(60, 60);
floorNormalTexture.repeat.set(60, 60);

// 开启纹理的重复模式
floorColorTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapS = THREE.RepeatWrapping;

floorColorTexture.wrapT = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;



  let floorMaterial = new THREE.MeshStandardMaterial({
    map: floorColorTexture,
    normalMap: floorNormalTexture
  });
  let floor = new THREE.Mesh(floorGeometry, floorMaterial);

  return {
    floor,
  };
}
