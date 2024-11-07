<template>
  <div class="ai-container">
    <div class="left-container">
      <div class="response-box">
        <h2 v-if="!aiResponse && !loading">Ask the AI a question about this repository</h2>
        <p v-if="loading">Thinking...</p>
        <p v-else-if="aiResponse">{{ aiResponse }}</p>
      </div>
      <input v-model="question" placeholder="Ask a question..." />
    </div>
    <div class="right-container">
      <button class="send-button" @click="askAI">></button>
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

<style scoped>
.ai-container {
  display: flex;
  background-color: #1a1a1a;
  border-radius: 10px;
  padding: 1rem;
  width: 100%;
  max-width: 600px;
  color: #fff;
}

.left-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.response-box {
  background-color: #333;
  border-radius: 8px;
  padding: 1rem;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbb;
  font-size: 1rem;
  text-align: center;
}

input {
  background-color: #222;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 0.5rem;
  color: #fff;
  font-size: 1rem;
}

input::placeholder {
  color: #777;
}

.right-container {
  display: flex;
  align-items: flex-end;
  padding-left: 1rem;
}

.send-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #28a745;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.send-button:hover {
  background-color: #218838;
}
</style>
