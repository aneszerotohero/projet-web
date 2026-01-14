<template>
  <Teleport to="body">
    <transition-group name="toast" tag="div" class="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'px-6 py-3 rounded-lg shadow-lg font-medium text-white flex items-center gap-3 min-w-80 animate-in fade-in slide-in-from-right duration-300',
          notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500',
        ]"
      >
        <div v-if="notification.type === 'success'" class="text-lg">✓</div>
        <div v-else class="text-lg">!</div>
        <span>{{ notification.message }}</span>
        <button
          @click="remove(notification.id)"
          class="ml-auto text-white hover:text-gray-100 transition"
        >
          ✕
        </button>
      </div>
    </transition-group>
  </Teleport>
</template>

<script setup>
import { ref, inject } from 'vue';

const notifications = ref([]);

const add = (message, type = 'success', duration = 3000) => {
  const id = Date.now();
  notifications.value.push({ id, message, type });

  if (duration > 0) {
    setTimeout(() => remove(id), duration);
  }

  return id;
};

const remove = (id) => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index > -1) {
    notifications.value.splice(index, 1);
  }
};

// Expose methods globally
window.$notify = { add, remove };
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
