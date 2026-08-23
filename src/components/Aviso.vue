<script setup lang="ts">
const props = defineProps<{ tipo?: 'error' | 'warning' | 'success' | 'info'; titulo?: string }>()
const iconos = { error: 'fa-solid fa-circle-xmark', warning: 'fa-solid fa-triangle-exclamation', success: 'fa-solid fa-circle-check', info: 'fa-solid fa-circle-info' }
const icono = iconos[props.tipo ?? 'info']
</script>

<template>
  <div class="aviso" :class="`aviso--${tipo ?? 'info'}`" role="alert">
    <i :class="icono" class="aviso__icono"></i>
    <div class="aviso__contenido">
      <p v-if="titulo" class="aviso__titulo">{{ titulo }}</p>
      <div class="aviso__cuerpo"><slot /></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.aviso {
  display: flex; gap: 0.9rem; padding: 1rem 1.15rem; border-radius: $radio; border: 1px solid $gris-200; background: $blanco; font-size: 0.9rem; color: $negro;
  &__icono { font-size: 1rem; margin-top: 0.15rem; color: $gris-500; }
  &__contenido { flex: 1; min-width: 0; }
  &__titulo { font-weight: 600; margin-bottom: 0.2rem; }
  &__cuerpo { color: $gris-700; :deep(a) { color: $negro; font-weight: 500; } }
  &--success { border-color: $negro; .aviso__icono { color: $negro; } }
  &--error { background: $negro; color: $blanco; border-color: $negro; .aviso__icono { color: $blanco; } .aviso__cuerpo { color: $gris-300; } }
  &--warning { border-style: dashed; border-color: $gris-700; .aviso__icono { color: $negro; } }
  &--info { background: $gris-50; }
}
</style>
