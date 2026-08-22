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
  background: $white; border: 1px solid rgba($primary-dark, 0.1); border-radius: 8px; padding: 1rem 1.15rem;
  &__etiqueta { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.14em; color: $text-secondary; }
  &__valor {
    margin-top: 0.3rem; font-size: 1.5rem; font-weight: 600; font-variant-numeric: tabular-nums;
    &--pequeno { font-size: 0.95rem; }
    &--positivo { color: darken($secondary, 12); }
    &--negativo { color: $alert-error; }
  }
}
</style>
