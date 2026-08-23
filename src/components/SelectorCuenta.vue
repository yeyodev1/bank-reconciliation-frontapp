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
      <i class="fa-solid fa-arrow-right"></i> Todavía no hay cuentas: crea la primera.
    </RouterLink>
  </label>
</template>

<style lang="scss" scoped>
.selector {
  display: flex; flex-direction: column; gap: 0.45rem; flex: 1 1 100%;
  @media (min-width: 600px) { flex: 0 1 20rem; }
  &__etiqueta { font-family: $font-secondary; font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase; color: $gris-500; }
  &__aviso { font-size: 0.8rem; color: $negro; display: inline-flex; gap: 0.4rem; align-items: center; }
}
</style>
