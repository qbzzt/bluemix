var openwhisk = require('openwhisk');
var ow = openwhisk({
    apihost: 'openwhisk.ng.bluemix.net', 
    api_key: '<<<redacted>>>'
});


var cloudantCred = {
  "username": "<<<redacted>>>",
  "password": "<<<redacted>>>",
  "host": "4d1cded5-56a3-4ad9-a59a-9c68c192995c-bluemix.cloudant.com",
  "port": 443,
  "url": "<<<redacted>>>"
};


var cloudant = require("cloudant")(cloudantCred.url);
var mydb = cloudant.db.use("expected");



 
function main(params) {
    return new Promise((success, failure) => {
        var invocation = ow.actions.invoke({
            name: '/developerWorks_Ori-Pomerantz-apps/unit-tests/getTranslation',
            blocking: true,
            params: params
        });
        
        invocation.then((resVal) => {
            var logMe = {
                input: params,
                output: resVal.response.result
            };
            console.log(logMe);
            
            var dbKey = JSON.stringify(params);
            
            // Did we already see this input?
            mydb.get(dbKey, (err, body) => {

                // No, write it.
                if (err != null && err.statusCode == 404)     {
                    mydb.insert(
                        {"_id": JSON.stringify(params), data: logMe}, 
                        () => {
                            success(resVal.response.result);
                        });   // end of mydb.insert call
                }  // End of "this value has not been found"
                else {  // Assume value has been found, for the sake of simplicity
                
                    // We found this before, but the output was different then
                    if (JSON.stringify(body.data) !== JSON.stringify(logMe)) {
                        console.log("This action isn't a pure function.");
                        console.log("For input:" + JSON.stringify(params));
                        console.log("Old output:" + JSON.stringify(body.data.output));
                        console.log("New output:" + JSON.stringify(logMe.output));
                    }

                    // Regardless, return the value.
                    success(resVal.response.result);
                }  // End of "this value has been found, not new"
            }); // end of mydb.get call
        });    // end of invocation.then 
  });    // end of Promise constructor
}  // end of main
