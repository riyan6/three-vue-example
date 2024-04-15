import {useGLTF} from '@tresjs/cientos';

export const loadMachineGlb = async () => {
    const path = '/models/cxj1.glb';
    const model = await useGLTF(path)
    return {
        model
    }
}