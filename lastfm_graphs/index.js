//HTML elements
let filterAmountOfSongs = document.querySelector("#filterAmountOfSongs");
let filterPeriod = document.querySelector("#filterPeriod");
let givenUserName = document.querySelector("#givenUserName");
let filterSongName = document.querySelector("#filterSongName");//



const margin = {top: 0, bottom: 20, left: 350, right: 20};
const width = 525 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

// Creates sources <svg> element
const svg = d3.select('body').append('svg')
.attr('width', width+margin.left+margin.right)
.attr('height', height+margin.top+margin.bottom);

// Group used to enforce margin
const g = svg.append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Global variable for all data
let data;

// Scales setup
const xscale = d3.scaleLinear().range([0, width]);//playCount
const yscale = d3.scaleBand().rangeRound([0, height]).paddingInner(0.3);//songName

// Axis setup
const xaxis = d3.axisTop().scale(xscale);
const g_xaxis = g.append('g').attr('class','x axis')
  .attr("style", "visibility:hidden");//Hidden cause I want the playCount to appear on the bars !!!
const yaxis = d3.axisLeft().scale(yscale);
const g_yaxis = g.append('g').attr('class','y axis');




//Reads json file
d3.json('./lastfm.json').then((json) => {
    //Gets the last array (favorite songs from user)
    data = json[4];

    givenUserName.textContent = data[0].userName;
    //Sorts dataset from highest playCount to lowest playCount (so decending)
    data = data.sort(function(a, b) { return b.playCount - a.playCount });
    
    update(data);
});


function update(new_data) {
  
  //update the scales
  xscale.domain([0, d3.max(new_data, (d) => d.playCount)]);
  yscale.domain(new_data.map((d) => `${d.artistName} - ${d.songName}`)); //Mapping on artist and song name

  //render the axis
  g_xaxis.call(xaxis);
  g_yaxis.call(yaxis);

  // Render the chart with new data

  // DATA JOIN
  const rect = g.selectAll('rect').data(new_data).join(
    // ENTER 
    // new DOM elements
    (enter) => {
      const rect_enter = enter.append('rect').attr('x', 0);
      return rect_enter;
    },
    // UPDATE
    // update existing DOM elements
    (update) => update,
    // EXIT
    // removes DOM elements that aren't associated with data
    (exit) => exit.remove()
  );

  //quantizeScale, where bars have different colors depending on playCount
  let quantizeScale = d3.scaleQuantize()
    .domain([0, 50])
    //.domain(d3.extent(data))//Takes the length of the dataset
      .range(['red', 'orange', 'yellow', 'green', "blue"]);

  rect
    .attr('height', yscale.bandwidth())
    .transition()
      .ease(d3.easeElastic)//Animation when the amount of shown songs gets changed
      .attr('y', (d) => yscale(`${d.artistName} - ${d.songName}`))
    .style('fill', function(d, index) {
      return quantizeScale(index);
    })
    .transition()//Animation when the bars appear
      .ease(d3.easeBack)
      .delay(function(d, i) {
        return i * 40;
      })
      .attr('width', (d) => xscale(d.playCount));

  // WIP add image next to the rect above
  const image = g.selectAll("image")
    .data(new_data)
    .enter().append("svg:image")
      .attr("xlink:href", (d) => d.image["#text"])//gets image url
      .attr("x", -13)
      .attr("y", (d) => yscale(`${d.artistName} - ${d.songName}`))
      .attr("width", yscale.bandwidth())
      .attr("height", yscale.bandwidth());
  //Bron http://bl.ocks.org/hwangmoretime/c2c7128c5226f9199f87



  g.selectAll("text")
  .data(new_data)
  .enter().append(text)
        .text(function(d) {
          return d.playCount;
        })
          .attr("class", "countLabel")
          .attr("x", 10)//
          .attr("y", 0)
  //http://jsfiddle.net/enigmarm/3HL4a/13/
}



//INTERACTIVITY

d3.select(filterAmountOfSongs).on("change", function() {
  const newSize = d3.select(this).property("value");  
    
  if(newSize > 1 && newSize <= 50) {
      const filtered_data = data.slice(0, newSize); 
      update(filtered_data);
  } else {
      update(data); //Update the chart with all the data
  }
});

d3.select(filterAmountOfSongs).on("input", function() {
  const newSize = d3.select(this).property("value");  
    
  if(newSize > 1 && newSize <= 50) {
      const filtered_data = data.slice(0, newSize); 
      update(filtered_data);
  } else {
      update(data); //Update the chart with all the data
  }
});







//Filters on a specific user
// d3.select(filterUser).on("input", function() {
//     const newUser = d3.select(this).property("value");
//     //If the given user is in de dataset...
//     if (data.filter(e => e.userName === newUser).length > 0) {
//         const filtered_data = data.filter((d) => d.userName === newUser);
//         update(filtered_data);
//     } else {
//         update(data); //Update the chart with all the data we have
//     }
// });

//Filters on a specific period
// d3.select(filterPeriod).on("input", function() {

// });
