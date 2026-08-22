<script setup lang="ts">
defineProps<{ titulo: string; ayuda: string; leyendo: boolean }>()
const emit = defineEmits<{ (e: 'archivo', f: File): void }>()

function elegir(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (f) emit('archivo', f)
  input.value = ''
}
function soltar(e: DragEvent) {
  const f = e.dataTransfer?.files?.[0]
  if (f) emit('archivo', f)
}
</script>

<template>
  <label class="zona" @dragover.prevent @drop.prevent="soltar">
    <input type="file" accept=".xls,.xlsx,.xlsm,.xlsb,.csv,.txt,.tsv" class="zona__input" @change="elegir" />
    <p class="zona__titulo">{{ leyendo ? 'Leyendo…' : titulo }}</p>
    <p class="zona__ayuda">{{ ayuda }}</p>
  </label>
</template>

<style lang="scss" scoped>
.zona {
  display: block; cursor: pointer; text-align: center;
  padding: 2.25rem 1rem;
  border: 2px dashed rgba($primary-dark, 0.25);
  border-radius: 10px;
  background: $white;
  transition: border-color 0.15s, background 0.15s;
  &:hover { border-color: $primary; background: rgba($primary, 0.04); }
  &__input { position: absolute; width: 1px; height: 1px; opacity: 0; }
  &__titulo { font-weight: 600; }
  &__ayuda { font-size: 0.85rem; color: $text-secondary; margin-top: 0.3rem; }
}
</style>
