/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// Parse the application/json requests we get from the client
var bodyParser = require('body-parser');


// LDAP library, documented at http://ldapjs.org/client.html
var ldap = require('ldapjs');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));


// parse application/json
app.use(bodyParser.json());

app.post("/ldap", (req, res) => {
	var result = "";    // To send back to the client
	
	var client = ldap.createClient({
  		url: req.body.serverUrl
	});
	
	client.bind(req.body.readerDN, req.body.readerPwd, function(err) {
		if (err) {
			result += "Reader bind failed " + err;
			res.send(result);
			return;
		}
		
		result += "Reader bind succeeded\n";
		
		var filter = `(uid=${req.body.username})`;
		
		result += `LDAP filter: ${filter}\n`;
		
		client.search(req.body.suffix, {filter:filter, scope:"sub"},
			(err, searchRes) => {
				var searchList = [];
				
				if (err) {
					result += "Search failed " + err;
					res.send(result);
					return;
				}
				
				searchRes.on("searchEntry", (entry) => {
					result += "Found entry: " + entry + "\n";
					searchList.push(entry);
				});

				searchRes.on("error", (err) => {
					result += "Search failed with " + err;
					res.send(result);
				});
				
				searchRes.on("end", (retVal) => {
					result += "Search results length: " + searchList.length + "\n";
					for(var i=0; i<searchList.length; i++) 
						result += "DN:" + searchList[i].objectName + "\n";
					result += "Search retval:" + retVal + "\n";					
					
					if (searchList.length === 1) {
						client.bind(searchList[0].objectName, req.body.password, function(err) {
							if (err) 
								result += "Bind with real credential error: " + err;
							else
								result += "Bind with real credential is a success";
								
							res.send(result);	
						});  // client.bind (real credential)
						
						
					} else { // if (searchList.length === 1)
						result += "No unique user to bind";
						res.send(result);
					}

				});   // searchRes.on("end",...)
				
		});   // client.search
		
	}); // client.bind  (reader account)
	
}); // app.post





app.post("/ad", (req, res) => {
	var client = ldap.createClient({
  		url: req.body.serverUrl
	});
	
	client.bind(req.body.username + '@' + req.body.domain, req.body.password, function(err) {
		if (err) {
			res.send("Bind failed " + err);
			return;
		}
		
		res.send("Log on successful");		

	}); // client.bind
	
}); // app.post



// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
