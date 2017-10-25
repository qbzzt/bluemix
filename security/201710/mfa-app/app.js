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

// Necessary to know the IP of the browser
app.set("trust proxy", true);   

// Use body-parser to receive POST form requests and JSON
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

// Use uuid to generate random strings.
var uuid = require("node-uuid");

// The library to issue HTTP requests
var http = require("http");

// Use cookie-parser to read the cookies
var cookieParser = require("cookie-parser");
app.use(cookieParser());


// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();


// Use SendGrid to send e-mails as a second token.
var sendgrid = require("sendgrid")("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");
 



// The users list (in real life, this would be a MongoDB database - but this
// program is just a demonstration).
var users = {};

// Give me an account so I won't have to create one each time I need to debug
// something
users["qbzzt1@gmail.com"] = {
	password: "qweqwe",
	status: "confirmed"
};


// The pending account requests, indexed by random string. Should also 
// be a database
var pendingReqs = {};


app.all('/*', function(req, res, next) {	
	// If the forwarded protocol isn't HTTPS, send a redirection
	if (req.headers["x-forwarded-proto"] !== "https")
		res.redirect("https://" + req.headers.host + req.path);
	else
		next();
});

		


// Serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));



// Register a pending request for this e-mail
var putRequest = function(email) {
   // Get the random identifier for this request
   var id = uuid.v4();

   pendingReqs[id] = {
   	email: email,
   	time: new Date()
   };
   
   return id;
};



var sendAcctConfRequest = function(email, id) {
  
  // Send an e-mail
  var msg = new sendgrid.Email();

  msg.addTo(email);
  msg.setFrom("notMonitored@nowhere.at.all");
  msg.setSubject("Address confirmation");
  msg.setHtml("<H2>Welcome to the application</H2>" + 
  	'<a href="' + appEnv.url + '/confirm/' + id + '">' +
  	'Click here to confirm your request</a>.');
  	
  sendgrid.send(msg);

};


// Send a link. Standard practice is to send a code, but using a link
// is easier and more secure.
var sendLoginRequest = function(email, id) {
  
  // Send an e-mail
  var msg = new sendgrid.Email();

  msg.addTo(email);
  msg.setFrom("notMonitored@nowhere.at.all");
  msg.setSubject("Application log in");
  msg.setHtml("<H2>Welcome to the application</H2>" + 
  	'<a href="' + appEnv.url + '/confirm/' + id + '">' +
  	'Click here to log in</a>.');
  	
  sendgrid.send(msg);

};



// An attempt to register
app.post("/register", function(req, res) {
	
  // Put the request in the users' list
  users[req.body.email] = {
  	password: req.body.passwd1,
  	status: "pending"
  };
  
  // Create request to confirm the account
  var id = putRequest(req.body.email);
  
  // E-mail the account confirmation request
  sendAcctConfRequest(req.body.email, id);
  
  res.send("Thank you for your request. You will receive an e-mail with a link to confirm your address is " + 
    req.body.email + " shortly.");	
});




// An attempt to log on
app.post("/login", function(req, res) {
  var user = users[req.body.email];
  
  if (!user) {
  	res.send("Bad user name or password.");
  	return ;
  }
  
  if (user.password !== req.body.passwd) {
  	// Same response, not to disclose user identities
  	res.send("Bad user name or password.");
  	return ;  	
  }
  
  // User exists, but e-mail not confirmed yet
  if (user.status === "pending") {
  	res.send("Account not confirmed yet.");
  	return ;
  }
  
  // Create request to confirm the logon
  var id = putRequest(req.body.email);
  
  
  // For preventing somebody who gets the e-mail from logging on:
  var id2 = uuid.v4();    // 1  
  pendingReqs[id].cookie = id2;   // 2
  res.setHeader("Set-Cookie", ['secValue=' + id2]);  // 3
  
  
  // E-mail the account confirmation request
  sendLoginRequest(req.body.email, id);
  
  res.send("Thank you for your request. Please click the link you will receive by e-mail to " + 
    req.body.email + " shortly.");	
});



// Interpret an IP address and then call the next function with the
// data
var interpretIP = function(ip, next) {
	http.get("http://ipinfo.io/" + ip,
		function(res) {
			// This function is called as soon as we get the
			// HTTP headers. But the data we need is provided
			// in the HTTP body, the "HTML" file
			
			// This code assumes the response comes in one chunk. 
			// That's the most likely case here, because the chunk
			// is so short. For longer requests, it would be a good
			// idea to add the data together until getting the end 
			// event.
			res.on('data', function(body) {
				var data = JSON.parse(body);
				next(data);
			});
		}
	);

};




// Decide the risk level
app.post("/risk", function(req, res) {
	interpretIP(req.body.ip, function(ipData) {
		var country = ipData.country;		
		var time = req.body.time;
		var resHtml = "";
		var safe = false;
		
		resHtml += "<html><head>";
		resHtml += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">';
   		resHtml += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap-theme.min.css">';
   		resHtml += '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>';
   		resHtml += "</head><body>";
		
		resHtml += "<H2>Risk Level:</H2>";
		resHtml += "Country: " + country + "<br />";
		resHtml += "Time classification: " + time + "<br />";
		
		// Only expect log on during work hours from the US
		if (country === "US" && time === "day") 
			safe = true;
			
		// Log ons from China are expected at any time except weekends
		if (country === "CN" && time !== "weekend") 
			safe = true;		
		
		if (safe)
			resHtml += '<span class="label label-pill label-success">User name and password</span>';
		else
			resHtml += '<span class="label label-pill label-danger">Two factor authentication</span>';
		
		resHtml += "</body></html>";
		
		res.send(resHtml);
	});	
});


// A confirmation (of an attempt to register or log on)
app.get("/confirm/:id", function(req, res) {
	var userRequest = pendingReqs[req.params.id];
	delete pendingReqs[req.params.id];

    // Meaning there is no user request that matches the ID.
    if (!userRequest) {
    	res.send("Request never existed or has already timed out.");
    	return ;   // Nothing to return, but this exits the function    	
    }
    
	var userData = users[userRequest.email];    

    
    if (userData.status === "pending") {
    	userData.status = "confirmed";
		res.send("Thank you " + userRequest.email + " for confirming your account.");    	
		return ;
    }
    
    // For preventing somebody who gets the e-mail from logging on:
	if (req.cookies["secValue"] !== userRequest.cookie) {
		res.send("Wrong browser");
		return ;
	}
	
    

	// In a real application, this is where we'd set up the session and redirect
	// the browser to the application's start page.
	res.send("Welcome " + userRequest.email);
});


// Interpret an IP address and then call the next function with the
// data
var interpretIP = function(ip, next) {
	http.get("http://ipinfo.io/" + ip,
		function(res) {
			// This function is called as soon as we get the
			// HTTP headers. But the data we need is provided
			// in the HTTP body, the "HTML" file
			
			// This code assumes the response comes in one chunk. 
			// That's the most likely case here, because the chunk
			// is so short. For longer requests, it would be a good
			// idea to add the data together until getting the end 
			// event.
			res.on('data', function(body) {
				var data = JSON.parse(body);
				next(data);
			});
		}
	);

};






// Show the user's IP address
app.get("/ip.html", function(req, res) {
	interpretIP(req.ip, function(ipData) {
		var resHtml = "";
		resHtml += "<html><head><title>IP interpretation</title></head>";
		resHtml += "<body><H2>Intepretation of " + req.ip + "</H2>";
		resHtml += "<table><tr><th>Field</th><th>Data</th></tr>";
		for (var attr in ipData) {
			resHtml += "<tr><td>" + attr + "</td><td>" + ipData[attr] + "</td></tr>";
		}
		resHtml += "</table></body></html>";
		res.send(resHtml);
	});
});



// Classify time as "day", "after hours", or "weekend". The time zone
// is the difference in hours between your time and GMT.
var classifyTime = function(timeZone) {
	var now = new Date();
	
	// Hour of the week, zero at a minute after midnight, on Sunday
	var hour = now.getDay()*24 + now.getHours() + timeZone;

	// If the hour is out of bounds because of the time zone, return it
	// to the 0 - (7*24-1) range.
	if (hour < 0)
		hour += 7*24;
	
	if (hour >= 7*24)
		hour -= 7*24;
		
	// The weekend lasts until 8am on Monday (day 1) and starts at 5pm on
	// Friday (day 5)
	if (hour < 24+8 || hour >= 5*24+17)
		return "weekend";
		
	// Work hours are 8am to 5pm
	if (hour % 24 >= 8 && hour % 24 < 17)
		return "day";
	
	// If we get here, it is after hours during the work week
	return "after hours";
};



// Show the current time and day of the week
app.get("/now.html", /* @callback */ function(req, res) {
	var now = new Date();
	
	var resHtml = "";
	resHtml += "<html><head><title>Present Time</title></head>";
	resHtml += "<body><H2>Present Time</H2>";
	resHtml += "Day of the week (UTC): " + now.getDay() + "<br />";
	resHtml += "Hour (UTC): " + now.getHours() + "<br />";
	resHtml += "Time classification CST:" + classifyTime(-6) + "<br />";
	resHtml += "</body></html>";
	
	res.send(resHtml);
});


// Delete old pending requests
var maxAge = 5*60*1000; // Delete requests older than five minutes

// Run this function every maxAge
setInterval(function() {
	var now = new Date();
	for (var id in pendingReqs) {   // For every pending request
		if (now - pendingReqs[id].time > maxAge)   // If it is old
			delete pendingReqs[id];   // Delete it
	}
}, maxAge);







// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
