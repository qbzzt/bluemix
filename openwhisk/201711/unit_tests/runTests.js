var openwhisk = require('openwhisk');
var ow = openwhisk({
    apihost: 'openwhisk.ng.bluemix.net', 
    api_key: '<<<redact>>>'
});


var cloudantCred = {
  "username": "<<<redact>>>",
  "password": "<<<redact>>>",
  "host": "4d1cded5-56a3-4ad9-a59a-9c68c192995c-bluemix.cloudant.com",
  "port": 443,
  "url": "<<<redact>>>"
};


var cloudant = require("cloudant")(cloudantCred.url);
var mydb = cloudant.db.use("expected");


var async = require('async');


function main(params) {
    return new Promise((success, failure) => {
        mydb.list({include_docs: true}, (err, body) => {
            
            var match = 0, noMatch = 0;
            var problems = [];
            
            async.map(body.rows, 
                (obj, callback) => {
                    // get the input and expected output
                    var input = obj.doc.data.input;
                    var expectedOutput = obj.doc.data.output;
                    
                    var invocation = ow.actions.invoke({
                        name: '/developerWorks_Ori-Pomerantz-apps/unit-tests/getTranslation',
                        blocking: true,
                        params: input
                    });

                    invocation.then((resVal) => {
                        var realOutput = resVal.response.result;
                        
                        // If the output is as expected, good. If not, report it.
                        if (JSON.stringify(realOutput) === JSON.stringify(expectedOutput)) {
                            match ++;
                        } else {
                            noMatch ++;
                            problems[problems.length] = input;
                        }  
                        callback();
                    });
                }, // end of the iteratable, which is called for every item
                (err, results) => {
                    success({
                        match: match,
                        noMatch: noMatch,
                        problems: problems
                    });
                }  // end of the post map callback
            );  // end of async.map
        });    // end of mydb.list
    });
}
