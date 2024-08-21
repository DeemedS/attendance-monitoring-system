<template>
  <div class="flex min-h-[100vh] flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-slate-800 items-center">
    <div class="bg-slate-400 p-5 rounded-md lg:w-2/5">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <img class="mx-auto h-20 w-auto" src="@/assets/images/PUPLogo.png" alt="Your Company" />
        <h1 class="mt-3 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">Attendance Tracking
          System</h1>

        <h2 class="text-center text-xl font-bold leading-9 tracking-tight text-gray-900">Sign in to your account
        </h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-3/5 sm:max-w-sm">
        <form @submit.prevent="signInWithPassword" class="space-y-6 ">
          <div>
            <label for="username" class="block text-sm font-medium leading-6 text-gray-900">Username</label>
            <div class="mt-2">
              <input v-model="username" id="username" name="username" type="text" autocomplete="username" required
                class="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm font-medium leading-6 text-gray-900">Password</label>
              <div class="text-sm">
                <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
              </div>
            </div>
            <div class="mt-2">
              <input v-model="password" id="password" name="password" type="password" autocomplete="current-password"
                required
                class="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
          </div>

          <div>
            <button type="submit"
              class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign
              in</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <Toast />
</template>


<script lang="ts" setup>


import { ref } from 'vue';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();
const supabase = useSupabaseClient()

const router = useRouter()

const username = ref<string>('');
const password = ref<string>('');

const signInWithPassword = async () => {


  const { data: user, error: userError } = await supabase
    .from('accounts')
    .select('username, email')
    .eq('username', username.value)
    .single();

  if (userError) {
    showToast("User does not exist", 'danger');
    return;
  }

  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email: user?.email,
    password: password.value,
  });

  if (authError) {
    showToast(authError.message, 'warning');
    return;
  } else {
    router.push('/calendar');
  }

}

</script>