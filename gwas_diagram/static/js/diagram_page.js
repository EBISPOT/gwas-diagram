// Function to parse input field:
function parseForm() {
    var parameters = new FormData();

    // Fetch text field
    for (var field of ["pmid", "trait", "pvalue", "catalog_date", "sample"]) {
        var input = document.getElementsByName(field)[0].value;
        if (input) {
            parameters.append(field, input);
        }
    }

    // Parse requested data type:
    parameters.append("dataType", $("input[name=\"dataType\"]:checked").val());

    // Fetch ancestry:
    if ($("option[name=\"ancestry\"]:selected").val()) {
        parameters.append("ancestry", $("option[name=\"ancestry\"]:selected").val());
    }

    // Fetch selected unchecked trait categories:
    var checkedTerms = [];
    $.each($("input[name=\"parent_trait\"]:checked"), function () {
        checkedTerms.push($(this).val());
    });
    parameters.append("parent_term", checkedTerms.join("|"));

    return (parameters);
}



function generateUrl(visType, formData) {
    var url = "http://0.0.0.0:9000/v1/" + visType + "?";

    for (var pair of formData.entries()) {
        url += `${pair[0]}=${pair[1]}&`;
    }
    console.log(url)
    return url;
}

// Upon hitting submit button: parse input fields and then fetch the corresponding filtered data
$("#filter_button").click(function () {

    // Fetching input fields:
    var parameters = parseForm();

    // Show report box:
    $("#requestBody").show();

    // Wiping the sort data:
    window.cytobandSortPositions = {};

    var visType = $("input[name=\"visType\"]:checked").val();

    // hostname:
    var url = generateUrl(visType, parameters);
    drawDiagram(url);

});

/*
Extract state of the radio button:
 */

var $selected = $("input[name=\"RadioGroup\"]:checked", "#someform");