<template>
  <div id="app">
    <router-view />
    <Toast
      v-if="toast.visible"
      :message="toast.message"
      :type="toast.type"
      :persistent="toast.persistent"
    />
  </div>
</template>

<script>
import { reactive } from 'vue';
import Toast from './components/Toast.vue';

export const toastState = reactive({
  visible: false,
  message: '',
  type: 'success',
  persistent: false,
});

export const triggerToast = ({ message, type = 'success', persistent = false }) => {
  toastState.message = message;
  toastState.type = type;
  toastState.persistent = persistent;
  toastState.visible = true;

  if (!persistent) {
    setTimeout(() => {
      toastState.visible = false;
    }, 3000);
  }
};

export default {
  components: { Toast },
  setup() {
    return { toast: toastState };
  },
};
</script>

<style>
</style>
