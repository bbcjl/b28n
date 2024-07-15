const INITIALISMS = {
    "bbc": "British Broadcasting Corporation",
    "itv": "Independent Television",
    "ibm": "International Business Machines"
};

export class B28n {
    #numeronymInitialisms = {};

    constructor() {
        this.decoderLookup = {};

        for (var term of Object.values(INITIALISMS)) {
            var encodedWord = this.encodeWord(term.split(" ").join(""), false);

            this.#numeronymInitialisms[encodedWord] = term;
            this.#numeronymInitialisms[encodedWord.toLocaleLowerCase()] = term.toLocaleLowerCase();
            this.#numeronymInitialisms[encodedWord.toLocaleUpperCase()] = term.toLocaleUpperCase();
        }
    }

    static wordIsSuitableNumeronym(word) {
        return word.length >= 3 && !word.match(/^\d+$/) && !word.match(/^[a-zA-Z]\d+[a-zA-Z]$/);
    }

    async loadLookup(path = "data/trained/en-GB.json") {
        if (Deno) {
            this.decoderLookup = JSON.parse(await Deno.readTextFile(path));

            return;
        }

        var response = fetch(path);

        this.decoderLookup = await response.json();
    }

    #registerInLookupForKey(key, word) {
        this.decoderLookup[key] ??= {};
        this.decoderLookup[key][word] ??= 0;

        this.decoderLookup[key][word]++;
    }

    #registerInLookup(word, encodedWord, previousEncodedWord = null) {
        if (previousEncodedWord != null) {
            this.#registerInLookupForKey(`${previousEncodedWord} ${encodedWord}`, word);
        }

        this.#registerInLookupForKey(encodedWord, word);
    }

    #encodeWord(word) {
        if (!this.constructor.wordIsSuitableNumeronym(word)) {
            return word;
        }

        return `${word[0]}${word.length - 2}${word.slice(-1)}`;
    }

    encodeWord(word, train = true, previousDecodedWord = null) {
        if (!this.constructor.wordIsSuitableNumeronym(word)) {
            return word;
        }

        var encodedWord = this.#encodeWord(word);

        if (train) {
            this.#registerInLookup(word, encodedWord, previousDecodedWord);
        }

        return encodedWord;
    }

    encode(text, train = true) {
        var previousDecodedWord = null;

        for (var term of Object.values(INITIALISMS)) {
            text = text.replaceAll(term, term.split(" ").join(""));
            text = text.replaceAll(term.toLocaleLowerCase(), term.toLocaleLowerCase().split(" ").join(""));
            text = text.replaceAll(term.toLocaleUpperCase(), term.toLocaleUpperCase().split(" ").join(""));
        }

        for (var initialism of Object.keys(INITIALISMS)) {
            var term = INITIALISMS[initialism];

            text = text.replaceAll(initialism.toLocaleUpperCase(), term.split(" ").join(""));
            text = text.replaceAll(initialism, term.toLocaleLowerCase().split(" ").join(""));
        }

        return text.replace(/\w+/g, (match) => this.encodeWord(match, train, previousDecodedWord, previousDecodedWord = match));
    }

    getInDecoderLookup(key, alternative = 0) {
        var options = this.decoderLookup[key] ?? {};
        var optionsList = [];

        if (Object.keys(options).length == 0) {
            return null;
        }

        for (var option of Object.keys(options)) {
            optionsList.push({option, count: options[option]});
        }

        return optionsList.sort((a, b) => b.count - a.count).map((item) => item.option)[alternative % optionsList.length];
    }

    decodeWord(word, previousEncodedWord = null, alternative = 0) {
        if (word.length < 3) {
            return word;
        }

        if (word.match(/^\d+$/)) {
            return word;
        }

        return (
            this.#numeronymInitialisms[word] ??
            this.getInDecoderLookup(`${previousEncodedWord} ${word}`, alternative) ??
            this.getInDecoderLookup(word, alternative) ??
            word
        );
    }

    decode(text, alternative = 0) {
        var previousDecodedWord;

        return text.replace(/\w+/g, (match) => previousDecodedWord = this.decodeWord(match, previousDecodedWord, alternative));
    }

    decodeAllAlternatives(text, maxAlternatives = Infinity) {
        var results = [];
        var alternative = 0;

        while (true) {
            var currentResult = this.decode(text, alternative++);

            if (results.includes(currentResult) || alternative == maxAlternatives + 1) {
                return results;
            }

            results.push(currentResult);
        }
    }
}