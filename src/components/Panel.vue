<script setup lang="ts">
defineProps<{ titulo: string }>()
</script>

<template>
  <section class="panel">
    <p class="panel__titulo">{{ titulo }}</p>
    <div class="panel__cuerpo"><slot /></div>
  </section>
</template>

<style lang="scss" scoped>
.panel {
  background: $blanco; border: 1px solid $gris-200; border-radius: $radio;
  &__titulo { padding: 0.8rem 1.15rem; border-bottom: 1px solid $gris-200; font-family: $font-secondary; font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase; color: $gris-500; }
  &__cuerpo { padding: 1.15rem; font-size: 0.9rem; }
}
</style>
