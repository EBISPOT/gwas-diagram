// some global variable:
var response = {};
var cb_sort_positions = {};
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

// Draw shit:
function draw_diagram(){
    // Adding chromosome 1 to the diagram:
    d3.selectAll(".chromosome").each(Process_chromosome)
}

function get_radius(hit){
    var constant = 7.08
    return Math.sqrt(constant * hit / Math.PI)
}

// selection object:
var svg = d3.select("svg")
    .attr("width", 3000)
    .attr("height", 3000);


// This function loops through a full chromosome and extracts parameters:
function Process_chromosome() {
    // Extract chromosome name:
    var chromosme_name = d3.select(this).attr('id').replace('chromosome', '');

    // Loop through all the cytobands of the chromosome:
    d3.select(this).selectAll('path').each(function(){
        // Select node:
        var node = d3.select(this);

        // Get node parameters:
        var cb_ID = node.attr('id');

        var coordinates = node.attr('d').split(" ")[1].split(',');

        // Look up the ID in the data:
        cb_ID = cb_ID.replace('cb','').replace("_",".");
        if ( cb_ID in window.response ){
            var circles = draw_circles(cb_ID,coordinates);
        }
    })

    // Aligning circles:
    Object.keys(window.cb_sort_positions).forEach(function(chromosome) {

        // sort both the q and p arms:
        window.cb_sort_positions[chromosome]['p'].sort(function(a, b) {return  b[1] - a[1];});
        window.cb_sort_positions[chromosome]['q'].sort(function(a, b) {return  a[1] - b[1];});

        // Adjust spheres on the p arm:
        var bottom = Number(window.cb_sort_positions[chromosome]['center']);
        for (var band of window.cb_sort_positions[chromosome]['p']){
            var radius = Number(band[2]);
            var position = Number(band[1]);
            var cb_id = band[0];

            // band group selection:
            var band_group = d3.select('#' + cb_id);

            // If the position is below the current bottom:
            if (bottom < position + radius){
                var new_y_pos = bottom - radius;
                band_group.attr("transform", `translate(70, ${new_y_pos})`);
                bottom =  bottom - 2*radius;
            }
            else {
                bottom =  position - radius;
            }
        }
        // Adjust spheres on the p arm:
        var top = Number(window.cb_sort_positions[chromosome]['center']);
        for (var band of window.cb_sort_positions[chromosome]['q']){

            var radius = Number(band[2]);
            var position = Number(band[1]);
            var cb_id = band[0];


            // band group selection:
            var band_group = d3.select('#' + cb_id);

            // If the position is below the current bottom:
            if (top > position - radius){
                var new_y_pos = top + radius;
                band_group.attr("transform", `translate(70, ${new_y_pos})`);
                top =  top + (2 * radius);
            }
            else {
                top = position + radius;
            }
        }
    });

}

adjust_bands = function(chromosome) {

    // sort both the q and p arms:
    window.cb_sort_positions[chromosome]['p'].sort(function(a, b) {return  b[1] - a[1];});
    window.cb_sort_positions[chromosome]['q'].sort(function(a, b) {return  a[1] - b[1];});

    // Adjust spheres on the p arm:
    var bottom = Number(window.cb_sort_positions[chromosome]['center']);
    for (var band of window.cb_sort_positions[chromosome]['p']){
        var radius = Number(band[2]);
        var position = Number(band[1]);
        var cb_id = band[0];

        // band group selection:
        var band_group = d3.select('#' + cb_id);

        // If the position is below the current bottom:
        if (bottom < position + radius){
            var new_y_pos = bottom - radius;
            band_group.attr("transform", `translate(70, ${new_y_pos})`);
            bottom =  bottom - 2*radius;
        }
        else {
            bottom =  position - radius;
        }
    }
    // Adjust spheres on the p arm:
    var top = Number(window.cb_sort_positions[chromosome]['center']);
    for (var band of window.cb_sort_positions[chromosome]['q']){

        var radius = Number(band[2]);
        var position = Number(band[1]);
        var cb_id = band[0];


        // band group selection:
        var band_group = d3.select('#' + cb_id);

        // If the position is below the current bottom:
        if (top > position - radius){
            var new_y_pos = top + radius;
            band_group.attr("transform", `translate(70, ${new_y_pos})`);
            top =  top + (2 * radius);
        }
        else {
            top = position + radius;
        }
    }
};

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
function draw_circles(cb_id, coordinates){

    // Fetch chromosome name:
    var chr_name = (cb_id.match('p')) ? cb_id.split('p')[0] : cb_id.split('q')[0];


    // Get sorted data:
    var sorted_categories = filter_sort_data(cb_id);

    // TODO: This should look though, but works for now
    var y_coord = 0;
    var x_coord = 0;

    // Group ID
    var group_id = 'group_'+cb_id.replace('.','_');

    // Create a group:
    var chromosome = d3.select("#chromosome" + chr_name);
    var cb_group = chromosome.append('g')
        .attr('id', group_id)
        .attr('class', 'cytoband_spheres');

    // Start populating the sort position data:
    if ( ! (chr_name in window.cb_sort_positions )){
        var centre = chromosome.select("#centre" + chr_name).attr('d').split(' ')[1].split(',')[1];
        window.cb_sort_positions[chr_name] = {
            'q' : [],
            'p' : [],
            'center' : Number(centre)
        };
    }

    // populate data:
    if ( cb_id.match('p') ){
        window.cb_sort_positions[chr_name]['p'].push([group_id, Number(coordinates[1]), get_radius(sorted_categories[0][1])]);
    }
    else if (cb_id.match('q')){
        window.cb_sort_positions[chr_name]['q'].push([group_id, Number(coordinates[1]), get_radius(sorted_categories[0][1])]);
    }
    else {
        return
    }

    // Adding circles:
    // <circle r='4.0985145' fill='#FDB462' stroke='black' stroke-width='0.5' gwasname="t    ype II diabetes mellitus" class='gwas-trait EFO_0001360' fading='false' gwasassociation='11785,13327,13346' priority='0' />
    for (var category of sorted_categories){
        var radius = get_radius(category[1]);
        if (x_coord == 0){
            x_coord = radius
        } else {
            x_coord = x_coord + radius
        }
        cb_group.insert("circle")
            .attr("cx", x_coord)
            .attr("cy", y_coord)
            .attr("r", radius)
            .style("fill", category[2])
            .style("stroke","black")
            .style("stroke-width", "0.1")
    }

    // Now translate the group to the proper place:
    cb_group.attr("transform", `translate(70,${coordinates[1]})`)
}
