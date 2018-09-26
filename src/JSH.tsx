import { stringify } from "./stringify";
import * as sha1 from "sha1";

// const MAX_INT_HEX_LENGTH = Math.floor(
//   Math.log2(Number.MAX_SAFE_INTEGER) / Math.log2(16)
// );

const Lex = stringify;

// const rainbowTable: { [key: string]: {} | null } = {};

// const Tell = (hash: string, v: any): void => (rainbowTable[hash] = v);
// const Ask = (hash: string): any => rainbowTable[hash];

export const Hash = (v: {} | null): string => {
  const hash = sha1(Lex(v)) as string;
  return hash; // parseInt(hash.substr(0, MAX_INT_HEX_LENGTH), 16);
};

// const MorphValue = (v: string | number | boolean | object | null): any => {
//   if (typeof v === "object") {
//     if (v == null) return [null];
//     if (Array.isArray(v)) {
//       const morphedArray = v.map(i => MorphValue(i));
//       const hashedArray = Hash(morphedArray);
//       const didKnow = !!Ask(hashedArray);
//       if (didKnow) {
//         return [null, null, hashedArray];
//       } else {
//         Tell(hashedArray, morphedArray);
//         return [morphedArray, null, hashedArray];
//       }
//     }

//     const morphedObject = Object.keys(v).reduce((map, key) => {
//       map[key] = MorphValue(v[key]);
//       return map;
//     }, {});
//     const hashedObject = Hash(morphedObject);
//     const didKnow = !!Ask(hashedObject);
//     if (didKnow) {
//       return [null, hashedObject];
//     } else {
//       Tell(hashedObject, morphedObject);
//       return [morphedObject, Hash(morphedObject)];
//     }
//   }

//   return [v];
// };

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
  const HashObject = (morphed: MorphedObject) =>
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
  const HashArray = (arr: MorphedArray) =>
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
      return [morphedArray, null, HashArray(morphedArray)];
    }

    const morphedObject = MorphObject(value);
    const morphedObjectHash = HashObject(morphedObject);

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
    if (primitive) {
      if (typeof primitive !== "object") throw new Error("Formatting is wrong");
      const object = primitive as MorphedObject;
      return Object.keys(object).reduce((map, key) => {
        map[key] = UnMorph(object[key]);
        return map;
      }, {});
    }
    if (rainbow && rainbow.has(objectHash)) {
      return rainbow.get(objectHash)!;
    }
    throw new Error(`Cannot unmorph object, ${objectHash} is unknown`);
  } else if (morphed.length === 3) {
    const [primitive, , arrayHash] = morphed;
    if (primitive) {
      return (primitive as MorphedValue[]).map(v => UnMorph(v, rainbow));
    }
    if (rainbow && rainbow.has(arrayHash)) {
      return rainbow.get(arrayHash)!;
    }
    throw new Error(`Cannot unmorph array, ${arrayHash} is unknown`);
  }
  return assertNever(morphed);
};

// const MorphObject = (v: object): any => {
//   const result = Object.entries(v).reduce((map, [key, value]) => {
//     map[key] = MorphValue(value);
//     return map;
//   }, {});
//   Hash(result);
//   return result;
// };

// const UnMorphObject = (v: object): any => {
//   return Object.entries(v).reduce((map, [key, value]) => {
//     const [primitive, object, array] = value;
//     map[key] = array
//       ? [...Object.values(UnMorphObject(Ask(array)))]
//       : object
//         ? UnMorphObject(Ask(object))
//         : primitive;
//     return map;
//   }, {});
// };

// // const value1 = { hello: ["world", 0], a: "b" };
// // const value3 = { a: "b", hello: ["world", 0] };
// // const value2 = { a: "b", hello: [0, "world"] };
// // console.log("Hash", value1, Hash(value1));
// // console.log("Hash", value2, Hash(value2));
// // console.log("Hash", value3, Hash(value3));

// const v = { hello: ["world", 0, { t: "tst" }], a: { b: "bst" }, c: "cst" };
// const morphed = MorphObject(v);
// const unmorphed = UnMorphObject(morphed);
// console.log(v === unmorphed, Lex(v) === Lex(unmorphed));

// console.log("Morph", JSON.stringify(morphed, null, 2));
// // console.log("UnMorph", JSON.stringify(unmorphed, null, 2));

// const v2 = {
//   hello: ["world", 0, { t: "tst" }],
//   a: { b: "bst", c: { d: 'DDD"' } },
//   c: "cst"
// };
// const morphed2 = MorphObject(v2);
// console.log("Morph2", JSON.stringify(morphed2, null, 2));

// // console.log("Morph", JSON.stringify(Hash(v.hello), null, 2));
// // console.log("Morph", JSON.stringify(Hash(v.a), null, 2));

// console.log(JSON.stringify(rainbowTable, null, 2));
