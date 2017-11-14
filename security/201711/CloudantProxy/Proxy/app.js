/*eslint-env node, querystring, express*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();


// We need to send HTTP requests
var http = require("http");

// Express parses the query string for us automatically. Unfortunately, we don't need it
// parsed. If it exists, we need to relay it to the final destination.
var qs = require("querystring");

// If the back end application uses POST, we need to read the data.
// Note that body-parser does not handle multi-part bodies, so if the
// proxied application uses them, you need a different solution
var bodyParser = require("body-parser");


var cloudantCred = {
  "username": "9404eef2-93fc-4b60-bdf6-be81a3d988aa-bluemix",
  "password": "d62d424cce0a6dd2f2a0218d3a6fbf85b21876538c75e36a29902a71555d8594",
  "host": "9404eef2-93fc-4b60-bdf6-be81a3d988aa-bluemix.cloudant.com",
  "port": 443,
  "url": "https://9404eef2-93fc-4b60-bdf6-be81a3d988aa-bluemix:d62d424cce0a6dd2f2a0218d3a6fbf85b21876538c75e36a29902a71555d8594@9404eef2-93fc-4b60-bdf6-be81a3d988aa-bluemix.cloudant.com"
};



// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();



var log = "";
app.get("/log", /* @callback */ function(req, res) {
	res.send(log);	
});

// If this is a POST or PUT request, read the body.
// bodyParser.text() normally doesn't deal with all mime types - the type parameter
// forces that behavior
app.post("*", bodyParser.text({type: "*/*"}));
app.put("*", bodyParser.text({type: "*/*"}));



var knownBalance = {};

// The authorization logic
app.all("*", /* @callback */ function(req, res, next) {
	log += "<hr />";
	
	var user, password;

	if (req.headers.authorized !== null) {
		var origAuth = new Buffer(req.headers.authorization.replace("Basic ", ""), 'base64').toString('ascii');  	
		var arr = origAuth.split(":");
		user = arr[0];
		password = arr[1];
	}

	
	/*
	// Replace with more complicated password checking code
	if (password !== "password") {
		res.status(401).send('Bad password');
		return ; // No need to continue this function
	}
	*/
	
	log += "<h2>User: " + user + "</h2>";
	log += req.method + " " + req.path;
	if (req.body !== undefined)
		log += "<h4>Body:</h4>" + req.body;
	
	var id, balance;
	
	switch (req.method) {
		case "GET":
			id = req.path.replace(/\/.+\//, "");
			break;
		case "POST":	
			var reqBody = JSON.parse(req.body);
			id = reqBody._id;
			balance = reqBody.balance;
			break;
	}
	
	// The only case where we deny authorization
	if ((id === user) && (balance > knownBalance[id])) {
		res.status(401).send('Unauthorized');
		return ; // No need to continue this function
	}
	
	log += req.rawHeaders;
		
//	log += "<br/>ID: " + id;
//	if (balance !== undefined) 
//		log += " who has/should have " + balance;
	
	next();
});


// The actual proxy
app.all("*", function(req, res) {
	var headers = req.headers;
	headers["host"] = cloudantCred.host;	
	headers["authorization"] = null;
		
	// Deal with the query is there is one. Don't add any
	// characters if there isn't.
	var query = "";
	if (req.query.length > 0) 
		query = "?" + qs.stringify(req.query);
	
	// The options that go in the HTTP header
	var proxiedReqOpts = {
	      host: cloudantCred.host,
	      path: req.path + query,
	      method: req.method,
	      headers: headers,
	      auth: {
	      	type: "basic",
	      	username: cloudantCred.username,
	      	password: cloudantCred.password,	      	
	      }
	};
	
	var retVal = "";
	
	var proxiedReq = http.request(proxiedReqOpts, function(proxiedRes) {		
		proxiedRes.on("data", function(chunk) {retVal += chunk;});
		proxiedRes.on("end", function() {
			var acctInfo = JSON.parse(retVal);
			
			// If we know about a user, update their balance
			if (acctInfo._id !== undefined) {
				knownBalance[acctInfo._id] = acctInfo.balance;
			}
			
			res.send(retVal);
		});
		proxiedRes.on("error", function(err) {res.send(JSON.stringify(err) + "<hr />" + retVal);});
	});

		
	// POST and PUT requests have a body
	if (req.method === "POST" || req.method === "PUT")
		proxiedReq.write(req.body);		


	proxiedReq.end();	
});



// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
   console.log("server starting on " + appEnv.url);
});
