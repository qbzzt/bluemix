// Replace with your value
var cloudantUrl = "https://<<redacted>>f1b9986506-bluemix.cloudant.com";


// We need to escape parameters
var qs = require("querystring");

// Keys to make sure only the authorized user does changes
var crypto = require("crypto");

// Cryptographic material taken from https://ciphertrick.com/2016/01/18/salt-hash-passwords-using-nodejs-crypto/
var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};


var oldKey, newKey = genRandomString(15);



var cloudant = require("cloudant")(cloudantUrl);
var mydb = cloudant.db.use("accounts");


var modifyStatus = function(uid, newStatus, callback) {
    mydb.get(uid, function(err, body) {
        body.status = newStatus;

        mydb.insert(body, function(err, data) {
            callback();
        });   // mydb.insert
    });   // mydb.get
};


function main(params) {
    oldKey = newKey;
    newKey = genRandomString(15);
    
    var responseFunc = function(success, failure) {
        mydb.find({
            "selector": {
                "status": "unapproved"
            }
        },
        function(err, data) {
            var userList = data.docs.map(function(item) {return item["_id"]});
            var rowsList = userList.map(function(user) {
               return `
                    <tr>
                        <td>${user}</td>
                        <td>
                            <a href="admin_approval_form?key=${newKey}&action=approve&uid=${qs.escape(user)}">
                                <button class="btn btn-success">Approve</button>
                            </a>
                        </td>
                        <td>
                            <a href="admin_approval_form?key=${newKey}&action=reject&uid=${qs.escape(user)}">
                                <button class="btn btn-danger">Deny</button>
                            </a>
                        </td>
	               </tr> `
            });
    
            var rows;
            
            // No data is a special case
            if (rowsList.length > 0) 
                rows = rowsList.reduce(function(a, b) {return a+b;});
            else
                rows = '<tr><th colspan="3">No users to approve</th></tr>';
            
	        var html = `<html>
	            <head>
	                <title>Administrator's Approval Form</title>

        	        <!-- Use Bootstrap with the default theme -->
                    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
                    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap-theme.min.css">
                    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>    
	    
	            </head>
	            <body>
	                <div class="well">
	                    <table class="table">
	                        <tr>
	                            <th>User Name</th>
	                            <td colspan="2"></td>
	                        </tr>
	                        ${rows}
	                    </table>
	                </div>
	            </body>
	        </html> `;            
            
            success({html: html});
        });   // mydb.find

    };   // responseFunc
    
    // If we are not authenticated, then there is no action to take
    if (params.key != oldKey)
        return new Promise(responseFunc);
        
    if (params.action == "approve")
        return new Promise(function(success, failure) {
            modifyStatus(params.uid, "approved", function() {
                responseFunc(success, failure);
            });   // modify status
        });   // return new Promise
        

    if (params.action == "reject") 
        return new Promise(function(success, failure) {
            modifyStatus(params.uid, "rejected", function() {
                responseFunc(success, failure);
            });   // modify status
        });   // return new Promise    
    
}  // main


