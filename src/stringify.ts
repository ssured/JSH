// from https://github.com/BridgeAR/stable-fast-stringify/blob/0fa211fedfaabf4ad700a63f155c784033afedb3/stable.js

// Simple without any options
function stringifySimple(
  key: string,
  value: string | number | boolean | object | null
): string {
  var i, res;

  if (typeof value === "object") {
    if (value === null) {
      return "null";
    }
    // if (typeof value.toJSON === "function") {
    //   value = value.toJSON(key);
    //   // Prevent calling `toJSON` again
    //   if (typeof value !== "object") {
    //     return stringifySimple(key, value);
    //   }
    //   if (value === null) {
    //     return "null";
    //   }
    // }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return "[]";
      }
      res = "[";
      // Use null as placeholder for non-JSON values.
      for (i = 0; i < value.length - 1; i++) {
        const tmp = stringifySimple(String(i), value[i]);
        res += tmp !== undefined ? tmp : "null";
        res += ",";
      }
      const tmp = stringifySimple(String(i), value[i]);
      res += tmp !== undefined ? tmp : "null";
      res += "]";
      return res;
    }

    const keys = insertSort(Object.keys(value));
    if (keys.length === 0) {
      return "{}";
    }
    res = "{";
    for (i = 0; i < keys.length - 1; i++) {
      key = keys[i];
      const tmp = stringifySimple(key, value[key]);
      if (tmp !== undefined) {
        res += `"${strEscape(key)}":${tmp},`;
      }
    }
    key = keys[i];
    const tmp = stringifySimple(key, value[key]);
    if (tmp !== undefined) {
      res += `"${strEscape(key)}":${tmp}`;
    }
    res += "}";
    return res;
  } else if (typeof value === "string") {
    return `"${strEscape(value)}"`;
  } else if (typeof value === "number") {
    // JSON numbers must be finite. Encode non-finite numbers as null.
    // Convert the numbers implicit to a string instead of explicit.
    return isFinite(value) ? String(value) : "null";
  } /*if (typeof value === "boolean") */ else {
    return value === true ? "true" : "false";
  }
}

export const stringify = (v: string | number | boolean | object | null) =>
  stringifySimple("", v);

function insertSort(arr: string[]) {
  for (var i = 1; i < arr.length; i++) {
    const tmp = arr[i];
    var j = i;
    while (j !== 0 && arr[j - 1] > tmp) {
      arr[j] = arr[j - 1];
      j--;
    }
    arr[j] = tmp;
  }

  return arr;
}

// eslint-disable-next-line
const strEscapeSequencesRegExp = /[\x00-\x1f\x22\x5c]/;
// eslint-disable-next-line
const strEscapeSequencesReplacer = /[\x00-\x1f\x22\x5c]/g;

// Escaped special characters. Use empty strings to fill up unused entries.
const meta = [
  "\\u0000",
  "\\u0001",
  "\\u0002",
  "\\u0003",
  "\\u0004",
  "\\u0005",
  "\\u0006",
  "\\u0007",
  "\\b",
  "\\t",
  "\\n",
  "\\u000b",
  "\\f",
  "\\r",
  "\\u000e",
  "\\u000f",
  "\\u0010",
  "\\u0011",
  "\\u0012",
  "\\u0013",
  "\\u0014",
  "\\u0015",
  "\\u0016",
  "\\u0017",
  "\\u0018",
  "\\u0019",
  "\\u001a",
  "\\u001b",
  "\\u001c",
  "\\u001d",
  "\\u001e",
  "\\u001f",
  "",
  "",
  '\\"',
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "\\\\"
];

const escapeFn = (str: string) => meta[str.charCodeAt(0)];

// Escape control characters, double quotes and the backslash.
function strEscape(str: string) {
  // Some magic numbers that worked out fine while benchmarking with v8 6.0
  if (str.length < 5000 && !strEscapeSequencesRegExp.test(str)) {
    return str;
  }
  if (str.length > 100) {
    return str.replace(strEscapeSequencesReplacer, escapeFn);
  }
  var result = "";
  var last = 0;
  for (var i = 0; i < str.length; i++) {
    const point = str.charCodeAt(i);
    if (point === 34 || point === 92 || point < 32) {
      if (last === i) {
        result += meta[point];
      } else {
        result += `${str.slice(last, i)}${meta[point]}`;
      }
      last = i + 1;
    }
  }
  if (last === 0) {
    result = str;
  } else if (last !== i) {
    result += str.slice(last);
  }
  return result;
}
