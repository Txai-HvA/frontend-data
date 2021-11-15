//HTML elements
let filterAmountOfSongs = document.querySelector("#filterAmountOfSongs");
let filterPeriod = document.querySelector("#filterPeriod");
let givenUserName = document.querySelector("#givenUserName");
let filterSongName = document.querySelector("#filterSongName");//

//
const margin = {top: 0, bottom: 0, left: 320, right: 0};
const width = 800 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

// Creates sources <svg> element
const userSongBarChartSVG = d3.select('body').append('svg')
.attr('width', width+margin.left+margin.right)
.attr('height', height+margin.top+margin.bottom)
.attr("class", "userSongBarChart");

// Group used to enforce margin
const g = userSongBarChartSVG.append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Scales setup
const xscale = d3.scaleLinear().range([0, width]);//playCount
const yscale = d3.scaleBand().rangeRound([0, height]).paddingInner(0.2);//songName

// Axis setup
const xaxis = d3.axisTop().scale(xscale);
const g_xaxis = g.append('g').attr('class','x axis')
  .attr("style", "visibility:hidden");//Hidden cause I want the playCount to appear on the bars !!!
const yaxis = d3.axisLeft().scale(yscale);
const g_yaxis = g.append('g').attr('class','y axis');



// Global variable for all data
let data;

//Reads json file
d3.json('./lastfm.json').then((json) => {
    //Gets the last array (favorite songs from user)
    data = json[4];

    givenUserName.textContent = data[0].userName;
    //Sorts dataset from highest playCount to lowest playCount (so decending)
    data = data.sort(function(a, b) { return b.playCount - a.playCount });
    
    //top 20
    data = data.slice(0, 20); 

    updateUserSongChart(data);
});





function updateUserSongChart(new_data) {
  
  //update the scales
  xscale.domain([0, d3.max(new_data, (d) => d.playCount)]);
  yscale.domain(new_data.map((d, i) => `${d.artistName} - ${d.songName} - #${i+1}`)); //Mapping on artist and song name

  
  //render the axis
  g_xaxis.call(xaxis);
  g_yaxis.call(yaxis);



  //
  let rectX, labelY;
  console.log(new_data.length)
  switch(new_data.length) {
      case 5: labelY = 62; rectX = 94.5; break;
      case 6: labelY = 50; rectX = 72; break;
      case 7: labelY = 42; rectX = 56; break;
      case 8: labelY = 37; rectX = 44; break;
      case 9: labelY = 32; rectX = 33.5; break;
      case 10: labelY = 27; rectX = 26.5; break;
      case 11: labelY = 25; rectX = 20.5; break;
      case 12: labelY = 22; rectX = 16; break;
      case 13: labelY = 20; rectX = 12; break;
      case 14: labelY = 19; rectX = 8; break;
      case 15: labelY = 17; rectX = 4.5; break;
      case 16: labelY = 16; rectX = 1.5; break;
      case 17: labelY = 15; rectX = 0; break;
      case 18: labelY = 13; rectX = -3.5; break;
      case 19: labelY = 13; rectX = -4; break;
      case 20: labelY = 12; rectX = -6.5; break;
  }









  
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
  let quantizeScaleBars = d3.scaleQuantize()
    .domain([0, 20])
      .range(['#a5ffef', '#cdf564', '#cb1582', '#191414', "#ffffff"]);

  rect
    .attr("class", "bar")
    .attr("x", rectX)
    .attr("rx", 2)
    .attr('height', yscale.bandwidth())//
    .transition()
      .ease(d3.easeElastic)//Animation when the amount of shown songs gets changed
      .attr('y', (d, i) => yscale(`${d.artistName} - ${d.songName} - #${i+1}`))
    .style('fill', function(d, index) {
      return quantizeScaleBars(index);
    })
    .transition()//Animation when the bars appear
      .ease(d3.easeBack)
      .delay(function(d, i) {
        return i * 40;
      })
      .attr('width', (d) => xscale(d.playCount) / 2);


      










  // DATA JOIN
  const images = g.selectAll('image').data(new_data).join(
    // ENTER 
    // new DOM elements
    (enter) => {
      const image_enter = enter.append('svg:image').attr('x', 0);
      return image_enter;
    },
    // UPDATE
    // update existing DOM elements
    (update) => update,
    // EXIT
    // removes DOM elements that aren't associated with data
    (exit) => exit.remove()
  );

  // WIP add image next to the rect above
  images.attr("xlink:href", (d) => d.image["#text"])//gets image url
      .attr("x", -38)
      .attr("y", (d, i) => yscale(`${d.artistName} - ${d.songName} - #${i+1}`))
      .attr("width", yscale.bandwidth())
      .attr("height", yscale.bandwidth());
  //Bron http://bl.ocks.org/hwangmoretime/c2c7128c5226f9199f87


  




    // DATA JOIN
    const labels = userSongBarChartSVG.selectAll('.playCountLabel').data(new_data).join(
      // ENTER 
      // new DOM elements
      (enter) => {
        const label_enter = enter.append('svg:text').attr('x', 0);
        return label_enter;
      },
      // UPDATE
      // update existing DOM elements
      (update) => update,
      // EXIT
      // removes DOM elements that aren't associated with data
      (exit) => exit.remove()
    );

  //quantizeScale, where bars have different colors depending on playCount
  let quantizeScaleText = d3.scaleQuantize()
  .domain([0, 20])
    .range(['#cb1582', '#4100f5', '#a5ffef', '#ffffff', "#191414"]);

  // WIP add playCount labels above the bars (rect)
  labels.attr("class","playCountLabel")
          .style('fill', function(d, index) {
            return quantizeScaleText(index);
          })
          .attr("x", (d) => xscale(d.playCount))
          .attr('y', (d, i) => yscale(`${d.artistName} - ${d.songName} - #${i+1}`)  + labelY)
          .attr("dy", ".75em")
          .transition().delay(function(d, i) {
            return i * 50;
          })
            .style("opacity", 1)
            .text((d) => d.playCount);

}






//INTERACTIVITY

d3.select(filterAmountOfSongs).on("change", function() {
  const newSize = d3.select(this).property("value");  
    
  if(newSize => 5 && newSize <= 20) {
      const filtered_data = data.slice(0, newSize); 
      updateUserSongChart(filtered_data);
  } else {
      updateUserSongChart(data); //Update the chart with all the data
  }
});

d3.select(filterAmountOfSongs).on("input", function() {
  const newSize = d3.select(this).property("value");  
    
  if(newSize => 5 && newSize <= 20) {
      const filtered_data = data.slice(0, newSize); 
      updateUserSongChart(filtered_data);
  } else {
      updateUserSongChart(data); //Update the chart with all the data
  }
});