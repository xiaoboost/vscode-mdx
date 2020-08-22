<component src="./component2" />

<template>
  <div>{{ readersNumber }} {{ book.title }}</div>
  <button @click="() => readersNumber ++">点击加一</button>
</template>

<script setup>
import { ref, reactive } from 'vue';

export const readersNumber = ref(0);
export const book = { title: 'Vue 3 Guide' };
</script>
