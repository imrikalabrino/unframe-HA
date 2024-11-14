<template>
  <div
    v-if="visible"
    :class="[
      'fixed bottom-4 right-4 text-white text-sm font-medium px-4 py-2 rounded shadow-lg transition-opacity duration-300',
      customColor || backgroundColor,
    ]"
  >
    <div class="flex items-center justify-between">
      <span>{{ message }}</span>
      <button
        v-if="persistent"
        @click="dismiss"
        class="ml-4 bg-transparent text-white font-bold text-lg focus:outline-none"
      >
        &times;
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'success',
      validator: (value) =>
        ['info', 'success', 'error', 'warning'].includes(value),
    },
    customColor: {
      type: String,
      default: null,
    },
    persistent: {
      type: Boolean,
      default: false,
    },
    dismissTime: {
      type: Number,
      default: 3000,
    },
  },
  data() {
    return {
      visible: false,
    };
  },
  computed: {
    backgroundColor() {
      return {
        info: 'bg-blue-500',
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
      }[this.type];
    },
  },
  mounted() {
    this.visible = true;
    if (!this.persistent) {
      setTimeout(this.dismiss, this.dismissTime);
    }
  },
  methods: {
    dismiss() {
      this.visible = false;
    },
  },
};
</script>

<style scoped></style>
