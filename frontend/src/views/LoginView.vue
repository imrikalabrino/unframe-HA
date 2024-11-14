<template>
  <div class="login-view flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Logo -->
    <!-- <img src="@/assets/logo.png" alt="Site Logo" class="mb-8 w-32 h-32" /> -->

    <div class="flex gap-4 mb-10">
      <button
        @click="openForm('login')"
        disabled
        class="text-white px-6 py-2 rounded-lg bg-gray-500 dark:bg-gray-700"
      >
        Login
      </button>
      <button
        @click="openForm('register')"
        disabled
        class="text-white px-6 py-2 rounded-lg bg-gray-500 dark:bg-gray-700"
      >
        Register
      </button>
      <button
        @click="loginWithGitlab"
        class="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
      >
        Login with GitLab
      </button>
    </div>

    <!-- Register Form -->
    <form v-if="showForm === 'register'" @submit.prevent="register" class="flex flex-col">
      <input
        type="text"
        v-model="username"
        placeholder="Username"
        required
        class="mb-2 p-2 rounded bg-white dark:bg-gray-800 dark:text-white"
      />
      <input
        type="password"
        v-model="password"
        placeholder="Password"
        required
        class="mb-2 p-2 rounded bg-white dark:bg-gray-800 dark:text-white"
      />
      <input
        type="file"
        @change="handleFileUpload"
        class="mb-4 p-2 rounded bg-white dark:bg-gray-800 dark:text-white"
      />
      <button
        type="submit"
        class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
      >
        Register
      </button>
    </form>

    <!-- Login Form -->
    <form v-if="showForm === 'login'" @submit.prevent="login" class="flex flex-col">
      <input
        type="text"
        v-model="username"
        placeholder="Username"
        required
        class="mb-2 p-2 rounded bg-white dark:bg-gray-800 dark:text-white"
      />
      <input
        type="password"
        v-model="password"
        placeholder="Password"
        required
        class="mb-4 p-2 rounded bg-white dark:bg-gray-800 dark:text-white"
      />
      <button
        type="submit"
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
      >
        Login
      </button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      showForm: null,
      username: '',
      password: '',
      imageFile: null,
    };
  },
  methods: {
    openForm(type) {
      this.showForm = type;
    },
    handleFileUpload(event) {
      this.imageFile = event.target.files[0];
    },
    async register() {
      const formData = new FormData();
      formData.append('username', this.username);
      formData.append('password', this.password);
      if (this.imageFile) {
        formData.append('image', this.imageFile);
      }

      try {
        const response = await axios.post('http://localhost:3000/auth/register', formData);
        console.log('User registered:', response.data);
      } catch (error) {
        console.error('Registration error:', error);
      }
    },
    async login() {
      try {
        const response = await axios.post('http://localhost:3000/auth/login', {
          username: this.username,
          password: this.password,
        });
        console.log('User logged in:', response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        window.location.href = `/repositories`;
      } catch (error) {
        console.error('Login error:', error);
      }
    },
    loginWithGitlab() {
      const redirectUrl = `${window.location.origin}/repositories`;
      window.location.href = `http://localhost:3000/auth/gitlab?redirectUrl=${redirectUrl}`;
    },
  },
};
</script>

<style scoped>

</style>
