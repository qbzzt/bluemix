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

// Use LDAP
var ldap = require('ldapjs');

// Use UUID
var uuid = require('uuid');

// create a new express servera
var app = express();

// Use body-parser to receive POST form requests
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

// Use cookie-parser to read the session ID cookie
var cookieParser = require("cookie-parser");
app.use(cookieParser());

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();


// Current session information
var sessions = {};

// Function called after the user logs on
var logon = function(sessionData) {
	var sessionID = uuid.v1();
	sessions[sessionID] = sessionData;

	return sessionID;
};


// Process the login form for LDAP
app.post("/login", function(req, res) {

	// Data about this session. 
	var sessionData = {
		
		// Information required to access the LDAP directory:
		// URL, suffix, and admin (or read only) credentials.
		// 
		// In a normal application this would be in the 
		// configuration parameters, but in this application we
		// want people to be able to use their own LDAP server.
		ldap: {
			url: req.body.ldap_url,
			dn: req.body.ldap_dn,
			passwd: req.body.ldap_passwd,
			suffix: req.body.ldap_suffix
		},
		
		// Information related to the current user
		uid: req.body.uid,
		passwd: req.body.passwd,
		dn: "",    // No DN yet
		
		// Authorizations we already calculated - none so far
		authList: {}
	};
	
	// Use the administrative account to find the user with that UID
	var adminClient = ldap.createClient({
		url: sessionData.ldap.url
	});
	
	// Bind as the administrator (or a read-only user), to get the DN for
	// the user attempting to authenticate
	adminClient.bind(sessionData.ldap.dn, sessionData.ldap.passwd, function(err) {

		// If there is an error, tell the user about it. Normally we would 
		// log the incident, but in this application the user is really an LDAP
		// administrator.
		if (err != null)
			res.send("Error: " + err);
		else
			// Search for a user with the correct UID.
			adminClient.search(req.body.ldap_suffix, {
				scope: "sub",
				filter: "(uid=" + sessionData.uid + ")"
			}, function(err, ldapResult) {
				if (err != null)
					throw err;
				else {
					// If we get a result, then there is such a user.
					ldapResult.on('searchEntry', function(entry) {
						sessionData.dn = entry.dn;
						sessionData.name = entry.object.cn;
						
						// When you have the DN, try to bind with it to check the password
						var userClient = ldap.createClient({
							url: sessionData.ldap.url
						});
						userClient.bind(sessionData.dn, sessionData.passwd, function(err) {
							if (err == null) {
								var sessionID = logon(sessionData);
								
								res.setHeader("Set-Cookie", ["sessionID=" + sessionID]);
								res.redirect("main.html");
							} else
								res.send("You are not " + sessionData.uid);
						});
					});
					
					// If we get to the end and there is no DN, it means there is no such user.
					ldapResult.on("end", function() {
						if (sessionData.dn === "")
							res.send("No such user " + sessionData.uid); 
					});
				}

			});
	});
});



// Process the login form for Active Directory
app.post("/adlogin", function(req, res) {
	var url = "ldap://" + req.body.ad;
	var userPrincipalName = req.body.uid + "@" + req.body.domain;
	var passwd = req.body.passwd;

	if (passwd === "") {
		res.send("The empty password trick does not work here.");
		return ;
	}

	// Bind as the user
	var adClient = ldap.createClient({ url: url });
	adClient.bind(userPrincipalName, passwd, function(err) {

		if (err != null) {
			if (err.name === "InvalidCredentialsError")
				res.send("Credential error");
			else
				res.send("Unknown error: " + JSON.stringify(err));
		} else {
			var suffix = "dc=" + req.body.domain.replace(/\./g, ",dc=");
			
			adClient.search(suffix, 
				{
					scope: "sub",
					filter: "(userPrincipalName=" + userPrincipalName + ")"
				}, 
				function(err, ldapResult) {
					if (err != undefined) {
						res.send("LDAP search error: " + err);
						return ;
					}
			
					// When we get a result, that is the user data
					ldapResult.on('searchEntry', function(entry) {
						var groups = entry.object.memberOf;
						
						// We want to handle a string (single value) as an array
						if (typeof groups === "string") 
							groups = [groups];
						
						var html = "";
						html += "<h2>Hello " + entry.object.cn + "</h2>";
						if (groups != undefined) {
							html += "<h4>Groups:</h4><ol>";
							for (var i=0; i<groups.length; i++) 
								html += "<li>" + groups[i]  + "</li>";
							html += "</ol>";
						} else
							html += "No group membership detected.";

						
						res.send(html);
					});
			
			
				}  // End of function called by adClient.search
			);
		}  // End of the if err == null part
	});  // End of the function called by adClient.bind
});




// For debugging, output the sessions object
app.get("/sessions", function(req, res) {
	res.send(JSON.stringify(sessions));	
});



// Get user data. This small file allows most of the post-logon user interface to be static.
app.get("/userData.js", function(req, res) {
	var data = {};
	
	if (sessions[req.cookies.sessionID] != undefined) {
		data.name = sessions[req.cookies.sessionID].name;
		data.uid = sessions[req.cookies.sessionID].uid;
	}
	
	res.send("var userData = " + JSON.stringify(data) + ";");
});



// Restricted pages, and the filters that identify their groups
var restrictedPages = {
	"/men.html": {
		groupFilter: "cn=men"
	},
	"/women.html": {
		groupFilter: "cn=women"
	}
};



var userAuthorized = function(sessionData, req, res) {
	res.sendFile(__dirname + "/restricted" + req.path);
};





var userUnauthorized = function(sessionData, req, res) {
	res.send("You are not authorized.");
};



// Deal with restricted pages, and verify if the user is authorized or not.
var getRestrictedPage = function(req, res) {
	var sessionData = sessions[req.cookies.sessionID];
	var page = restrictedPages[req.path];
	
	// No session
	if (sessionData == undefined) {
		res.send("I don't even know who you are.");
		return ;
	}

	// If we already know the authorization answer, use that
	if (sessionData.authList[req.path] != undefined) {
		if (sessionData.authList[req.path])
			userAuthorized(sessionData, req, res);
		else
			userUnauthorized(sessionData, req, res);
		
		
		return ;
	}
	
	var ldapClient = ldap.createClient({
		url: sessionData.ldap.url
	});
	
	// Bind as the administrator (or a read-only user)
	ldapClient.bind(sessionData.ldap.dn, sessionData.ldap.passwd, function(err) {
		if (err != null) {
			res.send("LDAP bind error:" + err);
		
			return ;
		}

	});

	// This filter will only find the group if the logged on user is a member
	ldapClient.search(sessionData.ldap.suffix, 
		{
			scope: "sub",
			filter: "(&(" + page.groupFilter + ")(member=" + sessionData.dn + " ))"
		}, 
		function(err, ldapResult) {
			if (err != undefined) {
				res.send("LDAP search error: " + err);
				return ;
			}
			
			// If we get a result, then the user is authorized
			ldapResult.on('searchEntry', function() {
				sessionData.authList[req.path] = true;

				userAuthorized(sessionData, req, res);
			});
			
			// If we get to the end and we did not see the user is authorized, then 
			// the user is not authorized.
			ldapResult.on("end", function() {
				if (sessionData.authList[req.path] == undefined) {
					sessionData.authList[req.path] = false;
					
					userUnauthorized(sessionData, req, res);
				}
			});			
			
			
		}  // End of function called by ldapClient.search
	);
};    // End of getRestricted



// Create the handlers for the restricted pages
for(var path in restrictedPages) {
	app.get(path, function(req, res) {
		getRestrictedPage(req, res);
	});
}




// We want sessions to be available for at least an hour, but not forever. The way to do this
// is to check the sessis every 60 minutes. Delete those marked as old. Mark as old the rest.
// This makes sessions live for 60-120 minutes.
//
// If you want to make sure sessions time out after an hour, rather than just that they will
// be there for an hour and won't hang around in memory forever, you can store their start time
// in the session data, compare, and delete when an hour has passed. That would be more accurate,
// but also more complicated and time consuming than this algorithm.
var sessionLifetime = 60;   // In minutes
setInterval(function() {
	
    for(var sessionID in sessions) 
    	if (sessions[sessionID].old) 
    		delete sessions[sessionID];
    	else
    		sessions[sessionID].old = true;
    
}, sessionLifetime * 60 * 1000);

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

