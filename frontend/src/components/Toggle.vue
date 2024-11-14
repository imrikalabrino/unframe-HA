<template>
  <div
      class="w-14 h-8 flex items-center rounded-full p-1 duration-300 cursor-pointer"
      :class="[value ? color : 'bg-gray-300']"
      :aria-checked="value.toString()"
      @click="toggle"
  >
    <div
        class="bg-white w-6 h-6 rounded-full shadow-md transform duration-300"
        :class="{ 'translate-x-6': value }"
    ></div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: 'bg-blue-500',
    }
  },
  methods: {
    toggle() {
      this.$emit('toggled', !this.value)
    }
  }
};
</script>

<style scoped>
</style>
