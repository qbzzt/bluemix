const timeout = seconds => {
	return new Promise((resolve, reject) => {
		setTimeout(() => resolve(), seconds*1000);
	});
};

const main = async params => {
	await timeout(30);
	return {inp: params};
};
