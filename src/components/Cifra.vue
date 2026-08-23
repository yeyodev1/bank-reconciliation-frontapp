<script setup lang="ts">
defineProps<{ etiqueta: string; valor: string; tono?: 'positivo' | 'negativo' | 'neutro'; pequeno?: boolean }>()
</script>

<template>
  <div class="cifra">
    <p class="cifra__etiqueta">{{ etiqueta }}</p>
    <p class="cifra__valor" :class="[`cifra__valor--${tono ?? 'neutro'}`, { 'cifra__valor--pequeno': pequeno }]">{{ valor }}</p>
  </div>
</template>

<style lang="scss" scoped>
.cifra {
  background: $blanco; padding: 1.1rem 1.25rem; transition: background $transicion;
  &:hover { background: $gris-50; }
  &__etiqueta { font-family: $font-secondary; font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase; color: $gris-500; }
  &__valor {
    margin-top: 0.45rem; font-size: 1.65rem; font-weight: 600; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; line-height: 1.1;
    &--pequeno { font-size: 0.95rem; font-weight: 500; letter-spacing: -0.01em; }
    &--positivo { color: $negro; }
    &--negativo { color: $gris-500; }
  }
}
</style>
