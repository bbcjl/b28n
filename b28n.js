export class B28n {
    constructor() {
        this.decoderLookup = {};
    }

    async loadLookup(path = "data/trained/en-GB.json") {
        if (Deno) {
            this.decoderLookup = JSON.parse(await Deno.readTextFile(path));

            return;
        }

        var response = fetch(path);

        this.decoderLookup = await response.json();
    }

    #registerInLookup(word, encodedWord, previousEncodedWord = null) {
        if (previousEncodedWord != null) {
            this.decoderLookup[`${previousEncodedWord} ${encodedWord}`] = word;
        }

        this.decoderLookup[encodedWord] = word;
    }

    #encodeWord(word) {
        if (word.length < 3) {
            return word;
        }

        if (word.match(/^\d+$/)) {
            return word;
        }

        if (word == "BBC") {
            return "B28n";
        }

        if (word == "bbc") {
            return "b28n";
        }

        return `${word[0]}${word.length - 2}${word.slice(-1)}`;
    }

    encodeWord(word, previousDecodedWord = null) {
        if (word.match(/^\d+$/)) {
            return word;
        }

        var encodedWord = this.#encodeWord(word);

        this.#registerInLookup(word, encodedWord, previousDecodedWord);

        return encodedWord;
    }

    encode(text) {
        var previousDecodedWord = null;

        return text.replace(/\w+/g, (match) => this.encodeWord(match, previousDecodedWord, previousDecodedWord = match));
    }

    decodeWord(word, previousEncodedWord = null) {
        if (word.length < 3) {
            return word;
        }

        if (word.match(/^\d+$/)) {
            return word;
        }

        if (word == "B28n") {
            return "BBC";
        }

        if (word == "b28n") {
            return "bbc";
        }

        return this.decoderLookup[`${previousEncodedWord} ${word}`] ?? this.decoderLookup[word] ?? word;
    }

    decode(text) {
        var previousDecodedWord;

        return text.replace(/\w+/g, (match) => previousDecodedWord = this.decodeWord(match, previousDecodedWord));
    }
}