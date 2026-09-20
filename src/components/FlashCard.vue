<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  // { prompt, front, back }
  card: { type: Object, required: true },
})

const emit = defineEmits(['answer'])

// `displayed` backs the static left slot and the flap's answer face.
// `incoming` holds the next card while the flap is folding closed, so its
// back face can already show the next prompt before the swap lands.
const displayed = ref(props.card)
const incoming = ref(null)
const isOpen = ref(false)

const FLAP_TRANSITION_MS = 600

function open() {
  if (!isOpen.value) isOpen.value = true
}

function answer(correct) {
  emit('answer', correct)
}

function speak(text, lang) {
  if (!('speechSynthesis' in window) || !text) return
  // Fronts like "好 (hǎo)" carry a parenthetical pinyin hint alongside the
  // character — strip it so the TTS engine only reads the actual word,
  // not the Latin pinyin letters too.
  const spoken = text.replace(/\s*\([^)]*\)\s*/g, ' ').trim() || text
  const utterance = new SpeechSynthesisUtterance(spoken)
  if (lang) utterance.lang = lang
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

watch(
  () => props.card,
  (next) => {
    incoming.value = next
    isOpen.value = false
    setTimeout(() => {
      displayed.value = incoming.value
      incoming.value = null
    }, FLAP_TRANSITION_MS)
  },
)
</script>

<template>
  <div class="book">
    <div class="prompt-card" :class="{ covered: !isOpen }" @click="open">
      <p class="prompt">{{ displayed.prompt }}</p>
      <p class="content">{{ displayed.front }}</p>
      <button
        class="speak"
        title="Pronounce"
        aria-label="Pronounce"
        @click.stop="speak(displayed.front, displayed.language)"
      >
        🔊
      </button>
    </div>

    <div class="flap" :class="{ open: isOpen }">
      <div class="face answer">
        <p class="content">{{ displayed.back }}</p>
        <div class="actions">
          <button class="wrong" @click="answer(false)">Got it wrong</button>
          <button class="correct" @click="answer(true)">Got it right</button>
        </div>
      </div>
      <div class="face prompt-preview" :class="{ covered: isOpen }" @click="open">
        <p class="prompt">{{ (incoming ?? displayed).prompt }}</p>
        <p class="content">{{ (incoming ?? displayed).front }}</p>
        <button
          class="speak"
          title="Pronounce"
          aria-label="Pronounce"
          @click.stop="speak((incoming ?? displayed).front, (incoming ?? displayed).language)"
        >
          🔊
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.book {
  --card-w: clamp(130px, 38vw, 260px);
  --card-h: 220px;
  position: relative;
  width: calc(var(--card-w) * 2);
  height: var(--card-h);
  perspective: 1200px;
}

.prompt-card,
.face {
  position: absolute;
  top: 0;
  width: var(--card-w);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background: white;
  padding: 1rem;
  box-sizing: border-box;
}

.prompt-card {
  left: 0;
  cursor: pointer;
}

/* Whichever of prompt-card / prompt-preview is visually covered by the other
   (they occupy the same screen rect when closed) must not also receive
   clicks, or a single tap fires both elements' handlers (e.g. speak() twice). */
.covered {
  pointer-events: none;
}

.speak {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  border: none;
  background: none;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.25rem;
}

.flap {
  position: absolute;
  left: var(--card-w);
  top: 0;
  width: var(--card-w);
  height: 100%;
  transform-style: preserve-3d;
  transform-origin: left center;
  transition: transform 0.6s;
  transform: rotateY(180deg);
}

.flap.open {
  transform: rotateY(0deg);
}

.face {
  inset: 0;
  backface-visibility: hidden;
}

.face.answer {
  transform: rotateY(0deg);
}

.face.prompt-preview {
  transform: rotateY(180deg);
  cursor: pointer;
}

.prompt {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.content {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

.actions button {
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  color: white;
}

.actions .correct {
  background: #2e7d32;
}

.actions .wrong {
  background: #c62828;
}
</style>
