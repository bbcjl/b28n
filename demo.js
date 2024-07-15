import * as b28n from "./b28n.js";

var translator = new b28n.B28n();

await translator.loadLookup();

console.log(translator.encode("A library to encode words as numeronyms, because why not"));
console.log(translator.decode("T2s is a t2t of t1e c2e t2t c1n do t1e t3g — so p4y c2l, r3t? Or is it p4y c2l?"));