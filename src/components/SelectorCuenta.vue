<script setup lang="ts">
import { useCuentasStore } from '@/stores/cuentas'

defineProps<{ etiqueta?: string; deshabilitado?: boolean }>()
const cuentas = useCuentasStore()
</script>

<template>
  <label class="selector">
    <span class="selector__etiqueta">{{ etiqueta ?? '¿A qué cuenta pertenece?' }}</span>
    <select
      :value="cuentas.seleccionada"
      :disabled="deshabilitado || cuentas.cargando"
      @change="cuentas.seleccionar(($event.target as HTMLSelectElement).value)"
    >
      <option value="">Elige una cuenta…</option>
      <option v-for="c in cuentas.activas" :key="c.id" :value="c.id">{{ c.alias }} — {{ c.banco }}</option>
    </select>
    <RouterLink v-if="!cuentas.cargando && !cuentas.lista.length" to="/cuentas" class="selector__aviso">
      Todavía no hay cuentas: crea la primera.
    </RouterLink>
  </label>
</template>

<style lang="scss" scoped>
.selector {
  display: flex; flex-direction: column; gap: 0.35rem; flex: 1 1 100%;
  @media (min-width: 600px) { flex: 0 1 18rem; }
  &__etiqueta { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.12em; color: $text-secondary; }
  &__aviso { font-size: 0.8rem; color: $alert-warning; }
}
</style>
