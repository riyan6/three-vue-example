import {MapControls} from "three/examples/jsm/controls/MapControls.js";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from 'three'

export default function () {

    const createMapControls = (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer): MapControls => {
        const controls = new MapControls(camera, renderer.domElement)
        return controls;
    }

    const createOrbitControls = (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer): OrbitControls => {
        const controls = new OrbitControls( camera, renderer.domElement );
        return controls;
    }

    return {
        createMapControls,
        createOrbitControls
    }
}