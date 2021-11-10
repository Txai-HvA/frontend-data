const dataset = [
    {name: "Simon", score: 80 },
    {name: "Mary", score: 90 },
    {name: "John", score: 60 },
    {name: "Pete", score: 89 }
];

const width = 800;
const height = 800;
const margin = { top: 50, bottom: 50, left: 50, right: 50 };

const svg = d3.select("#d3-container")
    .append("svg")
    .attr("height", height - margin.top - margin.bottom)
    .attr("width", width - margin.left - margin.right)
    .attr("viewBox", [0, 0, width, height]);

const x = d3.scaleBand()
    .domain(d3.range(dataset.length))
    .range([margin.left, width - margin.right])
    .padding(0.1);

const y = d3.scaleLinear()
    .domain([0, 100])
    .range([height - margin.bottom, margin.top]);

svg.append("g")
    .attr("fill", "red")
    .selectAll("rect")
    .data(dataset.sort((a, b) => d3.descending(a.score, b.score)))
    .join("rect")
        .attr("x", (data, index) => x(index))//places bars in correct position
        .attr("y", (data) => y(data.score))
        .attr("height", data => y(0) - y(data.score))
        .attr("width", x.bandwidth())
        .attr("class", "rectangle");

function xAxis(g) {
    g.attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(index => dataset[index].name))
        .attr("font-size", "20px")
}

function yAxis(g) {
    g.attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y).ticks(null, dataset.format))
        .attr("font-size", "20px")
}

svg.append("g").call(yAxis)
svg.append("g").call(xAxis)
svg.node(); //draws the bars