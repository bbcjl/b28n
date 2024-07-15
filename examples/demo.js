import * as b28n from "../b28n/b28n.js";

var translator = new b28n.B28n();

await translator.loadLookup();

console.log(translator.encode("This is a demonstration of using the B28n library."));
console.log(translator.decodeAllAlternatives("T2s is a d11n of u3g t1e B28n l5y."));