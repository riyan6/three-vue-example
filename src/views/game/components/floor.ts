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
  let textureLoader = new THREE.TextureLoader();

  let floorColorTexture = textureLoader.load(floorColorPath);
  let floorNormalTexture = textureLoader.load(floorNormalPath);

  // 设置贴图的水平和垂直重复
  floorColorTexture.repeat.set(30, 30);
  floorNormalTexture.repeat.set(30, 30);

  // 开启纹理的重复模式
  floorColorTexture.wrapS = THREE.RepeatWrapping;
  floorNormalTexture.wrapS = THREE.RepeatWrapping;

  floorColorTexture.wrapT = THREE.RepeatWrapping;
  floorNormalTexture.wrapT = THREE.RepeatWrapping;

  let floorMaterial = new THREE.MeshStandardMaterial({
    map: floorColorTexture,
    normalMap: floorNormalTexture,
  });
  let floor = new THREE.Mesh(floorGeometry, floorMaterial);

  return {
    floor,
  };
}
