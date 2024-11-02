<template>
  <div>
    <h2>Ask the AI a question about this repository</h2>
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
  props: {
    repoId: {
      type: Number,
      required: true,
    },
  },
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
          question: this.question,
          repoId: this.repoId,
        });
        this.aiResponse = response.data.response;
      } catch (err) {
        this.error = 'Failed to get response from AI';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
h2 {
  font-size: 1.8rem;
  color: #333;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background-color: #218838;
  }
}

.loading,
.error {
  color: #ff6b6b;
  margin-top: 0.5rem;
}

.ai-response {
  margin-top: 1rem;

  h3 {
    color: #333;
  }

  p {
    color: #666;
    font-size: 1rem;
  }
}
</style>
