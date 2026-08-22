<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useCuentasStore } from '@/stores/cuentas'

const cuentas = useCuentasStore()
onMounted(() => cuentas.cargar())

const enlaces = [
  { to: '/cuentas', etiqueta: 'Cuentas bancarias', numero: '' },
  { to: '/banco', etiqueta: 'Excel del BANCO', numero: '1' },
  { to: '/sistema', etiqueta: 'Excel del SISTEMA', numero: '2' },
  { to: '/conciliacion', etiqueta: 'Conciliación del mes', numero: '3' },
]
</script>

<template>
  <div class="layout">
    <aside class="layout__menu">
      <div class="layout__marca">
        <p class="layout__marca-sup">Suárez</p>
        <h1>Conciliación bancaria</h1>
      </div>
      <nav>
        <RouterLink v-for="e in enlaces" :key="e.to" :to="e.to" class="layout__enlace">
          <span v-if="e.numero" class="layout__num">{{ e.numero }}</span>
          <span>{{ e.etiqueta }}</span>
        </RouterLink>
      </nav>
      <div v-if="cuentas.actual" class="layout__cuenta">
        <p class="layout__cuenta-sup">Cuenta en uso</p>
        <p class="layout__cuenta-nombre">{{ cuentas.actual.alias }}</p>
        <p class="layout__cuenta-banco">{{ cuentas.actual.banco }} · {{ cuentas.actual.numero }}</p>
      </div>
    </aside>
    <main class="layout__contenido">
      <RouterView />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;

  &__menu {
    background: $primary-dark;
    color: $text-light;
    padding: 1.75rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    position: sticky;
    top: 0;
    height: 100vh;
  }
  &__marca-sup {
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    opacity: 0.6;
  }
  &__marca h1 {
    font-size: 1.15rem;
    font-weight: 600;
    margin-top: 0.25rem;
  }
  nav { display: flex; flex-direction: column; gap: 0.25rem; }
  &__enlace {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.75rem;
    border-radius: 6px;
    color: rgba($text-light, 0.8);
    text-decoration: none;
    font-size: 0.92rem;
    transition: background 0.15s;
    &:hover { background: rgba($white, 0.08); }
    &.router-link-active { background: $primary; color: $white; }
  }
  &__num {
    width: 1.4rem; height: 1.4rem;
    display: grid; place-items: center;
    border-radius: 50%;
    background: rgba($white, 0.12);
    font-size: 0.7rem; font-weight: 700;
  }
  &__cuenta {
    margin-top: auto;
    padding: 0.9rem;
    border-radius: 8px;
    background: rgba($white, 0.06);
    font-size: 0.82rem;
  }
  &__cuenta-sup { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.6; }
  &__cuenta-nombre { font-weight: 600; margin-top: 0.25rem; }
  &__cuenta-banco { opacity: 0.7; margin-top: 0.1rem; }
  &__contenido { padding: 2.25rem 2.5rem; max-width: 1200px; width: 100%; }
}
@media (max-width: 860px) {
  .layout { grid-template-columns: 1fr; }
  .layout__menu { position: static; height: auto; }
}
</style>
