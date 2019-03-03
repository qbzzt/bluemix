const express = require("express");
const app = express();

const ow = require("openwhisk");
const owOptsLocal = {
	apihost: "http://192.168.33.16:10001",
	api_key: '<redacted>'
};
const owLocal = ow(owOptsLocal);


var invokeNum = 0;


app.get("/", async (req, res) => {
	const me = invokeNum++;
  
	console.log(`${new Date} start of ${me}`);
  
	const owRes = await owLocal.actions.invoke({
		name: "long",
		blocking: true
	}); // await owLocal.actions.invoke

	console.log(`${new Date} ${me} result is ${JSON.stringify(owRes)}`);

	res.send(owRes);
});  // app.get




app.listen(3000);
