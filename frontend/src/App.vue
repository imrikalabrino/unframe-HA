<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();

    const checkGitLabToken = async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/check-token', { withCredentials: true });
        if (response.data.valid) {
          router.push('/repositories');
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking GitLab token:', error);
        router.push('/login');
      }
    };

    checkGitLabToken();
  },
};
</script>

<style scoped lang="scss">
#app {
  padding: 1.5rem;
  font-family: Arial, sans-serif;
  color: #ffffff;
  background-color: #1e1e1e;
  border-radius: 2rem;
  height: 80vh;
}
</style>
