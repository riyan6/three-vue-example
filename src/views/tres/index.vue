<!-- <template>
  <div class="container">
    <TresCanvas window-size clear-color="#252f4a" shadows alpha>
      <TresPerspectiveCamera ref="cameraRef" :position="[5, 3, 0]" :fov="60" :aspect="aspectVal" :near="1" :far="2500"/>
      <OrbitControls :enable-damping="true" :damping-factor="0.05" :min-distance="3" :max-distance="15" :max-polar-angle="Math.PI / 2"/>
      <template v-if="machineGlb">
        <BuildModel :model="machineGlb"/>
      </template>
      <TresDirectionalLight color="white" :intensity="3" :position="[1,1,1]"/>
      <TresDirectionalLight color="#002288" :intensity="3" :position="[-1,-1,-1]"/>
      <TresAmbientLight color="#555555"/>
      <TresMesh :position="[0,0,0]" :receive-shadow="true">
        <TresPlaneGeometry :width="3000" :height="3000" :rotate-x="-Math.PI / 2" />
        <TresShadowMaterial color="black" :opacity="0.2" />
      </TresMesh>
      <radra :position="[0, 0, 0]" color="#d6e2fb" :height="0.5" :period="4"
              :radius="2.5" :maxRadius="15" />
    </TresCanvas>
  </div>
</template>

<script setup lang="ts">
import {TresCanvas} from '@tresjs/core';
import {OrbitControls} from '@tresjs/cientos';
import {loadMachineGlb} from './loadModel.ts';
import BuildModel from "@/views/tres/buildModel.vue";
import {onMounted, ref} from "vue";
import radra from './radra.vue';

const aspectVal = ref(window.innerWidth / window.innerHeight);

const machineGlb = ref<any>(null);
const cameraRef = ref(null)

onMounted(() => {
  getModel();
})

const getModel = async () => {
  machineGlb.value = await loadMachineGlb();
}


</script>

<style scoped lang="less">
.container {
  position: relative;
  width: 100vw;
  height: 100vh;
}

</style> -->