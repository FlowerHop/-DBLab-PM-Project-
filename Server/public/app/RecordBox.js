import React from 'react';
import $ from 'jquery';

export default class RecordBox extends React.Component {
    constructor (props) {
      super (props);
      this.state = {
        data: [],
      };
      this.loadingDataFromServer = this.loadingDataFromServer.bind (this);
    }

    loadingDataFromServer () {
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
    }

    componentDidMount () {
      this.loadingDataFromServer ();
      this.loadingInterval = setInterval (this.loadingDataFromServer, this.props.pollInterval);
    }

    componentWillUnmount () {
      clearInterval (this.loadingInterval);
    }
    render () {
      return (
        <div className="recordBox">
          <PlaceList data={this.state.data}/>
        </div>
      );
    }
}

class PlaceList extends React.Component {
    constructor (props) {
      super (props);
    }
    render() {
      return (
        <div className="placeList">
          {this.props.data.map ((data, index) => {
             return <Place key={index} place={data}/>;
          })}
        </div>
      );
    }
}

class Place extends React.Component {
    constructor (props) {
      super (props);
    }
    render() {
      return (
        <div className="place">
        <p>{this.props.place.placeID}</p>
        <BioWatchList devices={this.props.place.bioWatchList}/>
      </div>
      );
    }
}

class BioWatchList extends React.Component {
    constructor (props) {
      super (props);
    }
    render() {
      return (
        <div className='bioWatchList'>
          {this.props.devices.map ((device, index) => {
             return <BioWatch key={index} bioSignal={device}/>;
          })}
        </div>
      );
    }
}

class BioWatch extends React.Component {
    constructor (props) {
      super (props);
    }
    render() {
      return (
        <div className='bioWatch'>
          <div id="subject">
            <h4 id="patient">病人: {this.props.bioSignal.bioWatchID}</h4>
            <h4 id="status">{this.props.bioSignal.wear.patient.status}</h4>
          </div>
          <div id="biosignal">
            <p>脈搏: {this.props.bioSignal.wear.patient.bioSignal.pulse}</p>
          </div>
        </div>
      );
    }
}
