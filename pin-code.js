import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { TextInput, View, Text } from 'react-native';

import { codePinStyles } from './pin-code-style';

class CodePin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: '',
      code: new Array(props.number).fill(''),
      edit: 0
    };

    this.textInputsRefs = [];
  }

  clean = () => {
    this.setState({
      code: new Array(this.props.number).fill(''),
      edit: 0
    });
    this.focus(0);
  };

  focus = (id) => {
      const length = this.textInputsRefs.length;
      if (id >= 0 && id <= length) {
        this.textInputsRefs[id].focus();
      } else {
        console.log("--------nothing");
        this.clean();
      }
  };

  isFocus = id => {
    let newCode = this.state.code.slice();

    for (let i = 0; i < newCode.length; i++)
      if (i >= id) newCode[i] = '';

    this.setState({
      code: newCode,
      edit: id
    });
  };

  getDecryptedData = (pin, stringForDecryption, decrypt) => {
    if(!pin || !stringForDecryption || !decrypt) return false;
    let result;

    try {
      result = decrypt(stringForDecryption, pin);
    } catch (error) {
      result = false;
    }
    return result;
  }

  handleEdit = (number, id) => {
    const newCode = this.state.code.slice();
    newCode[id] = number;

    // User filling the last digit ?
    if (id === this.props.number - 1) {
      const fullStringPin = newCode.join('');
      const { decrypt, stringForDecryption } = this.props;

      const decryptedData = this.getDecryptedData(fullStringPin, stringForDecryption, decrypt);

      if (!decryptedData) {
        this.focus(0);

        this.setState({
          error: this.props.error,
          code: new Array(this.props.number).fill(''),
          edit: 0,
        });
        this.props.onError();
        return;
      } else {
        this.setState({
          error: '',
          code: newCode,
          edit: this.state.edit,
        });

        this.props.success(decryptedData);
      }

      return;
    }

    this.focus(this.state.edit + 1);

    this.setState(prevState => {
      return {
        error: '',
        code: newCode,
        edit: prevState.edit + 1
      };
    });
  };

  render() {
    const {
      text,
      number,
      success,
      pinStyle,
      textStyle,
      errorStyle,
      containerStyle,
      containerPinStyle,
      onError,
      lock,
      lockMessage,
      ...props,
    } = this.props;

    pins = [];

    for (let index = 0; index < number; index++) {
      const id = index;
      if(!lock) {
        pins.push(
          <TextInput
            accessibilityLabel={`passwordBoxNumber${index}`}
            key={id}
            ref={ref => (this.textInputsRefs[id] = ref)}
            onChangeText={text => this.handleEdit(text, id)}
            onFocus={() => this.isFocus(id)}
            value={this.state.code[id] ? this.state.code[id].toString() : ''}
            style={[codePinStyles.pin, pinStyle]}
            returnKeyType={'done'}
            autoCapitalize={'sentences'}
            autoCorrect={false}
            autoFocus={index === 0 ? true : false}
            maxLength={1}
            {...props}
          />
        );
      } else {
        pins.push(
          <View style={[codePinStyles.pinLock, pinStyle]} key={index} accessibilityLabel={`passwordFakeBoxNumber${index}`}/>
        );
      }
    }

    return (
      <View style={[codePinStyles.container, containerStyle]}>

        <Text style={[codePinStyles.text, textStyle]} accessibilityLabel={'info message'}>
          {text}
        </Text>

          {this.renderErrorOrLock(lock, lockMessage, errorStyle)}

        <View style={[codePinStyles.containerPin, containerPinStyle]}>

          {pins}

        </View>

      </View>
    );
  }

  renderErrorOrLock(lock, lockMessage, errorStyle) {
    const error = this.state.error
      ? <Text style={[codePinStyles.error, errorStyle]} accessibilityLabel={'error message'}>
          {this.state.error}
        </Text>
      : null;

    const lockMessageView = lock
      ? <Text style={[codePinStyles.error, errorStyle]} accessibilityLabel={'lock error message'}>
          {lockMessage}
        </Text>
      : null;

    if (lockMessageView != null) {
      return lockMessageView;
    } else {
      return error;
    }
  }
}

CodePin.propTypes = {
  stringForDecryption: PropTypes.string.isRequired,
  decrypt: PropTypes.func.isRequired,
  success: PropTypes.func.isRequired,
  number: PropTypes.number,
  pinStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  containerPinStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  errorStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
};

CodePin.defaultProps = {
  number: 4,
  text: 'Pin code',
  error: 'Bad pin code.',
  pinStyle: {},
  containerPinStyle: {},
  containerStyle: {},
  textStyle: {},
  errorStyle: {},
  lock: false,
};

export default CodePin;
