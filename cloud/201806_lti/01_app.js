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

var uuid = require("uuid4");
var lti = require("ims-lti");


// create a new express server
var app = express();


var sessions = {};

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

app.post("*", require("body-parser").urlencoded({extended: true}));

app.post("/module_1", (req, res) => {
	var moodleData = new lti.Provider("secret", "secret");

	moodleData.valid_request(req, (err, isValid) => {
		if (!isValid) {
			res.send("Invalid request: " + err);
			return ;
		}

		var sessionID = uuid();
		sessions[sessionID] = moodleData;
		
		res.send(moodleData.body);
	});   // moodleDate.valid_request
});       // app.post("/module");


// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
