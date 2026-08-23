<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useCuentasStore } from '@/stores/cuentas'
import { useUserStore } from '@/stores/user'

const cuentas = useCuentasStore()
const user = useUserStore()
const router = useRouter()
const abierto = ref(false)

onMounted(() => cuentas.cargar())

const enlaces = [
  { to: '/cuentas', etiqueta: 'Cuentas', icono: 'fa-solid fa-building-columns', numero: '' },
  { to: '/banco', etiqueta: 'Excel del BANCO', icono: 'fa-solid fa-file-arrow-up', numero: '01' },
  { to: '/sistema', etiqueta: 'Excel del SISTEMA', icono: 'fa-solid fa-file-invoice', numero: '02' },
  { to: '/conciliacion', etiqueta: 'Conciliación', icono: 'fa-solid fa-scale-balanced', numero: '03' },
]

function salir() {
  user.clear()
  router.replace('/login')
}
</script>

<template>
  <div class="layout">
    <header class="layout__barra">
      <p class="layout__marca">Suárez <span>/ conciliación</span></p>
      <button class="layout__hamburguesa" :aria-expanded="abierto" aria-label="Menú" @click="abierto = !abierto">
        <i :class="abierto ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'"></i>
      </button>
    </header>

    <aside class="layout__menu" :class="{ 'layout__menu--abierto': abierto }">
      <div class="layout__cabecera">
        <p class="layout__marca">Suárez</p>
        <h1>Conciliación bancaria</h1>
      </div>

      <nav class="layout__nav">
        <RouterLink v-for="e in enlaces" :key="e.to" :to="e.to" class="layout__enlace" @click="abierto = false">
          <i :class="e.icono"></i>
          <span class="layout__texto">{{ e.etiqueta }}</span>
          <span v-if="e.numero" class="layout__num">{{ e.numero }}</span>
        </RouterLink>
      </nav>

      <Transition name="aparece">
        <div v-if="cuentas.actual" class="layout__cuenta">
          <p class="layout__sup">Cuenta en uso</p>
          <p class="layout__cuenta-nombre">{{ cuentas.actual.alias }}</p>
          <p class="layout__cuenta-banco">{{ cuentas.actual.banco }} · {{ cuentas.actual.numero }}</p>
        </div>
      </Transition>

      <div class="layout__usuario">
        <div class="layout__avatar"><i class="fa-regular fa-user"></i></div>
        <div class="layout__usuario-datos">
          <p class="layout__usuario-nombre">{{ user.name || 'Usuario' }}</p>
          <p class="layout__usuario-email">{{ user.email }}</p>
        </div>
        <button class="layout__salir" title="Salir" @click="salir"><i class="fa-solid fa-arrow-right-from-bracket"></i></button>
      </div>
    </aside>

    <main class="layout__contenido">
      <RouterView v-slot="{ Component }">
        <Transition name="pagina" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.layout {
  display: flex; flex-direction: column; min-height: 100vh; background: $blanco;

  &__barra { display: flex; align-items: center; justify-content: space-between; padding: 0.9rem 1.25rem; background: $negro; color: $blanco; position: sticky; top: 0; z-index: 20; }
  &__hamburguesa { background: none; border: 0; color: $blanco; font-size: 1.1rem; cursor: pointer; padding: 0.25rem 0.5rem; }
  &__marca { font-family: $font-secondary; font-size: 0.68rem; letter-spacing: 0.3em; text-transform: uppercase; color: $gris-400; span { letter-spacing: 0.1em; text-transform: none; } }

  &__menu {
    background: $negro; color: $blanco; padding: 1.25rem; display: none; flex-direction: column; gap: 1.75rem;
    &--abierto { display: flex; }
  }
  &__cabecera { display: none; }
  &__cabecera h1 { font-size: 1.05rem; font-weight: 600; letter-spacing: -0.02em; margin-top: 0.4rem; }

  &__nav { display: flex; flex-direction: column; gap: 2px; }
  &__enlace {
    display: flex; align-items: center; gap: 0.85rem; padding: 0.7rem 0.85rem; border-radius: $radio;
    color: $gris-400; text-decoration: none; font-size: 0.9rem; font-weight: 500;
    transition: background $transicion, color $transicion, transform $transicion;
    i { width: 1.1rem; text-align: center; font-size: 0.9rem; }
    &:hover { color: $blanco; background: $gris-900; transform: translateX(2px); }
    &.router-link-active { background: $blanco; color: $negro; .layout__num { color: $gris-500; } }
  }
  &__texto { flex: 1; }
  &__num { font-family: $font-secondary; font-size: 0.66rem; letter-spacing: 0.1em; color: $gris-600; }

  &__sup { font-family: $font-secondary; font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase; color: $gris-500; }
  &__cuenta { padding: 0.9rem; border: 1px solid $gris-800; border-radius: $radio; font-size: 0.82rem; }
  &__cuenta-nombre { font-weight: 600; margin-top: 0.3rem; }
  &__cuenta-banco { color: $gris-400; margin-top: 0.1rem; font-size: 0.78rem; }

  &__usuario { margin-top: auto; display: flex; align-items: center; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid $gris-800; }
  &__avatar { width: 2.1rem; height: 2.1rem; border-radius: 50%; border: 1px solid $gris-700; display: flex; align-items: center; justify-content: center; color: $gris-300; font-size: 0.85rem; }
  &__usuario-datos { flex: 1; min-width: 0; }
  &__usuario-nombre { font-size: 0.85rem; font-weight: 500; }
  &__usuario-email { font-size: 0.72rem; color: $gris-500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &__salir { background: none; border: 1px solid $gris-800; color: $gris-400; border-radius: $radio; width: 2.1rem; height: 2.1rem; cursor: pointer; transition: all $transicion; &:hover { background: $blanco; color: $negro; border-color: $blanco; } }

  &__contenido { flex: 1; padding: 1.5rem 1.25rem 3rem; width: 100%; max-width: 1240px; }
}
@media (min-width: 860px) {
  .layout { flex-direction: row; }
  .layout__barra { display: none; }
  .layout__menu { display: flex; width: 272px; flex: 0 0 272px; position: sticky; top: 0; height: 100vh; padding: 1.75rem 1.25rem; }
  .layout__cabecera { display: block; }
  .layout__contenido { padding: 3rem 3rem 4rem; }
}
</style>
