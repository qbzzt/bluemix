function main(params) {
    var words = {
        "Hello" : {
            Hebrew: "Shalom",
            Spanish: "Hola",
            Arabic: "Marchaba"
        },
        "Goodbye" : {
            Hebrew: "Lehitraot",
            Spanish: "Adios",
            Arabic: "Illa Lika"
        },
        "Thanks" : {
            Hebrew: "Toda",
            Spanish: "Gracias",
            Arabic: "Shukran"
        },        
        "You're welcome" : {
            Hebrew: "Toda",
            Spanish: "Gracias",
            Arabic: "Shukran"
        }        
        
    };
     
    var html = "";
     
    // Heading
    html += "<h2>" + params.word + "</h2>";
     
    var list = words[params.word];
     
    if (list == undefined)
        html += "I am not familiar with this word, sorry";
    else {
        var langs = Object.keys(list);
         
        html += '<table class="table table-striped">';
        for (var i=0; i<langs.length; i++)
            html += '<tr><th>' + langs[i] + '</th><td>' + list[langs[i]] + '</td></tr>';
        html += "</table>";   
    }
 
    return { "html": html };
}
