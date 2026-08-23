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
  border-left-width: 4px;
  &--success { background: $verde-bg; border-color: $verde-borde; border-left-color: $verde; .aviso__icono, .aviso__titulo { color: $verde; } }
  &--error { background: $rojo-bg; border-color: $rojo-borde; border-left-color: $rojo; .aviso__icono, .aviso__titulo { color: $rojo; } }
  &--warning { background: $ambar-bg; border-color: $ambar-borde; border-left-color: $ambar; .aviso__icono, .aviso__titulo { color: $ambar; } }
  &--info { background: $azul-bg; border-color: $azul-borde; border-left-color: $azul; .aviso__icono, .aviso__titulo { color: $azul; } }
}
</style>
