/* eslint no-use-before-define: ["error", { "variables": false }] */

import PropTypes from 'prop-types';
import React from 'react';
import {
  Text,
  Clipboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewPropTypes,
  Dimensions, // 2019.03.20 Tony Lee
} from 'react-native';

import MessageText from './MessageText';
import MessageImage from './MessageImage';
import MessageVideo from './MessageVideo';

import Time from './Time';
import Color from './Color';

import {isSameUser, isSameDay} from './utils';

const {width} = Dimensions.get('window'); // 2019.03.20 Tony Lee

const MSG_STATUS = {
  SUCCESS: 'SUCCESS',
  PENDING: 'PENDING',
  FAIL: 'FAIL',
};

export default class Bubble extends React.Component {
  onLongPress = () => {
    if (this.props.onLongPress) {
      this.props.onLongPress(this.context, this.props.currentMessage);
    } else if (this.props.currentMessage.text) {
      const options =
        this.props.optionTitles.length > 0
          ? this.props.optionTitles.slice(0, 2)
          : ['Copy Text', 'Cancel'];
      const cancelButtonIndex = options.length - 1;
      this.context.actionSheet().showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        buttonIndex => {
          switch (buttonIndex) {
            case 0:
              Clipboard.setString(this.props.currentMessage.text);
              break;
            default:
              break;
          }
        },
      );
    }
  };

  handleBubbleToNext() {
    if (
      isSameUser(this.props.currentMessage, this.props.nextMessage) &&
      isSameDay(this.props.currentMessage, this.props.nextMessage)
    ) {
      return StyleSheet.flatten([
        styles[this.props.position].containerToNext,
        this.props.containerToNextStyle[this.props.position],
      ]);
    }
    return null;
  }

  handleBubbleToPrevious() {
    if (
      isSameUser(this.props.currentMessage, this.props.previousMessage) &&
      isSameDay(this.props.currentMessage, this.props.previousMessage)
    ) {
      return StyleSheet.flatten([
        styles[this.props.position].containerToPrevious,
        this.props.containerToPreviousStyle[this.props.position],
      ]);
    }
    return null;
  }

  renderMessageText() {
    if (this.props.currentMessage.text) {
      const {containerStyle, wrapperStyle, ...messageTextProps} = this.props;
      if (this.props.renderMessageText) {
        return this.props.renderMessageText(messageTextProps);
      }
      return <MessageText {...messageTextProps} />;
    }
    return null;
  }

  renderMessageImage() {
    if (this.props.currentMessage.image) {
      const {containerStyle, wrapperStyle, ...messageImageProps} = this.props;
      if (this.props.renderMessageImage) {
        return this.props.renderMessageImage(messageImageProps);
      }
      return <MessageImage {...messageImageProps} />;
    }
    return null;
  }

  renderMessageVideo() {
    if (this.props.currentMessage.video) {
      const {containerStyle, wrapperStyle, ...messageVideoProps} = this.props;
      if (this.props.renderMessageVideo) {
        return this.props.renderMessageVideo(messageVideoProps);
      }
      return <MessageVideo {...messageVideoProps} />;
    }
    return null;
  }

  renderTicks() {
    const {currentMessage} = this.props;
    if (this.props.renderTicks) {
      return this.props.renderTicks(currentMessage);
    }
    if (currentMessage.user._id !== this.props.user._id) {
      return null;
    }
    if (
      currentMessage.sent ||
      currentMessage.received ||
      currentMessage.pending
    ) {
      return (
        <View style={styles.tickView}>
          {currentMessage.sent && (
            <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>
          )}
          {currentMessage.received && (
            <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>
          )}
          {currentMessage.pending && (
            <Text style={[styles.tick, this.props.tickStyle]}>🕓</Text>
          )}
        </View>
      );
    }
    return null;
  }
  renderStatus() {
    if (this.props.currentMessage.status === MSG_STATUS.FAIL) {
      const {statusText} = this.props;
      const statusStyle = {
        marginVertical: 2,
        marginHorizontal: 5,
        color: 'rgb(221, 38, 75)',
        fontSize: 10,
        textAlign: 'center',
      };
      return <Text style={statusStyle}>{statusText || 'Not Delivered'}</Text>;
    }
    return null;
  }
  renderTime() {
    if (this.props.currentMessage.createdAt) {
      const {containerStyle, wrapperStyle, ...timeProps} = this.props;
      if (this.props.renderTime) {
        return this.props.renderTime(timeProps);
      }
      return <Time {...timeProps} />;
    }
    return null;
  }
  renderUsername() {
    const {currentMessage} = this.props;
    if (this.props.renderUsernameOnMessage) {
      if (currentMessage.user._id === this.props.user._id) {
        return null;
      }
      return (
        <View style={styles.usernameView}>
          <Text style={[styles.username, this.props.usernameStyle]}>
            ~ {currentMessage.user.name}
          </Text>
        </View>
      );
    }
    return null;
  }
  renderCustomView() {
    if (this.props.renderCustomView) {
      return this.props.renderCustomView(this.props);
    }
    return null;
  }
  // 2019.03.20 Tony Lee
  renderAvatar() {
    if (this.props.renderAvatar) {
      return this.props.renderAvatar(this.props);
    }
    return null;
  }
  // 2019.03.20 Tony Lee
  renderTag() {
    if (this.props.renderTag) {
      return this.props.renderTag(this.props);
    }
    return null;
  }
  // 2019.03.20 Tony Lee
  render() {
    return (
      <View
        style={[
          styles[this.props.position].container,
          this.props.containerStyle[this.props.position],
        ]}>
        {this.props.position === 'right' && (
          <View style={{justifyContent: 'flex-end'}}>
            {this.renderAvatar()}
            {this.renderStatus()}
            {this.renderTime()}
          </View>
        )}
        <View
          style={[
            styles[this.props.position].wrapper,
            this.props.wrapperStyle[this.props.position],
            this.handleBubbleToNext(),
            this.handleBubbleToPrevious(),
          ]}>
          <TouchableWithoutFeedback
            onLongPress={this.onLongPress}
            accessibilityTraits="text"
            {...this.props.touchableProps}>
            <View>
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                {this.props.tagStyle && this.props.position === 'left' && (
                  <View style={[this.props.tagStyle[this.props.position]]}>
                    {this.renderTag()}
                  </View>
                )}
                <View
                  style={{
                    flexDirection: 'column',
                    maxWidth: width / 1.5, // 2019.03.20 Tony Lee
                  }}>
                  {this.renderCustomView()}
                  {this.renderMessageImage()}
                  {this.renderMessageVideo()}
                  {this.renderMessageText()}
                </View>
                {this.props.tagStyle && this.props.position === 'right' && (
                  <View style={[this.props.tagStyle[this.props.position]]}>
                    {this.renderTag()}
                  </View>
                )}
              </View>

              <View
                style={[
                  styles[this.props.position].bottom,
                  this.props.bottomContainerStyle[this.props.position],
                ]}>
                {this.renderUsername()}
                {this.renderTicks()}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
        {this.props.position === 'left' && (
          <View style={{justifyContent: 'flex-end'}}>
            {this.renderAvatar()}
            {this.renderTime()}
          </View>
        )}
      </View>
    );
  }
}
const styles = {
  left: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end', // 2019.03.22 Howie, before {alignItems: 'flex-start'}
      flexDirection: 'row',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: Color.leftBubbleBackground,
      marginRight: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomLeftRadius: 3,
    },
    containerToPrevious: {
      borderTopLeftRadius: 3,
    },
    bottom: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
  }),
  right: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end',
      flexDirection: 'row', // 2019.03.20 Tony Lee
      justifyContent: 'flex-end', // 2019.03.22 Howie, to make the align of whole content correct
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: Color.defaultBlue,
      marginLeft: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomRightRadius: 3,
    },
    containerToPrevious: {
      borderTopRightRadius: 3,
    },
    bottom: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
  }),
  tick: {
    fontSize: 10,
    backgroundColor: Color.backgroundTransparent,
    color: Color.white,
  },
  tickView: {
    flexDirection: 'row',
    marginRight: 10,
  },
  username: {
    top: -3,
    left: 0,
    fontSize: 12,
    backgroundColor: 'transparent',
    color: '#aaa',
  },
  usernameView: {
    flexDirection: 'row',
    marginHorizontal: 10,
  },
};
Bubble.contextTypes = {
  actionSheet: PropTypes.func,
};

Bubble.defaultProps = {
  touchableProps: {},
  onLongPress: null,
  renderMessageImage: null,
  renderMessageVideo: null,
  renderMessageText: null,
  renderCustomView: null,
  renderUsername: null,
  renderAvatar: null,
  renderTag: null,
  renderTicks: null,
  renderTime: null,
  statusText: '',
  position: 'left',
  optionTitles: ['Copy Text', 'Cancel'],
  currentMessage: {
    text: null,
    createdAt: null,
    image: null,
  },
  nextMessage: {},
  previousMessage: {},
  containerStyle: {},
  wrapperStyle: {},
  bottomContainerStyle: {},
  tickStyle: {},
  usernameStyle: {},
  containerToNextStyle: {},
  containerToPreviousStyle: {},
};

Bubble.propTypes = {
  user: PropTypes.object.isRequired,
  touchableProps: PropTypes.object,
  onLongPress: PropTypes.func,
  renderMessageImage: PropTypes.func,
  renderMessageVideo: PropTypes.func,
  renderMessageText: PropTypes.func,
  renderCustomView: PropTypes.func,
  renderUsernameOnMessage: PropTypes.bool,
  renderUsername: PropTypes.func,
  renderAvatar: PropTypes.func,
  renderTag: PropTypes.func,
  renderTime: PropTypes.func,
  renderTicks: PropTypes.func,
  statusText: PropTypes.string,
  position: PropTypes.oneOf(['left', 'right']),
  optionTitles: PropTypes.arrayOf(PropTypes.string),
  currentMessage: PropTypes.object,
  nextMessage: PropTypes.object,
  previousMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  wrapperStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  bottomContainerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  tickStyle: Text.propTypes.style,
  usernameStyle: Text.propTypes.style,
  containerToNextStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  containerToPreviousStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
};
