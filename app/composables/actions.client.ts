export interface Action {
  id:      string;
  icon?:   string;
  handler: () => void;
}

const actionsMap = ref<Map<object, Action[]>>(new Map());
const ownerMap = new Map<object, number>();

export const useActions = () => {
  const instance = getCurrentInstance();
  const componentType = instance?.type ?? {};
  const instanceUid = instance?.uid ?? -1;

  const setActions = (newActions: Action[]) => {
    if (import.meta.client) {
      if (actionsMap.value.get(componentType) === newActions) return;
      ownerMap.set(componentType, instanceUid);
      actionsMap.value.set(componentType, newActions);
    }
  };

  const clearActions = () => {
    if (import.meta.client) {
      if (ownerMap.get(componentType) !== instanceUid) return;
      actionsMap.value.delete(componentType);
      ownerMap.delete(componentType);
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
