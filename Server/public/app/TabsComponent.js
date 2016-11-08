import React from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';
// From https://github.com/oliviertassinari/react-swipeable-views
import SwipeableViews from 'react-swipeable-views';

class TabsComponent extends React.Component {
    constructor (props) {
      super (props);
      this.state = {
        slideIndex: 0,
      };

      this.handleChange = this.handleChange.bind (this);
    }

    handleChange (value) {
      this.setState({
        slideIndex: value,
      });
    };

    render () {
      return (
        <div>
          <Tabs
            onChange={this.handleChange}
            value={this.state.slideIndex}
          >
            <Tab label="Tab One" value={0} />
            <Tab label="Tab Two" value={1} />
            <Tab label="Tab Three" value={2} />
          </Tabs>
          <SwipeableViews
            index={this.state.slideIndex}
            onChangeIndex={this.handleChange}
          >
            <div>
              <h2>Tabs with slide effect</h2>
              Swipe to see the next slide.<br />
            </div>
            <div>
              slide n°2
            </div>
            <div>
              slide n°3
            </div>
          </SwipeableViews>
        </div>
      );
    }
}

export default TabsComponent;