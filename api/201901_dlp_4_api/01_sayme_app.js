/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');


// The web server definitions
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());



// We use HTTPS to connect to the text to speech service
const https = require('https');
const url = require('url');

const textToSpeechConf = {
        iam_apikey: '*** REDACTED ***',
        directUrl: 'https://stream.watsonplatform.net/text-to-speech/api',
        proxyUrl: '',
        audioFormat: "audio/mp3"
};

const text2Speech = (text, useProxy, cb) => {
        var audio = [];

        const reqBody = {text: text};

        var reqOpts = {
                method: "POST",
                headers: {
                        "Content-Type": "application/json",
                        "Accept": textToSpeechConf.audioFormat
                },
                auth: `apikey:${textToSpeechConf.iam_apikey}`
        };   // reqOpts

		const useUrl = useProxy ? textToSpeechConf.proxyUrl : textToSpeechConf.directUrl;

        reqOpts = Object.assign(url.parse(`${useUrl}/v1/synthesize`), reqOpts);
        
        console.log(reqOpts);
        
        const httpsReq = https.request(reqOpts, res => {
                res.on("data", chunk => audio[audio.length] = chunk);
                res.on("end", () => cb(Buffer.concat(audio)));
        }); // https.request
        
        httpsReq.on("error", err => console.log(`Text 2 Speech API error: ${err}`));
        httpsReq.write(JSON.stringify(reqBody));
        httpsReq.end();                        
};    // text2Speech

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));


app.post('/voice.mp3', (req, res) => {
        res.setHeader("Content-Tyoe", "audio/mpeg");
        text2Speech(req.body.text, req.body.server === "proxy", audioBuf => res.send(audioBuf));
}); // app.post /voice.mp3



// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
