<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ titulo: string; ayuda: string; leyendo: boolean }>()
const emit = defineEmits<{ (e: 'archivo', f: File): void }>()
const arrastrando = ref(false)

function elegir(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (f) emit('archivo', f)
  input.value = ''
}
function soltar(e: DragEvent) {
  arrastrando.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) emit('archivo', f)
}
</script>

<template>
  <label class="zona" :class="{ 'zona--arrastrando': arrastrando, 'zona--leyendo': leyendo }" @dragover.prevent="arrastrando = true" @dragleave="arrastrando = false" @drop.prevent="soltar">
    <input type="file" accept=".xls,.xlsx,.xlsm,.xlsb,.csv,.txt,.tsv" class="zona__input" @change="elegir" />
    <i :class="leyendo ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-file-excel'" class="zona__icono"></i>
    <p class="zona__titulo">{{ leyendo ? 'Leyendo…' : titulo }}</p>
    <p class="zona__ayuda">{{ ayuda }}</p>
    <span class="zona__cta"><i class="fa-solid fa-arrow-up-from-bracket"></i> Elegir archivo o arrastrarlo aquí</span>
  </label>
</template>

<style lang="scss" scoped>
.zona {
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem; cursor: pointer; text-align: center;
  padding: 2.5rem 1.25rem; border: 1px dashed $gris-300; border-radius: $radio; background: $blanco;
  transition: border-color $transicion, background $transicion, transform $transicion;
  &:hover, &--arrastrando { border-color: $negro; background: $gris-50; }
  &--arrastrando { transform: scale(1.005); }
  &__input { position: absolute; width: 1px; height: 1px; opacity: 0; }
  &__icono { font-size: 1.6rem; color: $gris-400; margin-bottom: 0.5rem; transition: color $transicion; }
  &:hover &__icono { color: $negro; }
  &__titulo { font-weight: 600; font-size: 1.05rem; letter-spacing: -0.01em; }
  &__ayuda { font-size: 0.85rem; color: $gris-500; max-width: 52ch; }
  &__cta { margin-top: 0.75rem; font-size: 0.78rem; font-weight: 500; letter-spacing: 0.04em; display: inline-flex; gap: 0.5rem; align-items: center; padding: 0.5rem 0.9rem; border: 1px solid $gris-300; border-radius: $radio; }
}
</style>
