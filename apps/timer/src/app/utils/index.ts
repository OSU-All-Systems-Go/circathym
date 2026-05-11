export const transform = (obj: any, predicate: any) => {
  return Object.keys(obj).reduce((memo: any, key) => {
    if (predicate(obj[key], key)) {
      memo[key] = obj[key];
    }
    return memo;
  }, {});
};

export const omit = (obj: any, items: any) =>
  transform(obj, (_value: any, key: any) => !items.includes(key));

export const pick = (obj: any, items: any) =>
  transform(obj, (_value: any, key: any) => items.includes(key));

export default {
  omit,
  pick,
  transform,
};
