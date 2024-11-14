import { defineStore } from 'pinia';

export const useAiStore = defineStore('ai', {
    state: () => ({
        apiKey: '',
    }),

    actions: {
        saveApiKey(key) {
            this.apiKey = key;
        },
    },
});
