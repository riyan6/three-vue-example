import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let loader: GLTFLoader | null;

class GltfUtil {
    constructor() {
        loader = new GLTFLoader()
    }

    getInstance = () => {
        return loader
    }
}

export {
    GltfUtil
}