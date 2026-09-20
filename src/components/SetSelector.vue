<script setup>
defineProps({
  sets: { type: Array, required: true },
  modelValue: { type: String, default: '' },
  allowAll: { type: Boolean, default: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
    <option v-if="allowAll" value="">All sets</option>
    <option v-for="set in sets" :key="set.id" :value="set.id">
      {{ set.name }} ({{ set.cardCount }})
    </option>
  </select>
</template>

<style scoped>
select {
  font-size: 1rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}
</style>
