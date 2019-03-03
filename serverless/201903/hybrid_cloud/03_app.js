const express = require("express");
const app = express();

const ow = require("openwhisk");
const owOptsLocal = {
	apihost: "http://192.168.33.16:10001",
	api_key: <<< redacted >>>
};

const owOptsRemote = {
	apihost: "us-south.functions.cloud.ibm.com",
	api_key: <<< redacted >>>
};

const owLocal = ow(owOptsLocal);
const owRemote = ow(owOptsRemote);


var invokeNum = 0;
var localReqs = 0;


const invoke = async (server, name, params) => {
	return await server.actions.invoke({
		name: name,
		blocking: true,
		params: params
	});  
};  // invoke


app.get("/", async (req, res) => {
	const me = invokeNum++;
	const local = localReqs < 10;
	const owServer = local ? owLocal : owRemote;

	if (local) localReqs++;

	console.log(`${new Date} start of ${me} ${local ? "local" : "remote"} ${localReqs}`);

	const owRes = await invoke(owServer, "long", {a: 1, b:2});

	console.log(`${new Date} ${me} result is ${JSON.stringify(owRes)}`);

	if (local) localReqs--;

	res.send(owRes);
});  // app.get




app.listen(3000);
