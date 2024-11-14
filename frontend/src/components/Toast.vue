<template>
  <div
      v-if="visible"
      class="fixed bottom-4 right-4 bg-green-500 text-white text-sm font-medium px-4 py-2 rounded shadow-lg transition-opacity duration-300"
  >
    {{ message }}
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      visible: false,
    };
  },
  mounted() {
    this.visible = true;
    setTimeout(() => {
      this.visible = false;
    }, 3000);
  },
};
</script>

<style scoped></style>
