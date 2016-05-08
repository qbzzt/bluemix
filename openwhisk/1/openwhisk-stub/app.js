/*eslint-env node*/

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

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// Connect to OpenWhisk
var openwhisk = require('openwhisk');
var ow = openwhisk({
	api: 'https://openwhisk.ng.bluemix.net/api/v1/', 
	api_key: 'a9e334ac-1f8c-4a42-b4ea-f7774ade86da:TSmEXHJ25SZGmOgL9GUmFdDEZRHH1s3XbPzZv1ZauYa6i7kO9Xj85MUkgFxdqowm', 
	namespace: 'developerWorks_Ori-Pomerantz-apps'});


app.get("/invoke/:action", function(req, res) {
	ow.actions.invoke({
		blocking: true,
		actionName: req.params.action,
		params: req.query
	}).then(function(param) {
		// Return the result of the OpenWhisk call
		res.send(JSON.stringify(param.response.result));
	}).catch(function(err) {res.send("Error: " + JSON.stringify(err));});
});

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
