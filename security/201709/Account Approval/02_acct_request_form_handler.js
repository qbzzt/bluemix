var cloudantUrl = "<<redacted>> 6506-bluemix.cloudant.com";


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




function main(params) {
    
    var cloudant = require("cloudant")(cloudantUrl);
    var mydb = cloudant.db.use("accounts");
    
    return new Promise(function(success, failure) {
        mydb.get(params.uid, function(err, body) {
            
            // No user yet, register the entry
            if (err != null && err.statusCode == 404)  {
                mydb.insert( {
                    _id: params.uid,
                    pwd: params.pwd,
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
