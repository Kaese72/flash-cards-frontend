<script setup>
import { ref, onMounted } from 'vue'
import FlashCard from './components/FlashCard.vue'
import DeckSelect from './components/DeckSelect.vue'
import UploadForm from './components/UploadForm.vue'
import ProgressBar from './components/ProgressBar.vue'
import { getSets, getRandomCard, getStats, submitAnswer } from './api.js'

// 'select' (choose a deck) | 'study' (flashcards) | 'upload'
const view = ref('select')
const sets = ref([])
const selectedSetId = ref('')
const card = ref(null)
const stats = ref(null)
const error = ref(null)

async function loadSets() {
  sets.value = await getSets()
}

async function loadCard() {
  error.value = null
  card.value = null
  stats.value = null
  try {
    ;[card.value, stats.value] = await Promise.all([
      getRandomCard(selectedSetId.value),
      getStats(selectedSetId.value),
    ])
  } catch (e) {
    error.value = e.message
  }
}

function backToSelect() {
  view.value = 'select'
}

async function selectDeck(setId) {
  selectedSetId.value = setId
  view.value = 'study'
  await loadCard()
}

function goToUpload() {
  view.value = 'upload'
}

function onDeleted(setId) {
  sets.value = sets.value.filter((s) => s.id !== setId)
  if (selectedSetId.value === setId) selectedSetId.value = ''
}

async function onAnswer(correct) {
  error.value = null
  try {
    card.value = await submitAnswer({
      id: card.value.id,
      setId: card.value.setId,
      correct,
      filterSetId: selectedSetId.value,
    })
    stats.value = await getStats(selectedSetId.value)
  } catch (e) {
    error.value = e.message
  }
}

async function onUploaded() {
  await loadSets()
  view.value = 'select'
}

onMounted(loadSets)
</script>

<template>
  <main>
    <div class="topbar">
      <button v-if="view !== 'select'" class="back" @click="backToSelect">← Back</button>
    </div>

    <DeckSelect
      v-if="view === 'select'"
      :sets="sets"
      @select="selectDeck"
      @upload="goToUpload"
      @deleted="onDeleted"
    />

    <template v-else-if="view === 'study'">
      <h1>Flash Cards</h1>
      <ProgressBar v-if="stats" :stats="stats" />
      <p v-if="error" class="error">{{ error }}</p>
      <FlashCard v-if="card" :card="card" @answer="onAnswer" />
      <p v-else-if="!error">Loading…</p>
    </template>

    <UploadForm v-else-if="view === 'upload'" :sets="sets" @uploaded="onUploaded" />
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem 1rem;
  width: 100%;
  box-sizing: border-box;
  max-width: 640px;
  margin: 0 auto;
}

.topbar {
  width: 100%;
  min-height: 1.5rem;
  display: flex;
  justify-content: flex-start;
}

.back {
  border: none;
  background: none;
  color: #1565c0;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
}

.error {
  color: #b00020;
}
</style>
