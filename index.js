import * as b28n from "./b28n/b28n.js";

var translator = new b28n.B28n();
var encoding = true;

function setHeadings() {
    document.querySelector(".editorHeading").textContent = encoding ? "English" : "E5h";
    document.querySelector(".resultHeading").textContent = encoding ? "E5h" : "English";
}

async function translate() {
    var input = document.querySelector(".editor").textContent;
    var result = null;

    if (encoding) {
        result = translator.encode(input, false);
    } else {
        result = translator.decode(input);
    }

    document.querySelector(".result").textContent = result;
}

function setMode(shouldEncode = encoding) {
    encoding = shouldEncode;

    setHeadings();
    translate();
}

window.addEventListener("load", function() {
    setMode();

    document.querySelector(".editor").addEventListener("input", function() {
        translate();
    });

    document.querySelector(".swap").addEventListener("click", function() {
        document.querySelector(".editor").textContent = document.querySelector(".result").textContent;

        setMode(!encoding);
    });
});

await translator.loadLookup();