import React from 'react';
import * as d3 from "d3";
import $ from 'jquery';

export default class PatientBox extends React.Component {
  constructor (props) {
    super (props);
    this.state = {
      patientsID: '03', 
      startTime: '0', 
      endTime: '100000000000000000'
    };

    this.handleChange = this.handleChange.bind (this);
    this.handleSubmit = this.handleSubmit.bind (this);
    this.loadingDataFromServer = this.loadingDataFromServer.bind (this);
  }

  handleChange (event) {
   	switch (event.target.id) {
   	  case "patients_id":
   	    this.setState ({patientsID: event.target.value});
   	    break;
   	  case "start_time":
   	    this.setState ({startTime: event.target.value});
   	    break;
   	  case "end_time":
   	    this.setState ({endTime: event.target.value});
   	    break;
   	}
  }

  handleSubmit (event) {
   	// console.log (this.state);
    // input -> draw
    var patientsID = this.state.patientsID; // now patientsID equals bioWatchID
    var startTime = this.state.startTime;
    var endTime = this.state.endTime;
     
    this.loadingDataFromServer ('/api/bioSignals/' + patientsID + '/' + startTime + '/' + endTime)
    .then (function (data) {
      if (this.lineChart === undefined) {
        this.lineChart = new LineChart ();
      }

      data = JSON.parse (data);
      this.lineChart.draw (data);
    }.bind (this));
  }

  render () {
    return (
      <div className='patientBox'>
       <input type="text" id="patients_id"
         placeholder="Patient ID"
         value={this.state.patientsID}
         onChange={this.handleChange} />
       <input type="text" id="start_time"
         placeholder="Start Time"
         value={this.state.startTime}
         onChange={this.handleChange} />
       <input type="text" id="end_time"
         placeholder="End Time"
         value={this.state.endTime}
         onChange={this.handleChange} />
       <button onClick={this.handleSubmit}>Submit</button>
       <svg width="960" height="500"></svg>
      </div>
    );
  }

  loadingDataFromServer (url) {
    return new Promise ((resolve, reject) => {
      $.ajax ({
        url: url,
        dataType: 'json',
        cache: false,
        success: (data) => {
          resolve (data);
        },
        error: (xhr, status, err) => {
          reject (err);
          // console.error (this.props.url, status, err.toString ());
        }
      });
    });
  }
}

class LineChart {
  constructor () {
    this.parseTime = d3.timeParse ("%Y-%m-%d %H:%M:%S");
    this.svg = d3.select ("svg");
    //this.initSVG = this.initSVG.bind (this);
  }

  draw (data) {   
    this.initSVG ();
    this.x.domain (d3.extent (data, (d) => { 
      var date = new Date (d.dateAndTime);
      var year = date.getFullYear ();
      var month = date.getMonth ();
      var day = date.getDate ();
      var hour = date.getHours ();
      var minute = date.getMinutes ();
      var second = date.getSeconds ();
      var d_str = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    
      d.dateAndTime = this.parseTime (d_str);
      return d.dateAndTime; 
    }));

    this.y.domain (d3.extent (data, (d) => {
      d.pulse = +d.pulse; 
      return +d.pulse; 
    }));     

    this.g.append ("g")
        .attr ("class", "axis axis--x")
        .attr ("transform", "translate(0," + this.height + ")")
        .call (d3.axisBottom (this.x));     

    this.g.append ("g")
        .attr ("class", "axis axis--y")
        .call (d3.axisLeft (this.y))
      .append ("text")
        .attr ("fill", "#000")
        .attr ("transform", "rotate(-90)")
        .attr ("y", 6)
        .attr ("dy", "0.71em")
        .style ("text-anchor", "end")
        .text ("Pulse");     

    this.g.append ("path")
        .datum (data)
        .attr ("class", "line")
        .attr ("d", this.line);
  }

  initSVG () {
    this.svg.selectAll ('*').remove ();
    this.margin = {top: 20, right: 20, bottom: 30, left: 50};
    this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height = +this.svg.attr ("height") - this.margin.top - this.margin.bottom;
    this.g = this.svg.append ("g").attr ("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    this.x = d3.scaleTime ()
        .rangeRound ([0, this.width]);
    this.y = d3.scaleLinear()
        .rangeRound ([this.height, 0]);
    
    this.line = d3.line ()
        .x ((d) => { 
          return this.x (d.dateAndTime); 
        })
        .y ((d) => { 
          return this.y (d.pulse);
        });
        // .curve (d3.curveStep);

  }
}
