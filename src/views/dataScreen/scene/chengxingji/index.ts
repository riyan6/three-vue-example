import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FlyControls } from "three/addons/controls/FlyControls.js";

export default function() {

    const clock = new THREE.Clock();
    let scene: THREE.Scene | any = null;
    let camera: THREE.PerspectiveCamera | any = null;
    let renderer: THREE.WebGLRenderer | any = null;
    let orbitControls: OrbitControls | any = null;
    let flyControls: FlyControls | any = null;


    return {
        
    }
}