<script setup>
import { ref } from 'vue'
import { deleteSet, getSetDownloadUrl } from '../api.js'

defineProps({
  sets: { type: Array, required: true },
})

const emit = defineEmits(['select', 'upload', 'deleted'])

const error = ref(null)
const deletingId = ref(null)

async function onDelete(set) {
  if (!confirm(`Delete "${set.name}" and all ${set.cardCount} card(s) in it? This can't be undone.`)) {
    return
  }
  error.value = null
  deletingId.value = set.id
  try {
    await deleteSet(set.id)
    emit('deleted', set.id)
  } catch (e) {
    error.value = e.message
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="deck-select">
    <h1>Flash Cards</h1>
    <h2>Choose a deck</h2>

    <p v-if="sets.length === 0" class="empty">No decks yet — upload one to get started.</p>

    <div v-else class="decks">
      <div v-for="set in sets" :key="set.id" class="deck">
        <button class="deck-main" @click="$emit('select', set.id)">
          <span class="name">{{ set.name }}</span>
          <span class="count">{{ set.cardCount }} card{{ set.cardCount === 1 ? '' : 's' }}</span>
        </button>
        <a
          class="icon-btn"
          :href="getSetDownloadUrl(set.id)"
          download
          title="Download as JSON"
          @click.stop
        >
          ⬇
        </a>
        <button
          class="icon-btn danger"
          title="Delete deck"
          :disabled="deletingId === set.id"
          @click.stop="onDelete(set)"
        >
          🗑
        </button>
      </div>

      <button v-if="sets.length > 1" class="deck all" @click="$emit('select', '')">
        <span class="name">All decks</span>
      </button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <button class="upload-link" @click="$emit('upload')">Upload new deck</button>
  </div>
</template>

<style scoped>
.deck-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 360px;
}

h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: #555;
}

.empty {
  color: #666;
}

.decks {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
}

.deck {
  display: flex;
  align-items: stretch;
  gap: 0.4rem;
}

.deck-main {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-size: 1rem;
  text-align: left;
  min-width: 0;
}

.deck-main:hover {
  border-color: #1565c0;
}

button.deck.all {
  justify-content: center;
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-size: 1rem;
  font-style: italic;
  color: #555;
}

button.deck.all:hover {
  border-color: #1565c0;
}

.count {
  font-size: 0.85rem;
  color: #888;
  white-space: nowrap;
  margin-left: 0.5rem;
}

.icon-btn {
  flex-shrink: 0;
  width: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  font-size: 1.1rem;
}

.icon-btn:hover {
  border-color: #1565c0;
}

.icon-btn.danger:hover {
  border-color: #c62828;
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-link {
  margin-top: 0.5rem;
  border: none;
  background: none;
  color: #1565c0;
  cursor: pointer;
  font-size: 0.95rem;
  text-decoration: underline;
}

.error {
  color: #b00020;
}
</style>
