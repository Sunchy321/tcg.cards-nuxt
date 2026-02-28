import { ca } from '../adapter';

import { simple as simpleSchema } from '#search/command/builtin/simple';

import { defaultTranslate } from '#search/client/translate';

export type SimpleClientOption = {
  map?: Record<string, string> | boolean | ((value: string) => string);
};

const operatorMap: Record<string, string> = {
  '=':  'is',
  '!=': 'is-not',
  ':':  'is',
  '!:': 'is-not',
};

export const simple = ca
  .adapt(simpleSchema)
  .$meta<{ id: string, map?: Record<string, string> | boolean | ((value: string) => string) }>()
  .explain((arg, { id, map }, i18n) => {
    const realParam = (() => {
      const { value } = arg;

      // NO changes
      if (map == null || map === false) {
        return value;
      }

      if (typeof value !== 'string') {
        return value;
      }

      const paramKey = map === true
        ? value
        : map instanceof Function
          ? map(value)
          : map[value] ?? value;

      return i18n(`$.parameter.${id}.${paramKey}`);
    })();

    return defaultTranslate({ ...arg, value: realParam }, i18n, id, operatorMap);
  });
