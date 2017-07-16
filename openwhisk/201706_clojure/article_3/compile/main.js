// Get a Clojure environment
var clojureEnv = require('clojurescript-nodejs');

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

  var clojure = "(ns action.injs (:require [action.core]))\n";

  var paramsString = JSON.stringify(fixHash(params));
  paramsString = paramsString.replace(/"/g, '\\"');

	console.log("JSON:" + JSON.stringify(clojureEnv));

  clojure += '(clj->js (action.core/cljsMain (js* "' + paramsString + '")))';

  var retVal = clojureEnv.eval(clojure, [__dirname], true);

  return retVal;
};

exports.main = main;
