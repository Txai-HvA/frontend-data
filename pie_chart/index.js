let pieWidth = 400;
pieHeight = 400;
margin = 40;

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
let radius = Math.min(pieWidth, pieHeight) / 2 - margin;

let userSongBarChartSVG = d3
  .select("#pie-chart")
  .append("svg")
  .attr("width", pieWidth)
  .attr("height", pieHeight)
  .append("g")
  .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2})`);

// Create dummy data
let data = { 
    "Artist1": 29, 
    "Artist2": 28, 
    "Artist3": 26, 
    "Artist4": 24, 
    "Artist5": 23, 
};


let quantizeScalePieColor = d3.scaleOrdinal()
    .domain(data)
        .range(["#a5ffef", "#cdf564", "#cb1582", "#191414", "#ffffff"]);

let quantizeScaleTextColor = d3.scaleQuantize()
    .domain(data)
        .range(["#cb1582", "#4100f5", "#a5ffef", "#ffffff", "#191414"]);

//The pie generator does not produce a shape directly,
//but instead computes the necessary angles to represent a 
//tabular dataset as a pie or donut chart;
//these angles can then be passed to an arc generator.

let pie = d3.pie().value((d) => d.value);
let data_ready = pie(d3.entries(data));

let arcGenerator = d3.arc().innerRadius(90).outerRadius(radius);

userSongBarChartSVG
  .selectAll("mySlices")
  .data(data_ready)
  .enter()
    .append("path")
    .attr("d", arcGenerator)
    .attr("fill", (d) => quantizeScalePieColor(d.data.key));

userSongBarChartSVG
  .selectAll("mySlices")
  .data(data_ready)
  .enter()
    .append("text")
    .text((d) => `${d.data.key} ${d.data.value}`)
    .attr("transform", (d) => `translate( ${arcGenerator.centroid(d)})`)
    .style("text-anchor", "middle")
    .attr("fill", (d) => quantizeScaleTextColor(d.data.key));