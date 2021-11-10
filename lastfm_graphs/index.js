const margin = {top: 40, bottom: 10, left: 120, right: 20};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

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
const xscale = d3.scaleLinear().range([0, width]);
const yscale = d3.scaleBand().rangeRound([0, height]).paddingInner(0.1);

// Axis setup
const xaxis = d3.axisTop().scale(xscale);
const g_xaxis = g.append('g').attr('class','x axis');
const yaxis = d3.axisLeft().scale(yscale);
const g_yaxis = g.append('g').attr('class','y axis');

d3.json('./lastfm.json').then((json) => {
    //Gets the last array (favorite songs from user)
    data = json[4];

    //Sorts dataset from highest playCount to lowest playCount
    data = data.sort(function(a, b) { return b.playCount - a.playCount });

    update(data);
});


function update(new_data) {
  //update the scales
  xscale.domain([0, d3.max(new_data, (d) => d.playCount)]);
  yscale.domain(new_data.map((d) => d.songName));
  //render the axis
  g_xaxis.call(xaxis);
  g_yaxis.call(yaxis);


  // Render the chart with new data

  // DATA JOIN
  const rect = g.selectAll('rect').data(new_data).join(
    // ENTER 
    // new elements
    (enter) => {
      const rect_enter = enter.append('rect').attr('x', 0);
      return rect_enter;
    },
    // UPDATE
    // update existing elements
    (update) => update,
    // EXIT
    // elements that aren't associated with data
    (exit) => exit.remove()
  );

  // ENTER + UPDATE
  // both old and new elements
  // .transition() animates when the data changes
  rect.transition()
    .attr('height', yscale.bandwidth())
    .attr('width', (d) => xscale(d.playCount))
    .attr('y', (d) => yscale(d.songName))

  rect.select('title').text((d) => d.songName);
}

//INTERACTIVITY

//Shows a specific amount of records
d3.select("#filterAmountOfSongs").on("change", function() {
    const newSize = d3.select(this).property("value");  
    
    if(newSize > 1 && newSize <= 50) {
        const filtered_data = data.slice(0, newSize) 
        update(filtered_data);
    } else {
        update(data); //Update the chart with all the data we have
    }
});

//Filters on a specific user
d3.select("#filterUser").on("input", function() {
    const newUser = d3.select(this).property("value");
    //If the given user is in de dataset...
    if (data.filter(e => e.userName === newUser).length > 0) {
        const filtered_data = data.filter((d) => d.userName === newUser);
        update(filtered_data);
    } else {
        update(data); //Update the chart with all the data we have
    }
});

//Filters on a specific period
d3.select("#filterPeriod").on("input", function() {

});
