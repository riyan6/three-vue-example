<template>
  <div class="data-screen-container">
    <div class="data-screen-content" ref="dataScreenRef">
      <div class="data-screen-scene" ref="sceneRef"></div>
      <div class="data-screen-header">
        <h2>XXX设备监控平台</h2>
        <div class="logo"></div>
      </div>
      <div class="data-screen-main">
        <div class="data-screen-left" v-if="showBothSideInfo">
          <div class="data-screen-left-top">信息1</div>
          <div class="data-screen-left-center">信息2</div>
          <div class="data-screen-left-bottom">信息3</div>
        </div>
        <div class="data-screen-right" v-if="showBothSideInfo">
          <div class="data-screen-right-top">信息4</div>
          <div class="data-screen-right-center">信息5</div>
          <div class="data-screen-right-bottom">信息6</div>
        </div>
        <div class="data-screen-footer">
          <el-button
            :type="isRoamingMode ? 'primary' : ''"
            @click="switchRoamingMode"
            >漫游模式：{{ isRoamingMode ? "开" : "关" }}</el-button
          >
          <el-button
            :type="showBothSideInfo ? 'primary' : ''"
            @click="showBothSideInfo = !showBothSideInfo"
            >显示两侧信息：{{ showBothSideInfo ? "是" : "否" }}</el-button
          >
          <el-button type="success" @click="getVision">获取视角信息</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, h } from "vue";
import { ElMessage } from "element-plus";
import useChengXingJi from "./scene/chengxingji";
// import useFengXiangJi from "./scene/fengxiangji";
// import useWeiSiJi from './scene/weisiji';

// 显示两边信息
const showBothSideInfo = ref(false);
// 漫游模式
const isRoamingMode = ref(false);

const dataScreenRef = ref<HTMLElement | any>(null);
const sceneRef = ref<HTMLElement | any>(null);

const { init, sceneResize, openFlyControls, openOrbitControls, getVision } = useChengXingJi();
// const { init, sceneResize, openFlyControls, openOrbitControls, getVision } = useFengXiangJi();
// const { init, sceneResize, openFlyControls, openOrbitControls, getVision } = useWeiSiJi();

onMounted(() => {
  if (dataScreenRef.value) {
    dataScreenRef.value.style.transform = `scale(${getScale()}) translate(-50%, -50%)`;
    dataScreenRef.value.style.width = `1920px`;
    dataScreenRef.value.style.height = `1080px`;
  }
  init(sceneRef);
  window.addEventListener("resize", onWindowResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
});

// const roamingMsg = ref<any>({})
// 在el-button点击事件触发时，切换漫游模式
const switchRoamingMode = () => {
  isRoamingMode.value = !isRoamingMode.value;
  if (isRoamingMode.value) {
    // 开启漫游模式时，禁用 OrbitControls
    openFlyControls();
    // WASD移动，R|F上|下，Q|E滚动，上|下俯仰，左|右偏航
    ElMessage({
      message: h("p", { style: "line-height: 1; font-size: 14px" }, [
        h("p", null, [
          h("span", { style: "color: teal" }, "WASD"),
          h("span", null, "移动,"),
          h("span", { style: "color: teal" }, "RF"),
          h("span", null, "上下,"),
          h("span", { style: "color: teal" }, "QE"),
          h("span", null, "滚动,"),
          h("span", { style: "color: teal" }, "鼠标滚轮"),
          h("span", null, "调节俯仰视角,"),
          h("span", { style: "color: teal" }, "鼠标左键右键"),
          h("span", null, "拉伸视角"),
        ]),
      ]),
      duration: 0,
      type: "success",
      plain: true,
      offset: 60,
    });
  } else {
    // 关闭漫游模式时，启用 OrbitControls
    openOrbitControls();
    ElMessage.closeAll();
  }
};

// 设置响应式
const resize = () => {
  if (dataScreenRef.value) {
    dataScreenRef.value.style.transform = `scale(${getScale()}) translate(-50%, -50%)`;
  }
};

// 根据浏览器大小推断缩放比例
const getScale = (width = 1920, height = 1080) => {
  let ww = window.innerWidth / width;
  let wh = window.innerHeight / height;
  return ww < wh ? ww : wh;
};

const onWindowResize = () => {
  sceneResize(sceneRef);
  resize();
};
</script>

<style scoped lang="less">
@import "./index.less";
</style>
