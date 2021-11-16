//DOM elements
let filterAmountOfSongs = document.querySelector("#filterAmountOfSongs");
let filterPeriod = document.querySelector("#filterPeriod");
let givenUserName = document.querySelector("#givenUserName");

//margin, width & height off the svg
const margin = {top: 0, bottom: 0, left: 320, right: 0};
const width = 800 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

//Creates sources <svg> element
const userSongBarChartSVG = d3.select("body").append("svg")
.attr("width", width+margin.left+margin.right)
.attr("height", height+margin.top+margin.bottom)
.attr("class", "userSongBarChart");

//Group is used to enforce given margin
const g = userSongBarChartSVG.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

//Scales setup
const xscale = d3.scaleLinear().range([0, width]);//playCount
const yscale = d3.scaleBand().rangeRound([0, height]).paddingInner(0.2);//songName

//Axis setup
const xaxis = d3.axisTop().scale(xscale);
const g_xaxis = g.append("g").attr("class","x axis")
  .attr("style", "visibility:hidden");//Hidden cause I want the playCount to appear on the bars !!!
const yaxis = d3.axisLeft().scale(yscale);
const g_yaxis = g.append("g").attr("class","y axis");



//Global variable for all data
let data;

//Reads json file
d3.json("./lastfm.json").then((json) => {
    //Gets the last array (favorite songs from user)
    data = json[4];

    givenUserName.textContent = data[0].userName;
    //Sorts dataset from highest playCount to lowest playCount (so decending)
    data = data.sort(function(a, b) { return b.playCount - a.playCount });
    
    //Cuts of the the rows above 20
    data = data.slice(0, 20); 

    updateUserSongChart(data);
});

//Updates user song chart with given data
function updateUserSongChart(new_data) {
  
  //update the scales
  xscale.domain([0, d3.max(new_data, (d) => d.playCount)]);
  yscale.domain(new_data.map((d, i) => `${d.artistName} - ${d.songName} - #${i+1}`)); //Mapping on artist and song name
  
  //render the axis
  g_xaxis.call(xaxis);
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
  createLabels(userSongBarChartSVG, new_data, labelY, labelX);
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
  //Bron http://bl.ocks.org/hwangmoretime/c2c7128c5226f9199f87
}

//Creates the labels on top of the bars that display the amount of listens per song
function createLabels(userSongBarChartSVG, new_data, labelY, labelX) {
    //DATA JOIN
    const labels = userSongBarChartSVG.selectAll(".playCountLabel").data(new_data).join(
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
          .transition().delay(function(d, i) {//Animation where the labels fade in one by one
            return i * 50;
          })
            .style("opacity", 1)
            .text((d) => d.playCount);
}

//INTERACTION

//Changes the amount of top songs displayed
d3.select(filterAmountOfSongs).on("input", function() {
  const newSize = d3.select(this).property("value");  
    
  if(newSize => 5 && newSize <= 20) {
      const filtered_data = data.slice(0, newSize);//Cuts off the rows that are below newSize 
      updateUserSongChart(filtered_data); //Update the chart with all the filtered data
  } else {
      updateUserSongChart(data); //Update the chart with all the data
  }
});