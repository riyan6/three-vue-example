import * as THREE from "three";

export default function () {
  let ringInnerRadius = 200;
  let lightRadius = 0;
  let material: THREE.MeshBasicMaterial | any = null;
  let circle: THREE.RingGeometry | any = null;
  let meshCircle: THREE.Mesh | any = null;

  const createLightCircle = () => {
    circle = new THREE.RingGeometry(ringInnerRadius, lightRadius, 100);
    material = new THREE.MeshBasicMaterial({
      color: 0x84a8e2, // 这是圆形颜色，你可以根据需要更改
      side: THREE.DoubleSide,
    });
    meshCircle = new THREE.Mesh(circle, material);
    meshCircle.position.set(0, -200, 0); // 这个是圆形位置
    meshCircle.rotateX(-Math.PI / 2);
  };

  const lightCircleLoop = (scene: THREE.Scene) => {
    // 更新光圈移动半径
    if (lightRadius > 1500) {
      // 圆形半径大于地板尺寸的一半，即超出地板
      lightRadius = 50; // 外半径重置为50
      ringInnerRadius = 0; // 内半径重置为0
      scene.remove(meshCircle!); // 移除旧的环形

      // 重新生成新的环形
      circle = new THREE.RingGeometry(ringInnerRadius, lightRadius, 32);
      meshCircle = new THREE.Mesh(circle, material!);
      meshCircle.position.set(0, -200, 0);
      meshCircle.rotateX(-Math.PI / 2);
      scene!.add(meshCircle);
    } else {
      lightRadius += 12; // 外半径逐渐增大
      ringInnerRadius += 12; //内半径逐渐增大
      scene.remove(meshCircle!); // 移除旧的环形

      // 根据新的半径生成新的环形
      circle = new THREE.RingGeometry(ringInnerRadius, lightRadius, 32);
      meshCircle = new THREE.Mesh(circle, material!);
      meshCircle.position.set(0, -200, 0);
      meshCircle.rotateX(-Math.PI / 2);
      scene.add(meshCircle);
    }
  };

  return {
    createLightCircle,
    lightCircleLoop
  };
}
