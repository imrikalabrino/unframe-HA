<template>
  <div>
    <h1>Logging in...</h1>
  </div>
</template>

<script>
export default {
  created() {
    // Redirect to GitLab auth with a callback to the repositories page
    const redirectUrl = `${window.location.origin}/repositories`;
    window.location.href = `http://localhost:3000/auth/gitlab?redirectUrl=${redirectUrl}`;
  },
};
</script>

<style scoped lang="scss">
</style>
