import React from 'react';
import $ from 'jquery';

export default React.createClass ({
  loadingDataFromServer: function () {
  	$.ajax ({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function (data) {
      	this.setState ({data: data});
      }.bind (this),
      error: function (xhr, status, err) {
        console.error (this.props.url, status, err.toString ());
      }.bind (this)
  	}); 
  },
  getInitialState: function () {
  	return {data: []};
  },
  componentDidMount: function () {
  	this.loadingDataFromServer ();
  	setInterval (this.loadingDataFromServer, this.props.pollInterval);
  },
  render: function () {
  	return (
      <div className="recordBox">
        <PlaceList data={this.state.data}/>
      </div>
  	);
  }	
});

var PlaceList = React.createClass ({
  render: function () {
    return (
      <div className="placeList">
        {this.props.data.map (function (data, index) {
           return <Place key={index} place={data}/>;
        })}
      </div>
    );
  } 
});

var Place = React.createClass ({
  render: function () {
    return (
      <div className="place">
        <p>{this.props.place.inPlace}</p>
        <BioWatchList devices={this.props.place.devices}/>
      </div>
    );
  }
});

var BioWatchList = React.createClass ({
  render: function () {
    return (
      <div className='bioWatchList'>
        {this.props.devices.map (function (device, index) {
           return <BioWatch key={index} bioSignal={device}/>;
        })}
      </div>
    );
  }
});

var BioWatch = React.createClass ({
  render: function () {
  	return (
  	  <div className='bioWatch'>
  	    <h4>{this.props.bioSignal.device_id}</h4>
  	    <p>Pulse: {this.props.bioSignal.pulse}</p>
      </div>
  	);
  }
});
