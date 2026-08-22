<script setup lang="ts">
defineProps<{ tipo?: 'error' | 'warning' | 'success' | 'info'; titulo?: string }>()
</script>

<template>
  <div class="aviso" :class="`aviso--${tipo ?? 'info'}`" role="alert">
    <p v-if="titulo" class="aviso__titulo">{{ titulo }}</p>
    <div class="aviso__cuerpo"><slot /></div>
  </div>
</template>

<style lang="scss" scoped>
.aviso {
  padding: 1rem 1.25rem; border-radius: 8px; border: 1px solid; font-size: 0.9rem;
  &__titulo { font-weight: 600; margin-bottom: 0.25rem; }
  &--error { background: $alert-error-bg; border-color: rgba($alert-error, 0.4); color: darken($alert-error, 20); }
  &--warning { background: $alert-warning-bg; border-color: rgba($alert-warning, 0.4); color: darken($alert-warning, 25); }
  &--success { background: $alert-success-bg; border-color: rgba($alert-success, 0.4); color: darken($alert-success, 20); }
  &--info { background: $alert-info-bg; border-color: rgba($alert-info, 0.4); color: darken($alert-info, 20); }
}
</style>
