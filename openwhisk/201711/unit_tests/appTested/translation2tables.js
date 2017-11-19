/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
function main(params) {
    // Deal with the translation only if there is one
    var translation;
    
    // To understand this code, see 
    // https://danmartensen.svbtle.com/javascripts-map-reduce-and-filter
    
	
	if (params.translation) {
	    var languages = Object.keys(params.translation);
	    var transTableLines = languages.map((lang) =>
	        `<tr><th>${lang}</th><td>${params.translation[lang]}</td></tr>`);
	    
	    translation = '<table class="table">' +
	        transTableLines.reduce((a,b) => a+b) +
	        '</table>'
	}
	
	var englishWords = params.englishWords.map((word) =>
	    `
	        <a href="translate?word=${word}">
	            <button type="button" class="btn btn-primary">${word}</button>
	        </a>
	        <a href="translate?word=${word}&error=true">
	            <button type="button" class="btn btn-danger">${word}</button>
	        </a>
	    `
	).reduce((a, b) => a + "<br/>" + b)
	
	return {
	    "translation": translation,
	    "englishWords": englishWords
	};
}
