<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { mensajeDe } from '@/composables/useFormato'

const user = useUserStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const verPassword = ref(false)
const error = ref<string | null>(route.query.expirada ? 'Tu sesión expiró. Vuelve a entrar.' : null)
const entrando = ref(false)

async function entrar() {
  error.value = null
  entrando.value = true
  try {
    await user.login(email.value, password.value)
    router.replace(String(route.query.a || '/cuentas'))
  } catch (e) {
    error.value = mensajeDe(e)
  } finally {
    entrando.value = false
  }
}
</script>

<template>
  <div class="login">
    <aside class="login__lado">
      <p class="login__marca">Suárez</p>
      <div class="login__texto">
        <h1>Conciliación<br />bancaria.</h1>
        <p>El extracto del banco contra el libro del sistema. Mes a mes, sin sorpresas.</p>
      </div>
      <p class="login__pie">© {{ new Date().getFullYear() }} · Bakano</p>
    </aside>

    <main class="login__formulario">
      <form @submit.prevent="entrar">
        <p class="login__paso">Entrar</p>
        <h2>Bienvenido.</h2>

        <label class="campo">
          <span>Correo</span>
          <div class="campo__control">
            <i class="fa-regular fa-envelope"></i>
            <input v-model="email" type="email" autocomplete="username" placeholder="tu@correo.com" required autofocus />
          </div>
        </label>

        <label class="campo">
          <span>Contraseña</span>
          <div class="campo__control">
            <i class="fa-solid fa-lock"></i>
            <input v-model="password" :type="verPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="••••••••" required />
            <button type="button" class="campo__ojo" :aria-label="verPassword ? 'Ocultar' : 'Mostrar'" @click="verPassword = !verPassword">
              <i :class="verPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
            </button>
          </div>
        </label>

        <Transition name="aparece">
          <p v-if="error" class="login__error" role="alert"><i class="fa-solid fa-circle-exclamation"></i> {{ error }}</p>
        </Transition>

        <button class="boton login__boton" type="submit" :disabled="entrando">
          <span>{{ entrando ? 'Entrando…' : 'Entrar' }}</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </form>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.login {
  display: flex; flex-direction: column; min-height: 100vh; background: $blanco;

  &__lado {
    background: $negro; color: $blanco; padding: 2rem 1.5rem;
    display: flex; flex-direction: column; gap: 2.5rem;
  }
  &__marca { font-family: $font-secondary; font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: $gris-400; }
  &__texto h1 { font-size: clamp(2.4rem, 6vw, 4.5rem); font-weight: 600; letter-spacing: -0.04em; line-height: 0.95; }
  &__texto p { color: $gris-400; margin-top: 1.25rem; max-width: 32ch; font-size: 1rem; }
  &__pie { margin-top: auto; font-size: 0.75rem; color: $gris-600; }

  &__formulario { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2.5rem 1.5rem; }
  form { width: 100%; max-width: 380px; display: flex; flex-direction: column; gap: 1.25rem; }
  &__paso { font-family: $font-secondary; font-size: 0.68rem; letter-spacing: 0.25em; text-transform: uppercase; color: $gris-500; }
  h2 { margin-top: -0.75rem; }
  &__error { font-size: 0.85rem; color: $negro; display: flex; gap: 0.5rem; align-items: center; padding: 0.75rem 0.9rem; border: 1px solid $gris-300; border-radius: $radio; background: $gris-50; margin: 0; }
  &__boton { margin-top: 0.5rem; padding: 0.9rem 1.25rem; justify-content: space-between; }
}
.campo {
  display: flex; flex-direction: column; gap: 0.45rem;
  span { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: $gris-500; font-weight: 500; }
  &__control { position: relative; display: flex; align-items: center;
    > i { position: absolute; left: 0.9rem; color: $gris-400; font-size: 0.85rem; pointer-events: none; transition: color $transicion; }
    input { padding-left: 2.5rem; padding-right: 2.5rem; }
    input:focus ~ i, &:focus-within > i { color: $negro; }
  }
  &__ojo { position: absolute; right: 0.4rem; background: none; border: 0; cursor: pointer; color: $gris-400; padding: 0.5rem; transition: color $transicion; &:hover { color: $negro; } }
}
@media (min-width: 860px) {
  .login { flex-direction: row; }
  .login__lado { flex: 0 0 46%; padding: 3rem; min-height: 100vh; position: sticky; top: 0; }
  .login__formulario { padding: 3rem; }
}
</style>
