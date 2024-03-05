<template>
  <div id="blocker" ref="blockerRef" v-show="blockerVisible">
    <div
      id="instructions"
      ref="instructionsRef"
      @click="handleControlsLock"
      v-show="instructionsVisible"
    >
      <h1 style="font-size: 88px; font-family: Inter,Menlo,Consolas">Play / Pause</h1>
    </div>
  </div>
  <div id="scene-container" ref="sceneRef"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import useMainScene from "./scene/main";

const sceneRef = ref(null) as any;
const blockerRef = ref(null) as any;
const instructionsRef = ref(null) as any;

const {
  initScene: initMainScene,
  handleControlsLock,
  blockerVisible,
  instructionsVisible,
} = useMainScene();

onMounted(() => {
  initMainScene(sceneRef);
});

</script>

<style>
#blocker {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

#instructions {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  text-align: center;
  font-size: 14px;
  cursor: pointer;
  color: white;
  user-select: none;
}

#scene-container {
  width: 100%;
  height: 100vh;
}
</style>
