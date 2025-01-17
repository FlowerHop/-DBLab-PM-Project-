// import React from 'react';
// import ReactDOM from 'react-dom';
import RecordBox from './RecordBox.js';
import PatientBox from './PatientBox.js';
import ManagementBox from './ManagementBox.js'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';

// import MyAwesomeReactComponent from './MyAwesomeReactComponent';

// class App extends React.Component {
//   constructor (props) {
//     super (props);
//     this.state = {

//     };
//   }
//   render() {
//     return (
//       <RecordBox url='/api/patients_status' pollInterval={2000}>        
//       </RecordBox>
//     );
//   }
// }
// ReactDOM.render (<App />, document.getElementById ('app'));
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// import { render } from 'react-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

class App extends Component {
  handleSelect(index, last) {
    console.log('Selected tab: ' + index + ', Last tab: ' + last);
  }

  render() {
    // Tabs.setUseDefaultStyles(false); // default styles
    return (
      // {
      //   <Tabs/> is a composite component and acts as the main container.

      //   `onSelect` is called whenever a tab is selected. The handler for
      //   this function will be passed the current index as well as the last index.

      //   `selectedIndex` is the tab to select when first rendered. By default
      //   the first (index 0) tab will be selected.

      //   `forceRenderTabPanel` By default this react-tabs will only render the selected
      //   tab's contents. Setting `forceRenderTabPanel` to `true` allows you to override the
      //   default behavior, which may be useful in some circumstances (such as animating between tabs).

      // }
      <MuiThemeProvider>
      <Tabs onSelect={this.handleSelect} selectedIndex={1}>

        {/*
          <TabList/> is a composit component and is the container for the <Tab/>s.
        */}

        <TabList>

          {/*
            <Tab/> is the actual tab component that users will interact with.

            Selecting a tab can be done by either clicking with the mouse,
            or by using the keyboard tab to give focus then navigating with
            the arrow keys (right/down to select tab to the right of selected,
            left/up to select tab to the left of selected).

            The content of the <Tab/> (this.props.children) will be shown as the label.
          */}

          <Tab>Home</Tab>
          <Tab>Patients</Tab>
          <Tab>Health Providers</Tab>
          <Tab>Devices Management</Tab>
        </TabList>

        {/*
          <TabPanel/> is the content for the tab.

          There should be an equal number of <Tab/> and <TabPanel/> components.
          <Tab/> and <TabPanel/> components are tied together by the order in
          which they appear. The first (index 0) <Tab/> will be associated with
          the <TabPanel/> of the same index. Running this example when
          `selectedIndex` is 0 the tab with the label "Foo" will be selected
          and the content shown will be "Hello from Foo".

          As with <Tab/> the content of <TabPanel/> will be shown as the content.
        */}

        <TabPanel>
          <RecordBox url='/api/patients_status' pollInterval={2000}>        
          </RecordBox>
        </TabPanel>
        <TabPanel>
          <PatientBox/>
        </TabPanel>
        <TabPanel>
          <h2>Still Working...</h2>
        </TabPanel>
        <TabPanel>
          <ManagementBox pollInterval={2000}/>
        </TabPanel>
      </Tabs>
      </MuiThemeProvider>
    );
  }
}

ReactDOM.render (<App />, document.getElementById ('app'));