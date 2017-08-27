// Replace with your value
var cloudantUrl = "https://<<redacted>>-93f1b9986506-bluemix.cloudant.com";

// We don't store passwords in cleartext
var crypto = require("crypto");



/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
var sha512 = function(password, salt) {
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);

    return hash.digest('hex'); 
};

/* Check if the password provided by the user, when added to the stored salt, results in the
 * stored hash. */
var checkPwd = function(provided, stored) {
    console.log("The password I got is " + provided);

    var arr = stored.split(":");   // Stored as <salt>:<hash>
    var res = sha512(provided, arr[0]);

    console.log("Salt:" + arr[0]);
    console.log(res + " =?= " + arr[1])
    
    console.log(res == arr[1]);
    
    return (res == arr[1]);
};


var htmlHeader = `
<html>
    <head>
        <title>Landing Page</title>

	    <!-- Use Bootstrap with the default theme -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap-theme.min.css">
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>            
        
    </head>
    
    <body>
`;


var htmlFooter = `
    </body>
</html>
`;


var html4Unknown = function(uid) {
    return `
        ${htmlHeader}
        <h2>I don't know you ${uid}</h2>
        <a href="self_reg_form">
            Why don't you register yourself?
        </a>
        ${htmlFooter}
    `;
};
  
  

var html4Pretend = function(uid) {
    return `
        ${htmlHeader}
        <h2>You are not really ${uid}</h2>
        <a href="self_reg_form">
            Why don't you get your own account?
        </a>
        ${htmlFooter}
    `;
};
  
  

var html4Approved = function(uid) {
    return `
        ${htmlHeader}
        <h2>Welcome, ${uid}</h2>
        If this had been a real application, it would have started here
        ${htmlFooter}
    `;
};  


var html4Rejected = function(uid) {
    return `
        ${htmlHeader}
        <h2>You are welcome to leave, ${uid}</h2>
        We don't want your business. Go away!
        ${htmlFooter}
    `;
};  


var html4Pending = function(uid) {
    return `
        ${htmlHeader}
        <h2>Welcome, ${uid}</h2>
        You are impatient, wait until your account is approved
        ${htmlFooter}
    `;
};  
  
    
var cloudant = require("cloudant")(cloudantUrl);
var mydb = cloudant.db.use("accounts");


function main(params) {    
    return new Promise(function(success, failure) {
        mydb.get(params.uid, function(err, body) {

            // User not found
            if ((err != null) && (err.statusCode == 404)) {
                success({html: html4Unknown(params.uid)});
                return ;
            }

            console.log("User: " + params.uid +
                "   Password:" + params.pwd + 
                "   Status:" + body.status);

            // Check the password
            if (checkPwd(params.pwd, body.pwd)) {
                console.log("checkPwd(" + params.pwd + "," + body.pwd + ") is true");
                
                switch (body.status) {
                    case "approved":
                        success({html: html4Approved(params.uid)});
                        break ;
                    case "rejected":
                        success({html: html4Rejected(params.uid)});
                        break ;
                    case "unapproved":
                        success({html: html4Pending(params.uid)});
                        break ;
                }  // switch (body.status)
            }
            
            // If we got here, it means that the password didn't match
            success({html: html4Pretend(params.uid)});
        });   // mydb.get
    });   // Promise object
}  // main
