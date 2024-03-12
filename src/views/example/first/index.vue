<template>
  <div class="container">
    <div class="scene" ref="sceneRef">
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, Ref, ref} from "vue";
import { MainScene } from './service/main-scene.ts'
const sceneRef = ref(null) as Ref<HTMLDivElement | null>;

let scene: MainScene | null;

onMounted(() => {
  //console.log(sceneRef.value.clientWidth, sceneRef.value.clientHeight)
  scene = new MainScene(sceneRef)
  window.addEventListener('resize', () => {
    scene!.resize(sceneRef)
  })
})

</script>

<style lang="less" scoped>
.container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  .scene {
    position: relative;
    width: 100%;
    height: 100vh;
  }
}
</style>
