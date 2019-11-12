// When the page is loaded, the chromosomes are added:
$( document ).ready(function() {
    $.get('../static/svg/1_fixed.svg', function(data){
        $('#svgEmbed').append(data.documentElement)
    })
});


// some global variable:
var response = {};
var color_mapping = {
    "Cardiovascular disease" : "#B33232",
    "Hematological measurement" : "#8DD3C7",
    "Neurological disorder" : "#FFFFB3",
    "Biological process" : "#BEBADA",
    "Cardiovascular measurement" : "#80B1D3",
    "Other trait" : "#FB8072",
    "Metabolic disorder" : "#FDB462",
    "Response to drug" : "#FCCDE5",
    "Lipid or lipoprotein measurement" : "#B3DE69",
    "Body measurement" : "#66CCFF",
    "Cancer" : "#BC80BD",
    "Inflammatory measurement" : "#CCEBC5",
    "Immune system disorder" : "#FFED6F",
    "Other measurement" : "#006699",
    "Liver enzyme measurement" : "#669900",
    "Other disease" : "#FF3399",
    "Digestive system disorder" : "#B7704C"
};


// Function to parse input field:
function parseForm() {
    var parameters = new FormData();

    // Fetch pmid efo pvalue
    for ( var field of ['pmid', 'efo', 'pvalue']){
        var input = document.getElementsByName(field)[0].value;
        if (input){
            parameters.append(field, input);
        }
    }
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

// Draw shit:
function draw_diagram(){
    // Adding chromosome 1 to the diagram:
    Process_chromosome(d3.select("#chromosome1"))
}


// Drawing all circles for a single cytoband.
// Does:
//  - drops empty categories. - DONE
//  - Orders categories by size. - DONE
//  - Fetch color definitions. - DONE
//  - Calculate horizontal position.
//  - Generate circles.


function get_radius(hit){
    var constant = 20 // 7.08
    return Math.sqrt(constant * hit / Math.PI)
}

var chr_name = '1';

// selection object:
var svg = d3.select("svg")
    .attr("width", 500)
    .attr("height", 600);






// This function loops through a full chromosome and extracts parameters:
function Process_chromosome(chr) {
    // Loop through all the cytobands of the chromosome:
    chr.selectAll('path').each(function(){
        // Select node:
        var node = d3.select(this);

        // Get node parameters:
        var cb_ID = node.attr('id');
        var chromosme_name = chr.attr('id').replace('chromosome', '');

        var coordinates = node.attr('d').split(" ")[1].split(',');

        // Look up the ID in the data:
        cb_ID = cb_ID.replace('cb','').replace("_",".");
        if ( cb_ID in window.response ){
            var circles = draw_circles(cb_ID,chromosme_name,coordinates);
        }
    });

    //

}

// This function filters out data for a given cytoband:
function filter_sort_data(cytoband){
    var cb_data = window.response[cytoband];

    // dropping empty categories and add color:
    var sorted_categories = [];
    for (var category in cb_data) {
        if (cb_data[category] > 0){
            sorted_categories.push([category, cb_data[category], window.color_mapping[category]]);
        }
    }

    // Sort list based on counts:
    sorted_categories.sort(function(a, b) {
        return  b[1] - a[1];
    });

    return sorted_categories;
}

// Function to draw circles for a cytoband:
function draw_circles(cb_id, chromosome, coordinates){

    console.log(cb_id);

    // Get sorted data:
    var sorted_categories = filter_sort_data(cb_id);

    // TODO: This should look though, but works for now
    var y_coord = 0;
    var x_coord = 0;

    // Group ID
    var group_id = 'group_'+cb_id.replace('.','_');

    // Create a group:
    var chromosome = d3.select("#chromosome" + chromosome);
    var cb_group = chromosome.append('g')
        .attr('id', group_id)
        .attr('class', 'cytoband_spheres');

    // Adding circles:
    // <circle r='4.0985145' fill='#FDB462' stroke='black' stroke-width='0.5' gwasname="t    ype II diabetes mellitus" class='gwas-trait EFO_0001360' fading='false' gwasassociation='11785,13327,13346' priority='0' />
    for (var category of sorted_categories){
        var radius = get_radius(category[1]);
        if (x_coord == 0){
            x_coord = radius
        } else {
            x_coord = x_coord + radius
        }
        console.log(radius,x_coord);
        cb_group.insert("circle")
            .attr("cx", x_coord)
            .attr("cy", y_coord)
            .attr("r", radius)
            .style("fill", category[2])
            .style("stroke","black")
            .style("stroke-width", "0.5")
    }

    // Now translate the group to the proper place:

    cb_group.attr("transform", `translate(70,${coordinates[1]})`)
}

// Function to get ID from a node
function get_cytoband_id(node){
    return d3.select(node).attr('id');
}

// Upon hitting submit button: parse input fields and then fetch the corresponding filtered data
$("#filter_button").click(function(){

    // Fetching input fields:
    var parameters = parseForm();

    // Show report box:
    $("#requestBody").show();

    // Wiping the svg field:
    d3.selectAll(".cytoband_spheres").remove();

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

            // Show response:
            var pretty = JSON.stringify(response,null,2);
            $("#outputContainer").show();
            $("#outputBox").append(`<p>${pretty}</p>`);

            // Once the response is here, we plot:
            draw_diagram();
        }
    })
});