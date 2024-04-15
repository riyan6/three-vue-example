<script setup lang="ts">
const props = withDefaults(defineProps<{
  model: any
}>(), {})


const pObject = props.model.model.scene.clone();

pObject.scale.set(3,3,3)
pObject.position.set(0,0,0)
</script>

<template>
  <primitive :object="pObject" />
</template>

