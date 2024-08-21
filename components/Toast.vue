<template>
    <div v-if="show" class="toast-container" style="z-index: 1055">
      <div :class="'toast align-items-center text-bg-' + type + ' border-0 show'" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            {{ message }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="show = false"></button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useToast } from '@/composables/useToast';
  
  const { show, message, type } = useToast();
  </script>
  
  <style scoped>
  .toast-container {
    position: fixed;
    bottom: 1rem; 
    right: 1rem;  
    z-index: 1055;
  }
  </style>
  