/*eslint-env node, querystring, express*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
const express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
const cfenv = require('cfenv');

// create a new express server
const app = express();


// We need to send HTTPS requests
const https = require("https");

// Express parses the query string for us automatically. Unfortunately, we don't need it
// parsed. If it exists, we need to relay it to the final destination.
const qs = require("querystring");

// If the back end application uses POST or PUT, we need to read the data.
// Note that body-parser does not handle multi-part bodies, so if the
// proxied application uses them, you need a different solution
const bodyParser = require("body-parser");


// The host for which we are a proxy
const host = "stream.watsonplatform.net";

// get the app environment from Cloud Foundry
const appEnv = cfenv.getAppEnv();


// log file for requests
var log = [];

// If this is a POST request, read the body.
// bodyParser.text() normally doesn't deal with all mime types - the type parameter
// forces that behavior
app.post("*", bodyParser.text({type: "*/*"}));
app.put("*", bodyParser.text({type: "*/*"}));


// Show and delete the log
app.get("/log", (req, res) => {
	res.send(log.reduce((a, b) => `${a}<br/>${b}`));
	
	log = [];
});


app.all("*", (req, res) => {
	var headers = req.headers;
	headers["host"] = host;
	
	// Deal with the query is there is one. Don't add any
	// characters if there isn't.
	var query = "";
	if (req.query) 
		query = "?" + qs.stringify(req.query);
	
	// The options that go in the HTTP header
	var proxiedReqOpts = {
	      host: host,
	      path: req.path + query,
	      method: req.method,
	      headers: headers
	};
	
	var retVal = [];
	
	const proxiedReq = https.request(proxiedReqOpts, proxiedRes => {
		proxiedRes.on("data", chunk => retVal.push(chunk));
		proxiedRes.on("end", () => res.send(Buffer.concat(retVal)));
		proxiedRes.on("error", err => res.send(JSON.stringify(err) + "<hr />" + retVal));
	});

	// POST requests have a body
	if ((req.method === "POST") || (req.method === "PUT"))
		proxiedReq.write(req.body);		

	proxiedReq.end();	
	
	if (log.length > 1000)
		log = [];
		
	log.push(`${new Date()}: ${req.method} to ${req.url}`);
});




// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', () => console.log("server starting on " + appEnv.url));
