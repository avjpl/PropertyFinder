'use strict';

import SearchResults from '../SearchResults';
import { urlForQueryAndPage } from '../helpers';
import styles from './StyleSheet';

import React, {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableHighlight,
  ActivityIndicatorIOS,
  Image,
  Component
} from 'react-native';

class SearchPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchString: 'london',
      isLoading: false,
      message: ''
    };
  }

  onSearchTextChanged = (event) => {
    this.setState({searchString: event.nativeEvent.text});
  }

  onSearchPressed = () => {
    const query = urlForQueryAndPage('place_name', this.state.searchString, 1);
    this._executeQuery(query);
  }

  onLocationPressed = () => {
    navigator.geolocation.getCurrentPosition(
        location => {
        var search = location.coords.latitude + ',' + location.coords.longitude;
        this.setState({ searchString: search });
        var query = urlForQueryAndPage('centre_point', search, 1);
        this._executeQuery(query);
      },
        error => {
        this.setState({
          message: 'There was a problem with obtaining your location: ' + error
        });
      });
  }

  async _executeQuery(query) {
    let response;
    let responseData;

    try {
      response = await fetch(query);
      responseData = await response.json()
    } catch (e) {
      console.log(e);
      this.setState({
        isLoading: false,
        message: `Something bad happened ${error}`
      });
    }

    this._handleResponse(responseData.response);

    this.setState({isLoading: true});
  }

  _handleResponse(response) {
    this.setState({isLoading: false, message: ''});
    if (response.application_response_code.substr(0, 1) === '1') {
      //console.log(`Properties found ${response.listings.length}`);
      this.props.navigator.push({
        title: 'Results',
        component: SearchResults,
        passProps: {listings: response.listings}
      });
    } else {
      this.setState({message: 'Location not recognized; please try again'});
    }
  }

  render() {
    const spinner = this.state.isLoading ? (<ActivityIndicatorIOS hidden='true' size='large'/>) : (<View />)

    return (
      <View style={styles.container}>
        <Text style={styles.description}>Search for houses to buy!</Text>
        <Text style={styles.description}>Search by place-name or search near your location</Text>
        <View style={styles.flowRight}>
          <TextInput
            style={styles.searchInput}
            value={this.state.searchString}
            onChange={this.onSearchTextChanged}
            placeholder='Search via name or postcode'/>
          <TouchableHighlight style={styles.button}
                              underlayColor='#99d9f4'
                              onPress={this.onSearchPressed}
                              onPress={this.onLocationPressed}>
            <Text style={styles.buttonText}>Go</Text>
          </TouchableHighlight>
        </View>
        <TouchableHighlight style={styles.button} underlayColor='#99d9f4'>
          <Text style={styles.buttonText}>Location</Text>
        </TouchableHighlight>
        <Image source={require('image!house')} style={styles.image}/>
        {spinner}
        <Text style={styles.description}>{this.state.message}</Text>
      </View>
    );
  }
}

export default SearchPage;