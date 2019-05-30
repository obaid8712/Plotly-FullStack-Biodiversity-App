function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
    // Use d3 to select the panel with id of `#sample-metadata`
    var meta_panel = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    meta_panel.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    url=`/metadata/${sample}`;
    
    d3.json(url).then(function(data){
      Object.entries(data).forEach(([key,value])=>{
      var newData = meta_panel.append("p3");
      newData.text(`${key}: ${value}`);
      meta_panel.append("br");
    });
      
      //   Samples_Metadata.WFREQ,
    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
    buildGauge(data["WFREQ"]);
  })
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  url=`/samples/${sample}`
  d3.json(url).then(function(data){
    // @TODO: Build a Pie Chart
    // Create dict data into a new list for several data
    var listData = [];
    lcount = data.otu_ids.length;
    for (i=0; i<lcount; i++){
      var eachData = {};
      Object.entries(data).forEach(([key,value])=>{
        eachData[key] = value[i];
      });
      listData.push(eachData);
    };
    //Sort values for top 10 and slice() to grab the top 10 sample_values,
    listData.sort(function(a,b){
      return parseFloat(b.sample_values) - parseFloat(a.sample_values)
    });
    top10Data = listData.slice(0,10);
    // HINT: You will need to use 
    // otu_ids, and labels (10 each).
    var pie = [{
      values : top10Data.map(cell => cell.sample_values),
      labels : top10Data.map(cell => cell.otu_ids),
      type : "pie"
    }];

    var layout = {      
      height: 450,
      width: 450
    };
    
    Plotly.newPlot("pie",pie,layout);

    // @TODO: Build a Bubble Chart using the sample data
    var Bubble = [{
      x : data.otu_ids,
      y : data.sample_values,
      marker :{
        size : data.sample_values,
        color : data.otu_ids
      },
      text : data.otu_labels,
      mode : "markers"
    }];  
  
    Plotly.newPlot('bubble',Bubble);  

});  
    
}

// @TODO: Build a Guage function using the sample data
function buildGauge(sample){
// Enter a sample and create level between 0 and 180
var level = sample * 20-10;

// Scrub meter point
var degrees = 180 - level , radius = .5;
var radians = degrees * Math.PI / 180;
var x = radius * Math.cos(radians);
var y = radius * Math.sin(radians);

// Path: may have to change to create a better triangle
var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
     pathX = String(x),
     space = ' ',
     pathY = String(y),
     pathEnd = ' Z';
var path = mainPath.concat(pathX,space,pathY,pathEnd);

var data = [{ type: 'scatter',
   x: [0], y:[0],
    marker: {size: 28, color:'850000'},
    //marker: {size: 28, color:'greys'},
    showlegend: false,
    name: 'WFREQ',
    text: sample,
    hoverinfo: 'text+name'},

{ values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9,50/9,50],
  rotation: 90,
  text: ['8-9','7-8','6-7','5-6', '4-5', '3-4', '2-3',
            '1-2', '0-1', ''],
  textinfo: 'text',
  textposition:'inside',
  marker: {colors:['rgba(14, 120, 0, .5)', 'rgba(25, 134, 50, .5)',
                         'rgba(50, 150, 80, .5)', 'rgba(100, 165, 105, .5)',
                         'rgba(125, 180, 130, .5)', 'rgba(150, 195, 155, .5)',
                         'rgba(175, 210, 180, .5)', 'rgba(200, 225, 205, .5)',
                         'rgba(225, 240, 230, .5)', 
                         'rgba(255, 255, 255, 0)']},
  labels: ['161-180', '141-160', '121-140', '101-120', '81-100', '61-80', '41-60','21-40','0-20',''],
  hoverinfo: 'label',
  hole: .5,
  type: 'pie',
  showlegend: false
}];

var layout = {
  shapes:[{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }],
  title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
  height: 500,
  width: 500,
  xaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]},
  yaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]}
};

Plotly.newPlot('gauge', data, layout);
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
