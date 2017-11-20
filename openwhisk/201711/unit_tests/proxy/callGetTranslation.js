var openwhisk = require('openwhisk');
var ow = openwhisk({
    apihost: 'openwhisk.ng.bluemix.net', 
    api_key: '<<<redacted>>>'
});
 
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
            success(resVal.response.result);
        });
  });
}
