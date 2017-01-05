import React from 'react';
import ReactDOM from 'react-dom';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import $ from 'jquery';

export default class ManagementBox extends React.Component {
    constructor (props) {
      super (props);
      this.state = {};
    }

    render() {
      return (
        <div className='managementBox'>
          <PlaceManagementBox pollInterval={this.props.pollInterval}>
          </PlaceManagementBox>
          <BioWatchManagementBox pollInterval={this.props.pollInterval}>
          </BioWatchManagementBox>
          
        </div>
      );
    }
}

class PlaceManagementBox extends React.Component {
    constructor (props) {
      super (props);
      this.state = {
        placeID: '',
        placeIDErrorText: 'Input text.',
        data: []
      };

      this.handleSubmit = this.handleSubmit.bind (this);
      this.pushData = this.pushData.bind (this);
      this.loadingDataFromServer = this.loadingDataFromServer.bind (this); 
    }
   
    handleSubmit (event) {
      let placeID = this.state.placeID; 
      this.pushData (placeID)
      .then (function () {
        // console.log ('push: ' + placeID);
      }.bind (this));
    }

    loadingDataFromServer () {
      $.ajax ({
        url: '/api/getPlaceList',
        dataType: 'json',
        cache: false,
        success: (data) => {
          this.setState ({data: data});
        },
        error: (xhr, status, err) => {
          // reject (err);
          console.error (status, err.toString ());
        }
      });
    }

    componentDidMount () {
      this.loadingDataFromServer ();
      this.loadingInterval = setInterval (this.loadingDataFromServer, this.props.pollInterval);
    }

    componentWillUnmount () {
      clearInterval (this.loadingInterval);
    }

    pushData (placeID) { 
      if (placeID == '' || placeID == ' ') {
      	return Promise.resolve ();
      }

      let data = {
      	"placeID": placeID
      };

      data = JSON.stringify (data);
      return new Promise ((resolve, reject) => {
        $.ajax ({
          type: 'POST', 
          url: '/api/newPlace',
          contentType: 'application/json',
          cache: false,
          data: data,
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

    render() {
      return (
        <div className='placeManagementBox'>
          <TextField
            style={{display: "block"}}
            value={this.state.placeID}
            onChange={(event) => {
              this.setState ({placeID: event.target.value});
              if (event.target.value != '') {
                this.setState ({placeIDErrorText: null});
              } else {
                this.setState ({placeIDErrorText: "Input text."});
              }
            }}
            hintText="New Place"
            errorText={this.state.placeIDErrorText}
          /> 

          <RaisedButton
            label="新增"
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
                <TableHeaderColumn colSpan="2" style={{textAlign: 'center'}}>
                </TableHeaderColumn>
              </TableRow>
              <TableRow>
                <TableHeaderColumn>No.</TableHeaderColumn>
                <TableHeaderColumn>Place</TableHeaderColumn>
              </TableRow>
            </TableHeader>

            <TableBody
              displayRowCheckbox={false}
            >
              {this.state.data.map((row, index) => (
                <TableRow key={index} selected={row.selected}> 
                  <TableRowColumn>{index+1}</TableRowColumn>               
                  <TableRowColumn>{row.placeID}</TableRowColumn>
                </TableRow>
              ))}
            </TableBody>
          <TableFooter
            adjustForCheckbox={false}
          >
            <TableRow>
              <TableHeaderColumn>No.</TableHeaderColumn>
              <TableHeaderColumn>Place</TableHeaderColumn>
            </TableRow>
            <TableRow>
              <TableHeaderColumn colSpan="2" style={{textAlign: 'center'}}>
              </TableHeaderColumn>
            </TableRow>
          </TableFooter>
        </Table>
        </div>
      );
    }
}

class BioWatchManagementBox extends React.Component {
    constructor (props) {
      super (props);
      this.state = {
        bioWatchID: '',
        bioWatchIDErrorText: 'Input text.',
        data: []
      };
      
      this.handleSubmit = this.handleSubmit.bind (this);
      this.pushData = this.pushData.bind (this);
      this.loadingDataFromServer = this.loadingDataFromServer.bind (this); 
    }
   
    handleSubmit (event) {
      let bioWatchID = this.state.bioWatchID; 
      this.pushData (bioWatchID)
      .then (function () {
        // console.log ('push: ' + bioWatchID);
      }.bind (this));
    }

    loadingDataFromServer () {
      $.ajax ({
        url: '/api/getBioWatchList',
        dataType: 'json',
        cache: false,
        success: (data) => {
          this.setState ({data: data});
        },
        error: (xhr, status, err) => {
          // reject (err);
          console.error (status, err.toString ());
        }
      });
    }

    componentDidMount () {
      this.loadingDataFromServer ();
      this.loadingInterval = setInterval (this.loadingDataFromServer, this.props.pollInterval);
    }

    componentWillUnmount () {
      clearInterval (this.loadingInterval);
    }

    pushData (bioWatchID) { 
      if (bioWatchID == '' || bioWatchID == ' ') {
      	return Promise.resolve ();
      }

      let data = {
      	"bioWatchID": bioWatchID
      };
      data = JSON.stringify (data);
      return new Promise ((resolve, reject) => {
        $.ajax ({
          type: 'POST', 
          url: '/api/newBioWatch',
          contentType: 'application/json',
          cache: false,
          data: data,
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

    render() {
      return (
        <div className='bioWatchManagementBox'>
          <TextField
            style={{display: "block"}}
            value={this.state.bioWatchID}
            onChange={(event) => {
              this.setState ({bioWatchID: event.target.value});
              if (event.target.value != '') {
                this.setState ({bioWatchIDErrorText: null});
              } else {
                this.setState ({bioWatchIDErrorText: "Input text."});
              }
            }}
            hintText="New BioWatch"
            errorText={this.state.bioWatchIDErrorText}
          /> 

          <RaisedButton
            label="新增"
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
                <TableHeaderColumn colSpan="2" style={{textAlign: 'center'}}>
                </TableHeaderColumn>
              </TableRow>
              <TableRow>
                <TableHeaderColumn>No.</TableHeaderColumn>
                <TableHeaderColumn>BioWatch</TableHeaderColumn>
              </TableRow>
            </TableHeader>

            <TableBody
              displayRowCheckbox={false}
            >
              {this.state.data.map((row, index) => (
                <TableRow key={index} selected={row.selected}> 
                  <TableRowColumn>{index+1}</TableRowColumn>               
                  <TableRowColumn>{row.bioWatchID}</TableRowColumn>
                </TableRow>
              ))}
            </TableBody>
          <TableFooter
            adjustForCheckbox={false}
          >
            <TableRow>
              <TableHeaderColumn>No.</TableHeaderColumn>
              <TableHeaderColumn>BioWatchID</TableHeaderColumn>
            </TableRow>
            <TableRow>
              <TableHeaderColumn colSpan="2" style={{textAlign: 'center'}}>
              </TableHeaderColumn>
            </TableRow>
          </TableFooter>
        </Table>
        </div>
      );
    }
}
