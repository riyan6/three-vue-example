import * as THREE from "three";
import Viewer from "./viewer";

export default class Floor {
  viewer: Viewer;

  constructor(v: Viewer) {
    this.viewer = v;

    // 创建地板
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("/images/geometry10.png", (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;

      texture.anisotropy = v.renderer.capabilities.getMaxAnisotropy();

      const grids = 25;
      const singleGridSize = 3000 / grids;

      for (let i = 0; i < grids; i++) {
        for (let j = 0; j < grids; j++) {
          const planeGeometry = new THREE.PlaneGeometry(
            singleGridSize,
            singleGridSize
          );
          planeGeometry.rotateX(-Math.PI / 2);

          const planeMaterial = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
            // 在这里设置材质的颜色
            color: new THREE.Color("#6c5793"),
          });

          const plane = new THREE.Mesh(planeGeometry, planeMaterial);
          plane.name = "floorTile";
          plane.position.y = 0;
          plane.position.x = (i + 0.5 - grids / 2) * singleGridSize;
          plane.position.z = (j + 0.5 - grids / 2) * singleGridSize;
          v.scene.add(plane);
        }
      }
    });
  }
}
