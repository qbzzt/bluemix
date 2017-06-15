// Get a Clojure environment
var cljs = require('clojurescript-nodejs');


// Evaluate the action code
cljs.evalfile(__dirname + "/action.cljs");


// The main function, the one called when the action is invoked
var main = function(params) {

  var clojure = "(ns action.core)\n ";

  var paramsString = JSON.stringify(params);
  paramsString = paramsString.replace(/"/g, '\\"');

  clojure += '(clj->js (cljsMain (js* "' + paramsString + '")))';

  var retVal = cljs.eval(clojure);
  return retVal;
};

exports.main = main;
