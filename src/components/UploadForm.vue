<script setup>
import { ref } from 'vue'
import { uploadSet } from '../api.js'
import SetSelector from './SetSelector.vue'

const props = defineProps({
  sets: { type: Array, required: true },
})

const emit = defineEmits(['uploaded'])

const file = ref(null)
const mode = ref('new')
const name = ref('')
const targetSetId = ref('')
const status = ref(null)
const error = ref(null)
const submitting = ref(false)

function onFileChange(e) {
  file.value = e.target.files[0] ?? null
}

async function submit() {
  error.value = null
  status.value = null

  if (!file.value) {
    error.value = 'Choose a JSON file first.'
    return
  }
  if (mode.value === 'new' && !name.value.trim()) {
    error.value = 'Give the new set a name.'
    return
  }
  if (mode.value === 'merge' && !targetSetId.value) {
    error.value = 'Choose which set to merge into.'
    return
  }

  submitting.value = true
  try {
    const set = await uploadSet({
      file: file.value,
      mode: mode.value,
      name: name.value.trim(),
      setId: targetSetId.value,
    })
    status.value = `Uploaded into "${set.name}" — it now has ${set.cardCount} card(s).`
    name.value = ''
    file.value = null
    emit('uploaded', set)
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="upload" @submit.prevent="submit">
    <h2>Upload flashcards</h2>
    <p class="hint">
      A JSON file shaped like
      <code>{ "language": "zh-CN", "cards": [{ "prompt": "...", "front": "...", "back": "..." }] }</code>.
      <code>language</code> is optional and used for pronunciation.
    </p>

    <label class="field">
      <span>File</span>
      <input type="file" accept="application/json" @change="onFileChange" />
    </label>

    <fieldset class="field">
      <legend>Destination</legend>
      <label><input v-model="mode" type="radio" value="new" /> New set</label>
      <label><input v-model="mode" type="radio" value="merge" :disabled="sets.length === 0" /> Merge into existing set</label>
    </fieldset>

    <label v-if="mode === 'new'" class="field">
      <span>Set name</span>
      <input v-model="name" type="text" placeholder="e.g. Swedish Basics" />
    </label>

    <label v-else class="field">
      <span>Target set</span>
      <SetSelector :sets="sets" v-model="targetSetId" :allow-all="false" />
    </label>

    <button type="submit" :disabled="submitting">
      {{ submitting ? 'Uploading…' : 'Upload' }}
    </button>

    <p v-if="status" class="status">{{ status }}</p>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<style scoped>
.upload {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 360px;
}

.hint {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

.hint code {
  font-size: 0.8rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

fieldset.field {
  border: 1px solid #ddd;
  border-radius: 8px;
}

button {
  align-self: flex-start;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 8px;
  background: #1565c0;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status {
  color: #2e7d32;
}

.error {
  color: #b00020;
}
</style>
