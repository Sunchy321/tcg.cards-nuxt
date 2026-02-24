export interface Action {
  id:      string;
  icon?:   string;
  handler: () => void;
}

const actionsMap = ref<Map<string, Action[]>>(new Map());

const generateInstanceId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const useActions = () => {
  const currentInstanceId = generateInstanceId();

  const setActions = (newActions: Action[]) => {
    if (import.meta.client) {
      actionsMap.value.set(currentInstanceId, newActions);
    }
  };

  const clearActions = () => {
    if (import.meta.client) {
      actionsMap.value.delete(currentInstanceId);
    }
  };

  const getActions = () => {
    return computed(() => {
      const allActions: Action[] = [];
      actionsMap.value.forEach(actions => {
        allActions.push(...actions);
      });
      return allActions;
    });
  };

  onUnmounted(() => {
    clearActions();
  });

  return {
    setActions,
    clearActions,
    getActions,
  };
};
