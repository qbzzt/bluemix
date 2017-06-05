function main(params) {
 
    var words = ["Hello", "Goodbye", "Thanks", "You're welcome"];
    var html = "";
     
    for (var i=0; i<words.length; i++) {
        var onClick = "scope.getHtml('main', 'mainpanel?word=" 
            + escape(words[i]) + "')";
        html += '<p><button type="button" class="btn btn-info" onClick="'
            + onClick + '">' + words[i] + '</button></p>';
    }
    
        return { "html": html };
}

