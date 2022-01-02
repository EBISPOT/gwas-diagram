// some global variable:
var visualizationType = "rectangles";
var response = {};
var cytobandSortPositions = {};
var colorMap = {
    "Cardiovascular disease": "#b33232",
    "Hematological measurement": "#8dd3c7",
    "Neurological disorder": "#ffffb3",
    "Biological process": "#BEBADA",
    "Cardiovascular measurement": "#80B1D3",
    "Other trait": "#FB8072",
    "Metabolic disorder": "#FDB462",
    "Response to drug": "#FCCDE5",
    "Lipid or lipoprotein measurement": "#B3DE69",
    "Body measurement": "#66CCFF",
    "Cancer": "#BC80BD",
    "Inflammatory measurement": "#CCEBC5",
    "Immune system disorder": "#FFED6F",
    "Other measurement": "#006699",
    "Liver enzyme measurement": "#669900",
    "Other disease": "#FF3399",
    "Digestive system disorder": "#B7704C"
};
var scale = 1;

// Draw shit:
function drawDiagram() {
    // Wiping the svg field:
    d3.selectAll(".cytoband_associations").remove();

    // Adding all chromosomes to the diagram:
    d3.selectAll(".chromosome").each(processChromosome)
}

function getRadius(hit) {

    // Constant now is derived from the scale:
    var constant = 5 * window.scale;
    return Math.sqrt(constant * hit / Math.PI)
}

// selection object:
var svg = d3.select("svg#svgEmbed")
    .attr("width", 3000)
    .attr("height", 3000);


// This function loops through a full chromosome and extracts parameters:
function processChromosome() {
    // Extract chromosome name:
    var chromosme_name = d3.select(this).attr("id").replace("chromosome", "");

    // Loop through all the cytobands of the chromosome:
    d3.select(this).selectAll("path").each(function () {
        // Select node:
        var node = d3.select(this);

        // Get node parameters:
        var cb_ID = node.attr("id");

        var coordinates = node.attr("d").split(" ")[1].split(",");

        // Look up the ID in the data:
        cb_ID = cb_ID.replace("cb", "").replace("_", ".");
        if (cb_ID in window.response) {
            if (window.visualizationType == "circles") {
                drawCircles(cb_ID, coordinates);

                // Aligning circles:
                Object.keys(window.cytobandSortPositions).forEach(adjustCircles);
            }
            else if (window.visualizationType == "rectangles") {
                draw_rectangles(cb_ID, coordinates);

                // Aligning rectangles:
                Object.keys(window.cytobandSortPositions).forEach(adjustRectangles);
            }

        }
    })


}

adjustRectangles = function (chromosome) {

    // sort both the q and p arms:
    window.cytobandSortPositions[chromosome]["p"].sort(function (a, b) { return b[1] - a[1]; });
    window.cytobandSortPositions[chromosome]["q"].sort(function (a, b) { return a[1] - b[1]; });

    // Adjust spheres on the p arm:
    var bottom = Number(window.cytobandSortPositions[chromosome]["center"]);
    for (var band of window.cytobandSortPositions[chromosome]["p"]) {
        var radius = Number(band[2]);
        var position = Number(band[1]);
        var cytobandId = band[0];

        // band group selection:
        var cytobandGroup = d3.select("#" + cytobandId);

        // If the position is below the current bottom:
        if (bottom < position + radius) {
            var newYPos = bottom - radius;
            cytobandGroup.attr("transform", `translate(70, ${newYPos})`);
            bottom = bottom - radius - 2;
        }
        else {
            bottom = position - radius - 2;
        }
    }
    // Adjust spheres on the p arm:
    var top = Number(window.cytobandSortPositions[chromosome]["center"]);
    for (var band of window.cytobandSortPositions[chromosome]["q"]) {

        var radius = Number(band[2]);
        var position = Number(band[1]);
        var cytobandId = band[0];


        // band group selection:
        var cytobandGroup = d3.select("#" + cytobandId);

        // If the position is below the current bottom:
        if (top > position - radius) {
            var newYPos = top + 2;
            cytobandGroup.attr("transform", `translate(70, ${newYPos})`);
            top = top + radius + 2;
        }
        else {
            top = position + radius + 2;
        }
    }
}

adjustCircles = function (chromosome) {

    // sort both the q and p arms:
    window.cytobandSortPositions[chromosome]["p"].sort(function (a, b) { return b[1] - a[1]; });
    window.cytobandSortPositions[chromosome]["q"].sort(function (a, b) { return a[1] - b[1]; });

    // Adjust spheres on the p arm:
    var bottom = Number(window.cytobandSortPositions[chromosome]["center"]);
    for (var band of window.cytobandSortPositions[chromosome]["p"]) {
        var radius = Number(band[2]);
        var position = Number(band[1]);
        var cytobandId = band[0];

        // band group selection:
        var bandGroup = d3.select("#" + cytobandId);

        // If the position is below the current bottom:
        if (bottom < position + radius) {
            var newYPosition = bottom - radius;
            bandGroup.attr("transform", `translate(70, ${newYPosition})`);
            bottom = bottom - 2 * radius;
        }
        else {
            bottom = position - radius;
        }
    }
    // Adjust spheres on the p arm:
    var top = Number(window.cytobandSortPositions[chromosome]["center"]);
    for (var band of window.cytobandSortPositions[chromosome]["q"]) {

        var radius = Number(band[2]);
        var position = Number(band[1]);
        var cytobandId = band[0];


        // band group selection:
        var bandGroup = d3.select("#" + cytobandId);

        // If the position is below the current bottom:
        if (top > position - radius) {
            var newYPosition = top + radius;
            bandGroup.attr("transform", `translate(70, ${newYPosition})`);
            top = top + (2 * radius);
        }
        else {
            top = position + radius;
        }
    }
};

// This function filters out data for a given cytoband:
function filterSortData(cytoband) {
    var cytobandData = window.response[cytoband];

    // dropping empty categories and add color:
    var sortedCategories = [];
    for (var category in cytobandData) {
        if (cytobandData[category] > 0) {
            sortedCategories.push([category, cytobandData[category], window.colorMap[category]]);
        }
    }

    // Sort list based on counts:
    sortedCategories.sort(function (a, b) {
        return b[1] - a[1];
    });

    return sortedCategories;
}

// Function to draw circles for a cytoband:
function drawCircles(cytobandId, coordinates) {

    // Fetch chromosome name:
    var chromosomeName = (cytobandId.match("p")) ? cytobandId.split("p")[0] : cytobandId.split("q")[0];


    // Get sorted data:
    var sortedCategories = filterSortData(cytobandId);

    // TODO: This should look though, but works for now
    var y_coord = 0;
    var x_coord = 0;

    // Group ID
    var group_id = "group_" + cytobandId.replace(".", "_");

    // Create a group:
    var chromosome = d3.select("#chromosome" + chromosomeName);
    var cb_group = chromosome.append("g")
        .attr("id", group_id)
        .attr("class", "cytoband_associations");

    // Start populating the sort position data:
    if (!(chromosomeName in window.cytobandSortPositions)) {
        var centre = chromosome.select("#centre" + chromosomeName).attr("d").split(" ")[1].split(",")[1];
        window.cytobandSortPositions[chromosomeName] = {
            "q": [],
            "p": [],
            "center": Number(centre)
        };
    }

    // populate data:
    if (cytobandId.match("p")) {
        window.cytobandSortPositions[chromosomeName]["p"].push([group_id, Number(coordinates[1]), getRadius(sortedCategories[0][1])]);
    }
    else if (cytobandId.match("q")) {
        window.cytobandSortPositions[chromosomeName]["q"].push([group_id, Number(coordinates[1]), getRadius(sortedCategories[0][1])]);
    }
    else {
        return
    }

    // Adding circles:
    // <circle r="4.0985145" fill="#FDB462" stroke="black" stroke-width="0.5" gwasname="t    ype II diabetes mellitus" class="gwas-trait EFO_0001360" fading="false" gwasassociation="11785,13327,13346" priority="0" />
    for (var category of sortedCategories) {
        var radius = getRadius(category[1]);
        if (x_coord === 0) {
            x_coord = radius
        } else {
            x_coord = x_coord + radius
        }
        cb_group.insert("circle")
            .attr("cx", x_coord)
            .attr("cy", y_coord)
            .attr("r", radius)
            .style("fill", category[2])
            .style("stroke", "black")
            .style("stroke-width", "0.1")
    }

    // Now translate the group to the proper place:
    cb_group.attr("transform", `translate(70,${coordinates[1]})`)
}

draw_rectangles = function (cb_name, coordinates) {
    // Parse chromosome name:
    var chromosome_name = cb_name.match("(.+)[pq]")[1];

    // Sorting and shit:
    var sorted_categories = filterSortData(cb_name);

    // Initialize offsets:
    var x_offset = 0;
    var y_offset = 0;

    // Initialize constants:
    var row_size = 200 / (1 + window.scale);
    var unit_size = (window.scale + 1);

    // Create a group for the band:
    var group_id = "group_" + cb_name.replace(".", "_");
    var chromosome = d3.select("#chromosome" + chromosome_name);
    var cb_group = chromosome.append("g")
        .attr("id", group_id)
        .attr("class", "cytoband_associations");

    var All_count = 0; // To track the full count for the cytoband

    // Looping through all categories and draw a corresponding rectangle:
    for (var group of sorted_categories) {

        // extract values:
        var count = group[1];
        var color = group[2];

        // Save count
        All_count = All_count + count;

        var count_set = split_count(count, x_offset, row_size);

        // Drawing first row:
        if (count_set[0]) {
            cb_group.append("rect")
                .attr("x", x_offset * unit_size)
                .attr("y", y_offset * unit_size)
                .attr("width", count_set[0] * unit_size)
                .attr("height", unit_size)
                .style("fill", color)
                .style("stroke", color)
                .style("stroke-width", 0.1);

            // Updating x,y-offset:
            if (x_offset + count_set[0] === row_size) {
                x_offset = 0;
                y_offset = y_offset + 1;
            }
            else {
                x_offset = x_offset + count_set[0];
            }
        }

        // Drawing the second row:
        if (count_set[1]) {

            cb_group.append("rect")
                .attr("x", 0)
                .attr("y", y_offset * unit_size)
                .attr("width", row_size * unit_size)
                .attr("height", count_set[1] * unit_size)
                .style("fill", color)
                .style("stroke", color)
                .style("stroke-width", 0.1);

            y_offset = y_offset + count_set[1];
        }

        // Drawing thir row:
        if (count_set[2]) {
            cb_group.append("rect")
                .attr("x", 0)
                .attr("y", y_offset * unit_size)
                .attr("width", count_set[2] * unit_size)
                .attr("height", unit_size)
                .style("fill", color)
                .style("stroke", color)
                .style("stroke-width", 0.1);

            // Updating x,y-offset:
            x_offset = count_set[2];
        }
    }

    // Add a thick boundary covering the entire box:
    var box_height = Math.ceil(All_count / row_size) * unit_size;
    cb_group.append("rect")
        .attr("id", "container")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", row_size * unit_size)
        .attr("height", box_height)
        .style("fill", "none")
        .style("stroke", "white")
        .style("stroke-width", 0.5);

    // Now translate the group to the proper place:
    cb_group.attr("transform", `translate(70,${coordinates[1]})`);

    // Start populating the sort position data:
    if (!(chromosome_name in window.cytobandSortPositions)) {
        var centre = chromosome.select("#centre" + chromosome_name).attr("d").split(" ")[1].split(",")[1];
        window.cytobandSortPositions[chromosome_name] = {
            "q": [],
            "p": [],
            "center": Number(centre)
        };
    }

    // populate data:
    if (cb_name.match("p")) {
        window.cytobandSortPositions[chromosome_name]["p"].push([group_id, Number(coordinates[1]), box_height]);
    }
    else if (cb_name.match("q")) {
        window.cytobandSortPositions[chromosome_name]["q"].push([group_id, Number(coordinates[1]), box_height]);
    }
    else {
        return
    }

};

split_count = function (count, x_offset, width) {
    // This function calculates the split of the counts given the count the x-offset and the width

    var split = [0, 0, 0];

    // get first count:
    if (x_offset !== 0) {
        split[0] = (width - x_offset >= count) ? count : width - x_offset;

        // If the first row is not yet full:
        if (count === split[0]) { return split; }

        // If more point left:
        count = count - split[0];
    }


    split[1] = Math.floor(count / width);
    split[2] = count % width;

    return split;
};