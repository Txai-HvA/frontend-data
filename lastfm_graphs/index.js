//DOM elements
let filterAmountOfSongs = document.querySelector("#filterAmountOfSongs");
let filterPeriod = document.querySelector("#filterPeriod");
let givenUserName = document.querySelector("#givenUserName");
let filterSort = document.querySelector("#filterSort");
let userArtistLegend = document.querySelector("#userArtistLegend");

//marginLeft, width & height off the svg
const marginLeft = 320;
const width = 800;
const height = 800;

//Creates sources <svg> element
const userSongPieChartSVG = d3.select(".userSongBarChart").append("svg")
.attr("width", width)
.attr("height", height)

//Group is used to enforce given marginLeft
const g = userSongPieChartSVG.append("g")
  .attr("transform", `translate(${marginLeft},${0})`);

//Scales setup
const xscale = d3.scaleLinear().range([0, width]);//playCount
const yscale = d3.scaleBand().rangeRound([0, height]).paddingInner(0.2);//songName

//Axis setup
const yaxis = d3.axisLeft().scale(yscale);
const g_yaxis = g.append("g").attr("class","y axis");

let dataSongs, dataArtists;

//Reads json file
d3.json("./lastfm.json").then((json) => {
    //Gets favorite songs from user
    dataSongs = json[4];

    dataSongs = sortFromHighToLow(dataSongs);
    dataSongs = filterTop(dataSongs, 20);
    updateBarChart(dataSongs);

    //Displays username of the user
    givenUserName.textContent = dataSongs[0].userName;


    //Gets favorite artists from user
    dataArtists = json[3];

    dataArtists = sortFromHighToLow(dataArtists);
    dataArtists = filterTop(dataArtists, 5);
    updatePieChart(dataArtists)
});

//Sorts dataset from highest playCount to lowest playCount (so decending)
function sortFromHighToLow(data) {
  data = data.sort(function(a, b) { return b.playCount - a.playCount });
  return data;
}

//Sorts dataset from lowest playCount to highest playCount (so accending)
function sortFromLowToHigh(data) {
  data = data.sort(function(a, b) { return a.playCount - b.playCount });
  return data;
}

//Cuts of the the rows above 20
function filterTop(data, amount) {
  data = data.slice(0, amount); 
  return data;
}

//Updates user song bar chart with given data
function updateBarChart(new_data) {
  
  //update the scales
  xscale.domain([0, d3.max(new_data, (d) => d.playCount)]);
  yscale.domain(new_data.map((d, i) => `${d.artistName} - ${d.songName} - #${i+1}`)); //Mapping on artist and song name
  
  //Render the y axis
  g_yaxis.call(yaxis);

  //Fix for positioning
  let rectX, labelY, labelX;
  switch(new_data.length) {
    case 5:  rectX = 94.5; labelY = 62; labelX = 350; break;
    case 6:  rectX = 72;   labelY = 50; labelX = 330; break;
    case 7:  rectX = 56;   labelY = 42; labelX = 320; break;
    case 8:  rectX = 44;   labelY = 37; labelX = 310; break;
    case 9:  rectX = 33.5; labelY = 32; labelX = 300; break;
    case 10: rectX = 26.5; labelY = 27; labelX = 300; break;
    case 11: rectX = 20.5; labelY = 25; labelX = 290; break;
    case 12: rectX = 16;   labelY = 22; labelX = 290; break;
    case 13: rectX = 12;   labelY = 20; labelX = 290; break;
    case 14: rectX = 8;    labelY = 19; labelX = 290; break;
    case 15: rectX = 4.5;  labelY = 17; labelX = 290; break;
    case 16: rectX = 1.5;  labelY = 16; labelX = 290; break;
    case 17: rectX = 0;    labelY = 15; labelX = 290; break;
    case 18: rectX = -3.5; labelY = 13; labelX = 290; break;
    case 19: rectX = -4;   labelY = 13; labelX = 290; break;
    case 20: rectX = -6.5; labelY = 12; labelX = 290; break;
  }

  //Render the chart with new data
  createRect(g, new_data, rectX);
  createImages(g, new_data);
  createLabels(userSongPieChartSVG, new_data, labelY, labelX);
}

//Creates the bars for the barchart
function createRect(g, new_data, rectX) {
  //DATA JOIN
  const rect = g.selectAll("rect").data(new_data).join(
    //ENTER 
    //new DOM elements
    (enter) => {
      const rect_enter = enter.append("rect").attr("x", 0);
      return rect_enter;
    },
    //UPDATE
    //update existing DOM elements
    (update) => update,
    //EXIT
    //removes DOM elements that aren't associated with data
    (exit) => exit.remove()
  );

  //quantizeScaleBars. In this case, 20 colors divided by the range of colors(5)
  let quantizeScaleBars = d3.scaleQuantize()
    .domain([0, 20])
      .range(["#a5ffef", "#cdf564", "#cb1582", "#191414", "#ffffff"]);

  rect
    .attr("class", "bar")
    .attr("x", rectX)
    .attr("rx", 2)//rounded corners
    .attr("height", yscale.bandwidth())//bar thickness
    .transition()
      .ease(d3.easeElastic)//Animation when the amount of shown songs gets changed
      .attr("y", (d, i) => yscale(`${d.artistName} - ${d.songName} - #${i+1}`))
    .style("fill", function(d, i) {
      return quantizeScaleBars(i);
    })
    .transition()//Animation when the bars appear
      .ease(d3.easeBack)
      .delay(function(d, i) {
        return i * 40;
      })
      .attr("width", (d) => xscale(d.playCount) / 2);//width of the bars

  //Links to the LastFM page of the song
  rect.on("click", (i, d) => window.open(d.url));
  //Source https://stackoverflow.com/questions/32305898/link-in-d3-bar-chart
  //https://stackoverflow.com/questions/7077770/window-location-href-and-window-open-methods-in-javascript
}

//Creates the images next to the barchart
function createImages(g, new_data) {
  //DATA JOIN
  const images = g.selectAll("image").data(new_data).join(
    //ENTER 
    //new DOM elements
    (enter) => {
      const image_enter = enter.append("svg:image").attr("x", 0);
      return image_enter;
    },
    //UPDATE
    //update existing DOM elements
    (update) => update,
    //EXIT
    //removes DOM elements that aren't associated with data
    (exit) => exit.remove()
  );

  //Ads images in front of the bars
  images.attr("xlink:href", (d) => d.image["#text"])//gets image url
      .attr("x", -38)
      .attr("y", (d, i) => yscale(`${d.artistName} - ${d.songName} - #${i+1}`))
      .attr("width", yscale.bandwidth())
      .attr("height", yscale.bandwidth());
  //Source http://bl.ocks.org/hwangmoretime/c2c7128c5226f9199f87

  //Links to the LastFM page of the song
  images.on("click", (i, d) => window.open(d.url));
}

//Creates the labels on top of the bars that display the amount of listens per song
function createLabels(userSongPieChartSVG, new_data, labelY, labelX) {
    //DATA JOIN
    const labels = userSongPieChartSVG.selectAll(".playCountLabel").data(new_data).join(
      //ENTER 
      //new DOM elements
      (enter) => {
        const label_enter = enter.append("svg:text").attr("x", 0);
        return label_enter;
      },
      //UPDATE
      //update existing DOM elements
      (update) => update,
      //EXIT
      //removes DOM elements that aren't associated with data
      (exit) => exit.remove()
    );

  //quantizeScaleText, where text has different colors depending on playCount
  let quantizeScaleText = d3.scaleQuantize()
  .domain([0, 20])
    .range(["#cb1582", "#4100f5", "#a5ffef", "#ffffff", "#191414"]);

  labels.attr("class","playCountLabel")
          .style("fill", function(d, i) {
            return quantizeScaleText(i);
          })
          .attr("x", (d) => xscale(d.playCount) / 2 + labelX)
          .attr("y", (d, i) => yscale(`${d.artistName} - ${d.songName} - #${i+1}`)  + labelY)
          .attr("dy", ".75em")
          .transition().delay((d, i) =>  i * 50)//Animation where the labels fade in one by one
            .style("opacity", 1)
            .text((d) => d.playCount);
}

//Changes the amount of top songs displayed
d3.select(filterAmountOfSongs).on("input", function() {
  const newSize = d3.select(this).property("value");  
    
  if(newSize => 5 && newSize <= 20) {
      const filtered_data = dataSongs.slice(0, newSize);//Cuts off the rows that are below newSize 
      updateBarChart(filtered_data); //Update the chart with all the filtered data
  } else {
      updateBarChart(dataSongs); //Update the chart with all the data
  }
});

//Changes the sorting from high-low playcount to low-high playcount and vice versa
d3.select(filterSort).on("change", function() {
  const selectedOption = d3.select(this).property("value");  
  if(selectedOption == "HighLowPlayCount") {
    dataSongs = sortFromHighToLow(dataSongs);
  } else if(selectedOption == "LowHighPlayCount") {
    dataSongs = sortFromLowToHigh(dataSongs);
  }
  updateBarChart(dataSongs);
});

//Updates user artist pie chart with given data
function updatePieChart(new_data) {
  let pieWidth = 500;
  let pieHeight = 500;
  //The radius of the pieplot is half the width or half the height (smallest one)
  let radius = Math.min(pieWidth, pieHeight) / 2;

  let userSongPieChartSVG = d3
  .select(".userArtistPieChart")
  .append("svg")
    .attr("width", pieWidth)
    .attr("height", pieHeight)
    .append("g")
      .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2})`);

  //ordinalScalePie, where each slice has a different color depending on playCount
  let ordinalScalePie = d3.scaleOrdinal()
    .domain(new_data)
      .range(["#cdf564", "#4100f5", "#cb1582", "#191414", "#ffffff"]);

  //ordinalScaleText, where text has different colors depending on playCount
  let ordinalScaleText = d3.scaleOrdinal()
    .domain(new_data)
      .range(["#4100f5", "#cdf564", "#a5ffef", "#ffffff", "#191414"]);

  let pie = d3.pie().value((d) => d.value);
  let result = new_data.map((d) => d.playCount);
  let data_ready = pie(d3.entries(result));
  //Creates the circle
  //where .innerRadius() is the hole in the middle
  //and where .outerRadius() is the actual radius of the circle
  let arcGenerator = d3.arc().innerRadius(90).outerRadius(radius);

  //Slices
  userSongPieChartSVG
    .selectAll("slices")
    .data(data_ready)
    .enter()
      .append("path").style("opacity", "0")
        .transition()
          .delay((d, i) => i * 500)
        .attr("d", arcGenerator)
        .attr("fill", (d) => ordinalScalePie(d.value))
        .style("opacity", "1");


  //Slices Text
  userSongPieChartSVG
    .selectAll("slices")
    .data(data_ready)
    .enter()
      .append("text")
        .transition()
          .delay((d, i) => i * 500)
      .text((d) => d.value)
      .attr("transform", (d) => `translate( ${arcGenerator.centroid(d)})`)//used to compute the midpoint of the centerline of the arc
      .attr("fill", (d) => ordinalScaleText(d.value));

  createLegend(new_data);
}

//Creates a legend for the user artist pie chart
function createLegend(new_data) {
  //Add list items to userArtistLegend
  new_data.forEach(artist => {
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(artist.artistName));
    userArtistLegend.appendChild(li);
  });
}