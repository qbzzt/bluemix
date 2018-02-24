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


// Visitors data structure
var visitors = {
	"Bill Hamm": {
		arrived: new Date(Date.now() - 1000*3600*2)
	},
	"Deborah Lapidot": {
		arrived: new Date(Date.now() - 1000*3600),
		history: [
			{
				arrived: new Date(Date.now() - 26*1000*3600),
				left: new Date(Date.now() - 24*1000*3600)
			}
		]
	},
	"Ehud ben-Gera": {
		history: [
			{
				arrived: new Date(Date.now() - (3*24+3)*1000*3600),
				left: new Date(Date.now() - (3*24-1)*1000*3600)
			},
			{
				arrived: new Date(Date.now() - (2*24+2)*1000*3600),
				left: new Date(Date.now() - (2*24-5)*1000*3600)
			}					
		]
	}	
};

// Code to manipulate visitors data structure
var visitorNames = () => {
	return Object.keys(visitors);	
};

var currentVisitorNames = () => {
	return visitorNames().filter((name) => visitors[name].arrived !== undefined);
};


var nonCurrentVisitorNames = () => {
	return visitorNames().filter((name) => visitors[name].arrived === undefined);
};


var currentVisitorList = () => {
	return currentVisitorNames().map((name) => {
		var retVal = {};
		retVal[name] = visitors[name];
		return retVal;
	});
};

var currentVisitors = () => {
	return currentVisitorList().reduce((a, b) => {
		var bKey = Object.keys(b)[0];
			
		a[bKey] = b[bKey];
		
		return a;
	});
};



var getVisitor = (name) => visitors[name];
var setVisitor = (name, values) => visitors[name] = values;


var logOut = (name) => {
	var oldRecord = getVisitor(name);
	
	if (oldRecord.arrived === undefined)
		return `Error, ${name} is not logged in`;
		
	var history = oldRecord.history;
	
	// If this is the first visit
	if (history === undefined) 
		history = [];		
	
	history.unshift({
		arrived: oldRecord.arrived,
		left: new Date(Date.now())
	});
	
	setVisitor(name, {history: history});
	
	return `OK, ${name} is logged out now`;
};



var logIn = (name) => {
	var oldRecord = getVisitor(name);
	var history;
	
	// First time we see this person
	if (oldRecord === undefined)    
		history = [];   // No history
		
	// Already logged in	
	else if (oldRecord.arrived !== undefined) 
		return `Error, ${name} is already logged in`;
		
	// Not logged in, already exists
	else history = oldRecord.history;
		
	setVisitor(name, {
		arrived: new Date(Date.now()),
		history: history
	});	
	
	return `OK, ${name} is logged in now`;	
};




var testFunctions = [
	{path: "visitors", func: () => visitors},
	{path: "visitorNames", func: visitorNames},	
	{path: "currentVisitorNames", func: currentVisitorNames},	
	{path: "nonCurrentVisitorNames", func: nonCurrentVisitorNames},		
	{path: "currentVisitorList", func: currentVisitorList},		
	{path: "currentVisitors", func: currentVisitors},			
	{path: "logIn", func: () => logIn("Deborah Lapidot")},
	{path: "logOut", func: () => logOut("Deborah Lapidot")}	
];



testFunctions.map((item) => 
	app.get(
		`/test/${item.path}`, 
		/* @callback */ function(req, res) {
			res.send(item.func());
		}
	)
);



app.get("/hello", /* @callback */ function(req, res) {
	res.send("Hello, world");
});



// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
