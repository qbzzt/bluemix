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


const invoke = async (server, name, params) => {
	return await server.actions.invoke({
		name: name,
		blocking: true,
		params: params
	});  
};  // invoke


app.get("/", async (req, res) => {
	const me = invokeNum++;
  
	console.log(`${new Date} start of ${me}`);

	const owRes = await invoke( me%2 ? owLocal : owRemote, "long", {a: 1, b:2});

	console.log(`${new Date} ${me} result is ${JSON.stringify(owRes)}`);

	res.send(owRes);
});  // app.get




app.listen(3000);
