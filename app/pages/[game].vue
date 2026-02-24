<template>
  <NuxtPage />
</template>

<script setup lang="ts">
import { GAMES } from '#shared';

definePageMeta({
  validate: ({ params }) => {
    return typeof params.game === 'string' && GAMES.includes(params.game as any);
  },
});

</script>
