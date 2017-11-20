var openwhisk = require('openwhisk');
var ow = openwhisk({
    apihost: 'openwhisk.ng.bluemix.net', 
    api_key: '<<<redacted>>>'
});
 
function main(params) {
    return new Promise((success, failure) => {
        ow.actions.invoke({
            // Replace with your own URL
            name: '/developerWorks_Ori-Pomerantz-apps/unit-tests/getTranslation',
            blocking: true,
            params: params
        }).then((resVal) => success(resVal.response.result));
  });
}
