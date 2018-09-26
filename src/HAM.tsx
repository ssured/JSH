// from https://youtu.be/EHZyaupYjYo @55:54

type State = number;

type Value = {
  state: State;
  data: any;
};

function saveToDiskLater(d: Value) {
  console.log("save later", d);
}
function saveToHistory(d: Value) {
  console.log("save to history", d);
}
function saveNow(d: Value) {
  console.log("save now", d);
}
function updateLowerBoundary(s: State) {
  console.log("update lower boundary", s);
}
function saveBelowBoundary(data: any) {
  console.log("save below boundary", data);
}
function noop() {
  console.log("do nothing");
}
function Lex(d: any) {
  return JSON.stringify(d);
}

function Converge(system: State, me: Value, them: Value) {
  const { state: Sc, data: Dc } = me;
  const { state: Si, data: Di } = them;

  switch (true) {
    case system < Si:
      saveToDiskLater(them);
      break;
    case Si < Sc:
      saveToHistory(them);
      break;
    case Sc < Si:
      saveNow(them);
      me.data = them.data;

      updateLowerBoundary(Si);
      me.state = them.state;
      break;
    case Si === Sc:
      const lDi = Lex(Di);
      const lDc = Lex(Dc);

      switch (true) {
        case lDi === lDc:
          noop();
          break;
        case lDi < lDc:
          saveBelowBoundary(Di);
          break;
        case lDc < lDi:
          saveNow(them);
          me.data = them.data;
          saveBelowBoundary(Dc);
          break;
        default:
          throw new Error("Invalid HAM state encountered");
      }
      break;
    default:
      throw new Error("Invalid HAM state encountered");
  }
}

function pp(v: any) {
  return Object.keys(v)
    .map(k => `${k} = ${JSON.stringify(v[k].data)} @${v[k].state}`)
    .join(", ");
}

/*
console.log("Tests:");

let Alice: Value = { data: "a", state: 1 };
let Bob: Value = { data: "b", state: 2 };
console.log("Before HAM", pp({ Alice, Bob }));
Converge(7, Alice, Bob);
Converge(7, Bob, Alice);
console.log("After HAM", pp({ Alice, Bob }));

console.log("==================");
Alice = { data: "a", state: 5 };
Bob = { data: "b", state: 2 };
console.log("Before HAM", pp({ Alice, Bob }));
Converge(7, Alice, Bob);
Converge(7, Bob, Alice);
console.log("After HAM", pp({ Alice, Bob }));

console.log("==================");
Alice = { data: "a", state: 2 };
Bob = { data: "a", state: 2 };
console.log("Before HAM", pp({ Alice, Bob }));
Converge(7, Alice, Bob);
Converge(7, Bob, Alice);
console.log("After HAM", pp({ Alice, Bob }));

console.log("==================");
Alice = { data: "b", state: 2 };
Bob = { data: "a", state: 2 };
console.log("Before HAM", pp({ Alice, Bob }));
Converge(7, Alice, Bob);
Converge(7, Bob, Alice);
console.log("After HAM", pp({ Alice, Bob }));

console.log("==================");
Alice = { data: "b", state: 2 };
Bob = { data: "b", state: 2 };
let Carl = { data: "c", state: 9 };
console.log("Before HAM", pp({ Alice, Bob, Carl }));
Converge(7, Alice, Carl);
Converge(7, Bob, Carl);
console.log("After HAM", pp({ Alice, Bob, Carl }));
*/
