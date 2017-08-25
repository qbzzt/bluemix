// Replace with your value
var cloudantUrl = "https://65e2<<redacted>>86506-bluemix.cloudant.com";

// We don't store passwords in cleartext
var crypto = require("crypto");

// Cryptographic material taken from https://ciphertrick.com/2016/01/18/salt-hash-passwords-using-nodejs-crypto/
var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};


/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};


function saltHashPassword(userpassword) {
    var salt = genRandomString(16); /** Gives us salt of length 16 */
    var passwordData = sha512(userpassword, salt);

    return passwordData.salt + ":" + passwordData.passwordHash;
}






// Table of statuses and their messages
statusResponse = {
  "unapproved": "Your request is waiting, please have some patience",
  "approved": "Good news, we approved your request",
  "rejected": '<b style="color:red">Rejected </b>. We don\'t want your business',
  "submitted": "Your request has just been submitted, it is awaiting approval"
};

reqStatus = function(status, user) {
    return `
        <html>
            <head>
                <title>Registration result</title>
            </head>
            <body>
                <p>Hello, ${user}. ${statusResponse[status]}</p>
            </body>
        </html>
    `;
}


    
var cloudant = require("cloudant")(cloudantUrl);
var mydb = cloudant.db.use("accounts");


function main(params) {    
    return new Promise(function(success, failure) {
        mydb.get(params.uid, function(err, body) {
            
            // No user yet, register the entry
            if (err != null && err.statusCode == 404)  {
                mydb.insert( {
                    _id: params.uid,
                    pwd: saltHashPassword(params.pwd),
                    status: "unapproved"
                },   // Data to insert
                function() {
                    success({html: reqStatus("submitted", params.uid)})    
                });   // mydb.insert
                
                return ;
            }   // No user yet
            
            if (err != null)   // Error, and not the expected one
                failure({html: "Internal error: " + JSON.stringify(err)});
            
            // Return the response 
            success({html: reqStatus(body.status, params.uid)});
        });   // mydb.get
    });   // Promise object
}  // main
