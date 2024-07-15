import * as b28n from "./b28n.js";

const LOCALE = "en-GB";
const TRAINING_DIR = `data/training/${LOCALE}`;
const OUTPUT_PATH = `data/trained/${LOCALE}.json`;

var translator = new b28n.B28n();

for await (var entry of Deno.readDir(TRAINING_DIR)) {
    var data = await Deno.readTextFile(`${TRAINING_DIR}/${entry.name}`);

    translator.encode(data);
}

await Deno.writeTextFile(OUTPUT_PATH, JSON.stringify(translator.decoderLookup));