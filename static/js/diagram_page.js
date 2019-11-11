
// Function to parse input field:
function parseForm() {
    console.log('cica');
    var parameters = new FormData();

    // Fetch pmid efo pvalue
    for ( var field of ['pmid', 'efo', 'pvalue']){
        var input = document.getElementsByName(field)[0].value;
        if (input){
            parameters.append(field, input);
            console.log(input);
        }
    }
    console.log(parameters);
    return(parameters);
}

// Parse form data
function generateCurlCommand(formData){
    var curlCommand = `curl -X POST \"${location.origin}/v1/filter\"`;

    for (var pair of formData.entries()) {
        curlCommand += ` \\&#10;    -d ${pair[0]}='${pair[1]}'`;
    }
    return curlCommand;
}

// If requested show downloaded data:
$("#showData").click(function(){
    $("#outputBox").toggle();
});

// Upon hitting submit button: parse input fields and then fetch the corresponding filtered data
$("#filter_button").click(function(){
    console.log('pocok');

    // Fetching input fields:
    var parameters = parseForm();

    // Show report box:
    $("#requestBody").show();

    // Submit POST request:
    var xhr = new XMLHttpRequest();
    var hostname=window.location.hostname;
    xhr.open("POST", "/v1/filter", true);

    // Printing out request body:
    var curlString = generateCurlCommand(parameters);

    $( "#requestBody" ).empty();
    $( "#requestBody" ).append( `<p>[Info] This is the equivalent curl command:<br>${curlString}</p>` );

    xhr.send(parameters);

    xhr.onload = function() {
        if ( this.status !== 200 ){
            alert("Request failed. Error code: " + this.status);
        }
        else {
            var response = this.response;
            console.log(response);

            // Show response:
            var pretty = JSON.stringify(JSON.parse(response),null,2);
            $("#outputContainer").show();
            $("#outputBox").append(`<p>${pretty}</p>`);
        }
    };

});