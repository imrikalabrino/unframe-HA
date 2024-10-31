<template>
  <div>
    <h2>Ask the AI a question about repositories</h2>
    <input v-model="question" placeholder="Ask a question..." />
    <button @click="askAI">Submit</button>

    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>
    <div v-if="aiResponse">
      <h3>AI Response:</h3>
      <p>{{ aiResponse }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      question: '',
      aiResponse: null,
      loading: false,
      error: null,
    };
  },
  methods: {
    async askAI() {
      this.loading = true;
      this.error = null;
      this.aiResponse = null;

      try {
        const response = await axios.post('http://localhost:3000/ask-ai', {
          question: this.question
        });
        this.aiResponse = response.data.response;
      } catch (err) {
        this.error = 'Failed to get response from AI';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* Add styles as needed */
</style>
