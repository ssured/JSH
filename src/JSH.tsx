import { stringify } from "./stringify";
import * as sha1 from "sha1";

const Lex = stringify;

export const Hash = (v: {} | null): string => {
  const hash = sha1(Lex(v)) as string;
  return hash; // parseInt(hash.substr(0, MAX_INT_HEX_LENGTH), 16);
};

type NotUndefined = string | number | boolean | object | null;

type MorphedObject = { [key: string]: MorphedValue };
type MorphedArray = MorphedValue[];

type MorphedValue =
  | [NotUndefined]
  | [NotUndefined, string]
  | [NotUndefined, null, string];

export const Morph = (
  value: NotUndefined,
  rainbow?: Map<string, NotUndefined>
): MorphedValue => {
  const MorphObject = (obj: object): MorphedObject => {
    return Object.keys(obj).reduce((map, key) => {
      map[key] = Morph(obj[key]);
      if (rainbow && map[key].length > 1) {
        const hash = map[key][map[key].length - 1];
        if (rainbow.has(hash)) {
          map[key][0] = null;
        }
      }
      return map;
    }, {});
  };
  const HashMorphedObject = (morphed: MorphedObject) =>
    Hash(
      Object.keys(morphed).reduce((map, key) => {
        map[key] = [...morphed[key]];
        if (map[key].length > 1) map[key][0] = null; // remove the object hint
        return map;
      }, {})
    );
  const MorphArray = (arr: NotUndefined[]): MorphedArray => {
    return arr.map(item => {
      const value = Morph(item);
      if (rainbow && value.length > 1) {
        const hash = value[value.length - 1] as string;
        if (rainbow.has(hash)) {
          value[0] = null;
        }
      }
      return value;
    });
  };
  const HashMorphedArray = (arr: MorphedArray) =>
    Hash(
      arr.map(morphed => {
        const value = [...morphed];
        if (value.length > 1) value[0] = null; // remove the object hint
        return value;
      })
    );

  if (typeof value === "object") {
    if (value == null) return [null];

    if (Array.isArray(value)) {
      const morphedArray = MorphArray(value);
      const morphedArrayHash = HashMorphedArray(morphedArray);
      return [
        rainbow && rainbow.has(morphedArrayHash) ? null : morphedArray,
        null,
        morphedArrayHash
      ];
    }

    const morphedObject = MorphObject(value);
    const morphedObjectHash = HashMorphedObject(morphedObject);

    return [
      rainbow && rainbow.has(morphedObjectHash) ? null : morphedObject,
      morphedObjectHash
    ];
  }

  return [value];
};

const assertNever = (value: never) => {
  throw new Error("typing error");
};

export const UnMorph = (
  morphed: MorphedValue,
  rainbow?: Map<string, NotUndefined>
): NotUndefined => {
  if (morphed.length === 1) {
    return morphed[0];
  } else if (morphed.length === 2) {
    const [primitive, objectHash] = morphed;
    if (rainbow && rainbow.has(objectHash)) {
      return rainbow.get(objectHash)!;
    }
    if (primitive) {
      const object = primitive as MorphedObject;
      return Object.keys(object).reduce((map, key) => {
        map[key] = UnMorph(object[key]);
        return map;
      }, {});
    }
    throw new Error(`Cannot unmorph object, ${objectHash} is unknown`);
  } else if (morphed.length === 3) {
    const [primitive, , arrayHash] = morphed;
    if (rainbow && rainbow.has(arrayHash)) {
      return rainbow.get(arrayHash)!;
    }
    if (primitive) {
      return (primitive as MorphedValue[]).map(v => UnMorph(v, rainbow));
    }
    throw new Error(`Cannot unmorph array, ${arrayHash} is unknown`);
  }
  return assertNever(morphed);
};

export const ReadHashes = (obj: MorphedValue): {} => {
  if (obj.length === 3) {
    const [hint, , hash] = obj;
    return hint
      ? hint.reduce(
          (map, item) => ({
            ...ReadHashes(item),
            ...map
          }),
          {
            [hash]: hint
          }
        )
      : {};
  } else if (obj.length === 2) {
    const [hint, hash] = obj;
    return hint
      ? Object.keys(hint).reduce(
          (map, key) => ({
            ...ReadHashes(hint[key]),
            ...map
          }),
          {
            [hash]: hint
          }
        )
      : {};
  } else {
    return {};
  }
};

export const AddHashes = (
  rainbow?: Map<string, NotUndefined>,
  obj: MorphedValue
): void => {
  for ([key, value] of ReadHashes(obj)) {
    console.log(key, UnMorph(value, rainbow));
    rainbow.add(key, UnMorph(value, rainbow));
  }
};
