export interface SelectItem {
  value: string;
  label: string;
}

export type Param
  = {
    id:       string;
    type:     'switch';
    icon?:    string;
    value:    boolean;
    onChange: (val: boolean) => void;
  }
  | {
    id:       string;
    type:     'select';
    items:    SelectItem[];
    value:    string | undefined;
    onChange: (val: string) => void;
  };

// ─── Client-only module-level singleton ──────────────────────────────────────

const _params = shallowRef<Param[]>([]);
let _ownerUid = -1;

// ─────────────────────────────────────────────────────────────────────────────

export const useParams = () => {
  const instance = getCurrentInstance();
  const instanceUid = instance?.uid ?? -1;

  /**
   * Register params for the current page.
   * Replaces whatever params the previous page set.
   */
  const setParams = (params: Param[]) => {
    if (import.meta.client) {
      _ownerUid = instanceUid;
      _params.value = params;
    }
  };

  /**
   * Clear params registered by this component.
   * Skipped if another component has taken ownership,
   * preventing navigation flicker.
   */
  const clearParams = () => {
    if (import.meta.client) {
      if (_ownerUid !== instanceUid) return;
      _ownerUid = -1;
      _params.value = [];
    }
  };

  /** Returns a computed ref of the current params list. */
  const getParams = () => computed(() => _params.value);

  onUnmounted(() => {
    clearParams();
  });

  return {
    setParams,
    clearParams,
    getParams,
  };
};
