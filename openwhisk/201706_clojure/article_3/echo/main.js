// Get a Clojure environment
var cljs = require('clojurescript-nodejs');


// Evaluate the action code
cljs.evalfile(__dirname + "/action.cljs");


// Fix a hash table so it won't have internal double quotes
var fixHash = function(hash) {
	if (typeof hash === "object") {
		if (hash === null) return null;
		if (hash instanceof Array) {
			for (var i=0; i<hash.length; i++)
				hash[i] = fixHash(hash[i]);
			return hash;
		}
		
		var keys = Object.keys(hash) 
		for (var i=0; i<keys.length; i++)
			hash[keys[i]] = fixHash(hash[keys[i]]);
		return hash;
	}

	if (typeof hash === "string") {
		return hash.replace(/"/g, '\\x22');
	}

	return hash;
		
};



// The main function, the one called when the action is invoked
var main = function(params) {

  var clojure = "(ns action.core)\n ";

  var paramsString = JSON.stringify(fixHash(params));
  console.log("Stringified " + paramsString);
  paramsString = paramsString.replace(/"/g, '\\"');
  console.log("Replaced " + paramsString);

  clojure += '(clj->js (cljsMain (js* "' + paramsString + '")))';

  var retVal = cljs.eval(clojure);
  return retVal;
};

exports.main = main;
