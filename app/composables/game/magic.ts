export const useMagicActions = () => {
  const { $orpc } = useNuxtApp();

  const randomAction = {
    id:      'random',
    icon:    'tabler:arrows-shuffle',
    handler: async () => {
      const cardId = await $orpc.magic.card.random();

      await navigateTo(`/magic/card/${cardId}`);
    },
  };

  return { randomAction };
};
