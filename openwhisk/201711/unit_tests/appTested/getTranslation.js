var dict = {
    "hello": {"Spanish": "hola"},
    "goodbye": {"Spanish": "adios", "Hebrew": "להתראות"},
    "computer": {"Spanish": "computadora", "Japanese": "コンピューター"}, 
    "house": {"Spanish": "casa", "Japanese": "家"},
    "function": {"Japanese": "関数", "Hebrew": "פוּנקצִיָה"},
    "pure": {"Spanish": "puro"}
};
 
function main(params) {
    var engWords = Object.keys(dict);
    
    // If asked for an error, generate one
    // 30% of the time
    if(params.error && Math.random() < 0.3) 
        return {err: "I'm confused"};
    
    return {
        // We don't care if we don't have a word to translate, or we have
        // one that isn't in the dictionary.
        "translation": dict[params["word"]],
        "englishWords": engWords
    };
}
