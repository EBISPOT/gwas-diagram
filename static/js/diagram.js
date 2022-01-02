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
    d3.selectAll(".chromosome").each(processChromosome);
}

function getRadius(hit) {

    // Constant now is derived from the scale:
    var constant = 5 * window.scale;
    return Math.sqrt(constant * hit / Math.PI);
}

// selection object:
var svg = (d3
    .select("svg#svgEmbed")
    .attr("width", 3000)
    .attr("height", 3000));


// This function loops through a full chromosome and extracts parameters:
function processChromosome() {

    // Loop through all the cytobands of the chromosome:
    d3.select(this).selectAll("path").each(function () {
        // Select node:
        var node = d3.select(this);

        // Get node parameters:
        var cytobandId = node.attr("id");

        var coordinates = node.attr("d").split(" ")[1].split(",");

        // Look up the ID in the data:
        cytobandId = cytobandId.replace("cb", "").replace("_", ".");
        if (cytobandId in window.response) {
            if (window.visualizationType == "circles") {
                drawCircles(cytobandId, coordinates);

                // Aligning circles:
                Object.keys(window.cytobandSortPositions).forEach(adjustCircles);
            }
            else if (window.visualizationType == "rectangles") {
                drawRectangles(cytobandId, coordinates);

                // Aligning rectangles:
                Object.keys(window.cytobandSortPositions).forEach(adjustRectangles);
            }

        }
    });


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
};

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
    var yCoordinates = 0;
    var xCoordinates = 0;

    // Group ID
    var groupId = "group_" + cytobandId.replace(".", "_");

    // Create a group:
    var chromosome = d3.select("#chromosome" + chromosomeName);
    var cytobandGroup = chromosome.append("g")
        .attr("id", groupId)
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
        window.cytobandSortPositions[chromosomeName]["p"].push([groupId, Number(coordinates[1]), getRadius(sortedCategories[0][1])]);
    }
    else if (cytobandId.match("q")) {
        window.cytobandSortPositions[chromosomeName]["q"].push([groupId, Number(coordinates[1]), getRadius(sortedCategories[0][1])]);
    }
    else {
        return
    }

    // Adding circles:
    // <circle r="4.0985145" fill="#FDB462" stroke="black" stroke-width="0.5" gwasname="t    ype II diabetes mellitus" class="gwas-trait EFO_0001360" fading="false" gwasassociation="11785,13327,13346" priority="0" />
    for (var category of sortedCategories) {
        var radius = getRadius(category[1]);
        if (xCoordinates === 0) {
            xCoordinates = radius
        } else {
            xCoordinates = xCoordinates + radius
        }
        cytobandGroup.insert("circle")
            .attr("cx", xCoordinates)
            .attr("cy", yCoordinates)
            .attr("r", radius)
            .style("fill", category[2])
            .style("stroke", "black")
            .style("stroke-width", "0.1")
    }

    // Now translate the group to the proper place:
    cytobandGroup.attr("transform", `translate(70,${coordinates[1]})`)
}

drawRectangles = function (cytobandName, coordinates) {
    // Parse chromosome name:
    var chromosomeName = cytobandName.match("(.+)[pq]")[1];

    // Sorting and shit:
    var sortedCategories = filterSortData(cytobandName);

    // Initialize offsets:
    var xOffset = 0;
    var yOffset = 0;

    // Initialize constants:
    var rowSize = 200 / (1 + window.scale);
    var unitSize = (window.scale + 1);

    // Create a group for the band:
    var groupId = "group_" + cytobandName.replace(".", "_");
    var chromosome = d3.select("#chromosome" + chromosomeName);
    var cytobandGroup = chromosome.append("g")
        .attr("id", groupId)
        .attr("class", "cytoband_associations");

    var allCount = 0; // To track the full count for the cytoband

    // Looping through all categories and draw a corresponding rectangle:
    for (var group of sortedCategories) {

        // extract values:
        var count = group[1];
        var color = group[2];

        // Save count
        allCount = allCount + count;

        var countSet = splitCount(count, xOffset, rowSize);

        // Drawing first row:
        if (countSet[0]) {
            cytobandGroup.append("rect")
                .attr("x", xOffset * unitSize)
                .attr("y", yOffset * unitSize)
                .attr("width", countSet[0] * unitSize)
                .attr("height", unitSize)
                .style("fill", color)
                .style("stroke", color)
                .style("stroke-width", 0.1);

            // Updating x,y-offset:
            if (xOffset + countSet[0] === rowSize) {
                xOffset = 0;
                yOffset = yOffset + 1;
            }
            else {
                xOffset = xOffset + countSet[0];
            }
        }

        // Drawing the second row:
        if (countSet[1]) {

            cytobandGroup.append("rect")
                .attr("x", 0)
                .attr("y", yOffset * unitSize)
                .attr("width", rowSize * unitSize)
                .attr("height", countSet[1] * unitSize)
                .style("fill", color)
                .style("stroke", color)
                .style("stroke-width", 0.1);

            yOffset = yOffset + countSet[1];
        }

        // Drawing thir row:
        if (countSet[2]) {
            cytobandGroup.append("rect")
                .attr("x", 0)
                .attr("y", yOffset * unitSize)
                .attr("width", countSet[2] * unitSize)
                .attr("height", unitSize)
                .style("fill", color)
                .style("stroke", color)
                .style("stroke-width", 0.1);

            // Updating x,y-offset:
            xOffset = countSet[2];
        }
    }

    // Add a thick boundary covering the entire box:
    var boxHeight = Math.ceil(allCount / rowSize) * unitSize;
    cytobandGroup.append("rect")
        .attr("id", "container")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", rowSize * unitSize)
        .attr("height", boxHeight)
        .style("fill", "none")
        .style("stroke", "white")
        .style("stroke-width", 0.5);

    // Now translate the group to the proper place:
    cytobandGroup.attr("transform", `translate(70,${coordinates[1]})`);

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
    if (cytobandName.match("p")) {
        window.cytobandSortPositions[chromosomeName]["p"].push([groupId, Number(coordinates[1]), boxHeight]);
    }
    else if (cytobandName.match("q")) {
        window.cytobandSortPositions[chromosomeName]["q"].push([groupId, Number(coordinates[1]), boxHeight]);
    }
    else {
        return
    }

};

splitCount = function (count, xOffset, width) {
    // This function calculates the split of the counts given the count the x-offset and the width

    var split = [0, 0, 0];

    // get first count:
    if (xOffset !== 0) {
        split[0] = (width - xOffset >= count) ? count : width - xOffset;

        // If the first row is not yet full:
        if (count === split[0]) { return split; }

        // If more point left:
        count = count - split[0];
    }


    split[1] = Math.floor(count / width);
    split[2] = count % width;

    return split;
};