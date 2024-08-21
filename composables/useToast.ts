// composables/useToast.ts
import { ref } from 'vue';

const show = ref(false);
const message = ref('');
const type = ref('');

export function useToast() {
  function showToast(msg: string, t: string) {
    message.value = msg;
    type.value = t;
    show.value = true;
    setTimeout(() => {
      show.value = false;
    }, 3000);
  }

  return { show, message, type, showToast };
}
