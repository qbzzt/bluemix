// Change to your value   
var apiRoute = "https://service.us.apiconnect.ibmcloud.com/" + 
    "gws/apigateway/api/ec74d9ee76d47d2a5f9c4dbae2510b0b8" + 
    "ae5912b542df3e2d6c8308843e70d59/6bba5186-eebd-4ace-" + 
    "8f55-ed1bcc1fd6fe";  
  
function main(params) {
	return { html: `
	    <html>
	    <head>
	        <title>Self Registration Form</title>

	    <!-- Use Bootstrap with the default theme -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap-theme.min.css">
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>    
	    
	    </head>
	    <body>
	        <div class="well">
	            <form method="post" action="${apiRoute}/self_reg_handler">
	                <table class="table">
	                    <tr>
	                        <th>User Name</th>
	                        <td><input type="text" name="uid"></td>
	                    </tr>
	                    <tr>
	                        <th>Password</th>
	                        <td><input type="password" name="pwd"></td>
	                   </tr>	                        
	               </table>
	               <button type="submit">Register</button>
	            </form>
	        </div>
	    </BODY>
	    </HTML>
	` };
}
