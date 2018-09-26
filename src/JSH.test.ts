import { Morph, Hash, UnMorph } from "./JSH";

describe("JSH", () => {
  test("serialization of primitives", () => {
    expect(Morph("a")).toEqual(["a"]);
    expect(Morph(null)).toEqual([null]);
    expect(Morph(1)).toEqual([1]);
    expect(Morph(true)).toEqual([true]);
  });

  test("serialization of objects", () => {
    expect(Morph({ a: "b" })).toEqual([{ a: ["b"] }, Hash({ a: ["b"] })]);

    expect(Morph({ a: "b", c: 1 })).toEqual([
      { a: ["b"], c: [1] },
      Hash({ a: ["b"], c: [1] })
    ]);
  });

  test("serialization of nested objects", () => {
    expect(Morph({ a: { b: "b" } })).toEqual([
      { a: [{ b: ["b"] }, Hash({ b: ["b"] })] },
      Hash({ a: [null, Hash({ b: ["b"] })] })
    ]);

    // when the hash is known the hint is not supplied
    const rainbow = new Map();
    rainbow.set(Hash({ b: ["b"] }), { b: ["b"] });

    expect(Morph({ a: { b: "b" } }, rainbow)).toEqual([
      { a: [null, Hash({ b: ["b"] })] },
      Hash({ a: [null, Hash({ b: ["b"] })] })
    ]);
  });

  test("serialization of arrays", () => {
    expect(Morph([1])).toEqual([[[1]], null, Hash([[1]])]);
    expect(Morph([1, "a"])).toEqual([[[1], ["a"]], null, Hash([[1], ["a"]])]);
  });

  test("serialization of nested arrays", () => {
    expect(Morph([[1]])).toEqual([
      [[[[1]], null, Hash([[1]])]],
      null,
      Hash([[null, null, Hash([[1]])]])
    ]);

    // when the hash is known the hint is not supplied
    const rainbow = new Map();
    rainbow.set(Hash([[1]]), [[1]]);

    expect(Morph([[1]], rainbow)).toEqual([
      [[null, null, Hash([[1]])]],
      null,
      Hash([[null, null, Hash([[1]])]])
    ]);
  });

  test("serialization of mixed nested", () => {
    expect(Morph([{ a: 1 }])).toEqual([
      [[{ a: [1] }, Hash({ a: [1] })]],
      null,
      Hash([[null, Hash({ a: [1] })]])
    ]);

    expect(Morph({ a: [1] })).toEqual([
      { a: [[[1]], null, Hash([[1]])] },
      Hash({ a: [null, null, Hash([[1]])] })
    ]);
  });

  test("unmorph", () => {
    const values: any[] = [
      "a",
      null,
      1,
      true,
      [1],
      [1, "a"],
      { a: "A" },
      { a: { b: "b" } },
      [[1]],
      [{ a: 1 }],
      { a: [1] },
      {
        accounting: [
          {
            firstName: "John",
            lastName: "Doe",
            age: 23
          },

          {
            firstName: "Mary",
            lastName: "Smith",
            age: 32
          }
        ],
        sales: [
          {
            firstName: "Sally",
            lastName: "Green",
            age: 27
          },

          {
            firstName: "Jim",
            lastName: "Galley",
            age: 41
          }
        ]
      }
    ];
    expect.assertions(values.length);

    values.forEach(value => expect(UnMorph(Morph(value))).toEqual(value));
  });
});

console.log(
  JSON.stringify(
    Morph({
      a: { b: "b" }
    }),
    null,
    2
  )
);
