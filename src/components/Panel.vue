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
  background: $white; border: 1px solid rgba($primary-dark, 0.1); border-radius: 8px;
  &__titulo {
    padding: 0.7rem 1.15rem; border-bottom: 1px solid rgba($primary-dark, 0.08);
    font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.14em; color: $text-secondary;
  }
  &__cuerpo { padding: 1.15rem; font-size: 0.9rem; }
}
</style>
