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

var fs = require('fs');
var mod2File = fs.readFileSync("mod2.html", "utf8");
var mod3File = fs.readFileSync("mod3.html", "utf8");


// create a new express server
var app = express();

// Necessary because IBM Cloud apps run behind a proxy
app.enable('trust proxy');


var sessions = {};

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

app.post("*", require("body-parser").urlencoded({extended: true}));


app.post("/module_1", (req, res) => {
	
	var moodleData = new lti.Provider("top", "secret");
	moodleData.valid_request(req, (err, isValid) => {
		if (!isValid) {
			res.send("Invalid request: " + err);
			return ;
		}
		
		var sessionID = uuid();
		sessions[sessionID] = moodleData;
		
		res.send(moodleData.body);
	});   // moodleDate.valid_request
	
});       // app.post("/module_1");



app.post("/module_2", (req, res) => {	
	var moodleData = new lti.Provider("top", "secret");
	moodleData.valid_request(req, (err, isValid) => {
		if (!isValid) {
			res.send("Invalid request: " + err);
			return ;
		}
		
		var sessionID = uuid();
		sessions[sessionID] = moodleData;
	
		var sendMe = mod2File.toString().replace("//PARAMS**GO**HERE",
				`
					var params = {
						sessionID: "${sessionID}",
						user: "${moodleData.body.ext_user_username}"
					};
				`);

		res.setHeader("Content-Type", "text/html");
		res.send(sendMe);
	});   // moodleDate.valid_request
	
});       // app.post("/module_2");



app.post("/module_3", (req, res) => {	
	var moodleData = new lti.Provider("top", "secret");
	moodleData.valid_request(req, (err, isValid) => {
		if (!isValid) {
			res.send("Invalid request: " + err);
			return ;
		}
		
		var sessionID = uuid();
		sessions[sessionID] = moodleData;
	
		var sendMe = mod3File.toString().replace("//PARAMS**GO**HERE",
				`
					var params = {
						sessionID: "${sessionID}",
						user: "${moodleData.body.ext_user_username}"
					};
				`);

		res.setHeader("Content-Type", "text/html");
		res.send(sendMe);
	});   // moodleDate.valid_request
	
});       // app.post("/module_3");





app.get("/grade/:sessionID/:grade", (req, res) => {
	const session = sessions[req.params.sessionID];
	var grade = req.params.grade;
	var resp;
	
	if (grade < 60) {
		resp = `${grade} is too low. How about sixty instead?`;
		grade = 60;
	} else if (grade > 90) {
		resp = `${grade} is too high. How about ninety instead?`;
		grade = 90;		
 	} else {
 		resp = `${grade} sounds reasonable, sure.`;
 	}
	
	session.outcome_service.send_replace_result(grade/100, (err, isValid) => {
		if (!isValid)
			resp += `<br/>Update failed ${err}`;

		res.send(resp);
	});

});    // app.get("/grade...")


// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
