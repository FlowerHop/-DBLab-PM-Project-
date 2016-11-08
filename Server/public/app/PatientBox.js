import React from 'react';
import TimePicker from 'material-ui/TimePicker';
import DatePicker from 'material-ui/DatePicker';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import * as d3 from "d3";
import $ from 'jquery';

export default class PatientBox extends React.Component {
  constructor (props) {
    super (props);
    this.state = {
      patientsID: '', 
      startDate: null,
      startTime: null,
      endDate: null, 
      endTime: null,
      patientsIDErrorText: "Patient's ID is require.",
      data: []
    };

    this.handleChange = this.handleChange.bind (this);
    this.handleSubmit = this.handleSubmit.bind (this);
    this.loadingDataFromServer = this.loadingDataFromServer.bind (this);
  }

  handleSubmit (event) {
   	// console.log (this.state);
    // input -> draw
    let sd = this.state.startDate;
    let st = this.state.startTime;
    let ed = this.state.endDate;
    let et = this.state.endTime;

    let start = new Date ();
    start.setSeconds (st.getSeconds ());
    start.setMinutes (st.getMinutes ());
    start.setHours (st.getHours ());
    start.setDate (sd.getDate ());
    start.setFullYear (sd.getFullYear ());
    start.setMonth (sd.getMonth ());

    let end = new Date ();
    end.setSeconds (et.getSeconds ());
    end.setMinutes (et.getMinutes ());
    end.setHours (et.getHours ());
    end.setDate (ed.getDate ());
    end.setFullYear (ed.getFullYear ());
    end.setMonth (ed.getMonth ());


    var patientsID = this.state.patientsID; // now patientsID equals bioWatchID
    var startTime = start.getTime ();
    var endTime = end.getTime ();
     
    this.loadingDataFromServer ('/api/bioSignals/' + patientsID + '/' + startTime + '/' + endTime)
    .then (function (data) {
      if (this.lineChart === undefined) {
        this.lineChart = new LineChart ();
      }

      data = JSON.parse (data);
      for (let i in data) {
        data[i].dateAndTime = new Date (data[i].dateAndTime);
      }
      this.setState ({data: data});
      this.lineChart.draw (data);
    }.bind (this));
  }

  render () {
    return (
      <div className='patientBox'>

        <TextField
          value={this.state.patientsID}
          onChange={(event) => {
            this.setState ({patientsID: event.target.value});
            if (event.target.value != '') {
              this.setState ({patientsIDErrorText: null});
            } else {
              this.setState ({patientsIDErrorText: "Patient's ID is require."});
            }
          }}
          hintText="Patient's ID"
          errorText={this.state.patientsIDErrorText}
        />

        <DatePicker 
          hintText="Start Date" 
          container="inline" 
          mode="landscape" 
          value={this.state.startDate}
          onChange={(event, date) => {
            this.setState ({startDate: date});
          }}
        />
          
        <TimePicker
          format="24hr"
          hintText="Start Time 24hr Format"
          value={this.state.startTime}
          onChange={(event, time) => {
            this.setState ({startTime: time});
          }}
        />
        
        <DatePicker 
          hintText="End Date" 
          container="inline" 
          mode="landscape" 
          value={this.state.endDate}
          onChange={(event, date) => {
            this.setState ({endDate: date});
          }}
        />

        <TimePicker
          format="24hr"
          hintText="End Time 24hr Format"
          value={this.state.endTime}
          onChange={(event, time) => {
            this.setState ({endTime: time});
          }}
        />

        <RaisedButton
          label="Submit"
          labelPosition="before"
          primary={true}
          style={{margin: 12, padding: 0, fontSize: '20px'}}
          onClick={this.handleSubmit}>
        </RaisedButton>

        <Table
          maxHeight="300"
        >
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}
          >
            <TableRow>
              <TableHeaderColumn colSpan="4" style={{textAlign: 'center'}}>
              </TableHeaderColumn>
            </TableRow>
            <TableRow>
              <TableHeaderColumn>ID</TableHeaderColumn>
              <TableHeaderColumn>Pulse</TableHeaderColumn>
              <TableHeaderColumn>Time</TableHeaderColumn>
              <TableHeaderColumn>Place</TableHeaderColumn>
            </TableRow>
          </TableHeader>

          <TableBody
            displayRowCheckbox={false}
          >
            {this.state.data.map((row, index) => (
              <TableRow key={index} selected={row.selected}>
                <TableRowColumn>{this.state.patientsID}</TableRowColumn>
                <TableRowColumn>{row.pulse}</TableRowColumn>
                <TableRowColumn>{
                  row.dateAndTime.getFullYear () + '/'
                  + row.dateAndTime.getMonth () + '/'
                  + row.dateAndTime.getDate () + '-'
                  + row.dateAndTime.getHours () + ':'
                  + row.dateAndTime.getMinutes () + ':' 
                  + row.dateAndTime.getSeconds ()
                }</TableRowColumn>
                <TableRowColumn>{row.place_id}</TableRowColumn>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter
            adjustForCheckbox={false}
          >
            <TableRow>
              <TableHeaderColumn>ID</TableHeaderColumn>
              <TableHeaderColumn>Pulse</TableHeaderColumn>
              <TableHeaderColumn>Time</TableHeaderColumn>
              <TableHeaderColumn>Place</TableHeaderColumn>
            </TableRow>
            <TableRow>
              <TableHeaderColumn colSpan="4" style={{textAlign: 'center'}}>
              </TableHeaderColumn>
            </TableRow>
          </TableFooter>
        </Table>

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
