// When the page is loaded, the chromosomes are added:
$( document ).ready(function() {
    $.get('../static/svg/chromosomes.svg', function(data){
        $('#svgEmbed').append(data.documentElement)
    })
});


// Function to parse input field:
function parseForm() {
    var parameters = new FormData();

    // Fetch text field
    for ( var field of ['pmid', 'trait', 'pvalue', 'catalog_date', 'sample']){
        var input = document.getElementsByName(field)[0].value;
        if (input){
            parameters.append(field, input);
        }
    }

    // Parse requested data type:
    parameters.append("dataType", $('input[name="dataType"]:checked').val());

    // Fetch ancestry:
    if( $('option[name="ancestry"]:selected').val() ){
        parameters.append('ancestry', $('option[name="ancestry"]:selected').val());
    }

    // Fetch selected unchecked trait categories:
    var checked_terms = [];
    $.each($("input[name='parent_trait']:checked"), function(){
                checked_terms.push($(this).val());
            });
    parameters.append("parent_term", checked_terms.join("|"));

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

// Upon hitting submit button: parse input fields and then fetch the corresponding filtered data
$("#filter_button").click(function(){

    // Fetching input fields:
    var parameters = parseForm();

    // Show report box:
    $("#requestBody").show();

    // Wiping the sort data:
    window.cb_sort_positions = {};

    // hostname:
    var jqxhr = $.ajax({
        url: '/v1/filter',
        data: parameters,
        processData: false,
        contentType: false,
        type: 'POST',
        success : function (response) {
            var curlString = generateCurlCommand(parameters);
            $( "#requestBody" ).empty();
            $( "#requestBody" ).append( `<p>[Info] This is the equivalent curl command:<br>${curlString}</p>` );

            // Assigning the response to the global variable:
            window.response = response;

            // Extract the type of the visualization:
            window.visualization_type = $('input[name="visType"]:checked').val();

            // Update scale:
            window.scale = Number($('option[name="scale"]:selected').val());

            // Once the response is here, we plot:
            draw_diagram();
        }
    })
});

/*
Extract state of the radio button:
 */

var $selected = $('input[name="RadioGroup"]:checked', '#someform');