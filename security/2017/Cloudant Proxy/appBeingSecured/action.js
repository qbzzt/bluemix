/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
  
var cloudantCred = {
<<<redacted>>>
};


var proxyHostname = "cloudantproxy.mybluemix.net";
 
 
 
var cloudant = require("cloudant")(cloudantCred.url);
var mydb = cloudant.db.use("accounts"); 
  
var returnHtml = (callback) => {
    
    mydb.list({include_docs:true}, (err, res) => {
        var data = res.rows.map((entry) => {
            return {
                id: entry.id,
                balance: entry.doc.balance
            };    
        });
        
        var balanceTableRows = data.map((entry) => {return `<tr><td>${entry.id}</td><td>${entry.balance}</td></tr>`});
        var balanceTable = `<table class="table"><tr><th>Name</th><th>Balance</th></tr>` + 
            balanceTableRows.reduce((a, b) => {return a+b;}) + 
            `</table>`;
            
            
        var selectUser = data.map((entry) => {return `<option value="${entry.id}">${entry.id}</option>`;}).
            reduce((a, b) => {return a+b;});
        
        var html = `
<!DOCTYPE html>
<html ng-app="myApp" ng-controller="myCtrl">
  <head>
    <title>Bank accounts for Cloudant Proxy</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap-theme.min.css">
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>
    
    <!--  Use the Angular library  -->
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-cookies.js"></script>
    
	<script>
	var myApp = angular.module("myApp", []);
	var scope;
		
	myApp.controller("myCtrl", function($scope) {
		// Make the scope available outside the controller, which is very useful for
		// debugging
  		scope = $scope;
  		
  		$scope.whichDbase = "directly";
  		$scope.dbaseUser = "alice";
  		$scope.fromUser = "alice";
  		$scope.toUser = "bill";
  		$scope.amount = 0;
  		
  		$scope.setLocationURL = () => {
            return 'accounts?whichDbase=' + $scope.whichDbase +
                '&dbaseUser=' + $scope.dbaseUser + 
                '&fromUser=' + $scope.fromUser + 
                '&toUser=' + $scope.toUser + 
                '&amount=' + $scope.amount;
  		};
	});
	
	</script>
    
    </head>
    <body>
        <div class="panel panel-info">
            <div class="panel-heading">
                Current balances
            </div>
            <div class="panel-body">
                ${balanceTable}
            </div>
        </div>
        <div class="panel panel-primary">
            <div class="panel-heading">
                Transfer money
            </div>
            <div class="panel-body">
                Use Cloudant
                <select ng-model="whichDbase">
                    <option value="directly">directly</option>
                    <option value="proxy">through the proxy</option>
                </select>
                <span ng-show="whichDbase!='directly'">
                    as <select ng-model="dbaseUser">${selectUser}</select>.
                </span>
                <table class="table">
                    <tr><th>From</th><th>To</th><th>Amount</th></tr>
                    <tr>
                        <td>
                            <select ng-model="fromUser">${selectUser}</select>
                        </td>
                        <td>
                            <select ng-model="toUser">${selectUser}</select>
                        </td>                        
                        <td>
                            <input ng-model="amount" type="number">
                        </td>
                    </tr>
                </table>
                
                <a ng-href="{{setLocationURL()}}">
                    <button class="btn btn-default" type="button">&#x2714;</button>                
                </a>
            </div>
        </div>
        

    </body>
</html>`;
        
        
        
        callback({html: html});
    });   // end of the mydb.list callback
            
}  // end of returnHtml
  
  
// Get the proxy URL, which includes the user name
var getProxyUrl = (user) => {
    return "http://" + user + ":password@" + proxyHostname;
};


// Modify a bank account
var modifyAccount = (user, amount, cloudantUrl, callback) => {
    var db = require("cloudant")(cloudantUrl).db.use("accounts");
    
    db.get(user, (err, res) => {
        res.balance += amount;
        db.insert(res, (err, body) => {
            callback();
        }); // end of db.insert
    });  // end of db.get
};
 
 

var makeChanges = (params, success) => {
    // If there are no changes to make
    if (!params.amount) {
        returnHtml(success);
        return ;
    }
    
    var cloudantUrl;
    
    // If we are here, there are changes to make before we create the returned HTML
    if (params.whichDbase == "directly")
        cloudantUrl = cloudantCred.url;
    else
        cloudantUrl = getProxyUrl(params.dbaseUser);
        
    modifyAccount(params.fromUser, -params.amount, cloudantUrl, () => {
        modifyAccount(params.toUser, +params.amount, cloudantUrl, () => {
            returnHtml(success);
        });  // end of internal modifyAccount call
    }); // end of outer modifyAccount call 

};
  
function main(params) {
    return new Promise(function(success, failure) {
        makeChanges(params, success);
    });
}
