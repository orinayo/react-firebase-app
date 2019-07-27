import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Label
} from 'semantic-ui-react';
import { setCurrentChannel, setPrivateChannel } from '../../actions';
import firebase from '../../firebase';

class Channels extends Component {
  state = {
    user: this.props.currentUser,
    activeChannel: '',
    notifications: [],
    channels: [],
    modal: false,
    firstLoad: true,
    channel: null,
    channelName: '',
    channelDetails: '',
    channelsRef: firebase.database().ref('channels'),
    messagesRef: firebase.database().ref('messages')
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    const loadedChannels = [];
    this.state.channelsRef.on('child_added', snap => {
      loadedChannels.push(snap.val());
      this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
      this.addNotificationListener(snap.key);
    });
  };

  addNotificationListener = channelId => {
    const { messagesRef, channel, notifications } = this.state;
    messagesRef.child(channelId).on('value', snap => {
      if (channel) {
        this.handleNotifications(channelId, channel.id, notifications, snap);
      }
    });
  };

  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;

    const index = notifications.findIndex(
      notification => notification.id === channelId
    );

    if (index !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total;
        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren();
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0
      });
    }
    this.setState({ notifications });
  };

  removeListeners = () => {
    this.state.channelsRef.off();
  };

  setFirstChannel = () => {
    const { channels, firstLoad } = this.state;
    const [firstChannel] = channels;
    if (firstLoad && channels.length > 0) {
      this.props.setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
      this.setState({ channel: firstChannel });
    }
    this.setState({ firstLoad: false });
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  isFormValid = (channelDetails, channelName) => channelDetails && channelName;

  handleSubmit = event => {
    event.preventDefault();
    const { channelDetails, channelName } = this.state;
    if (this.isFormValid(channelDetails, channelName)) {
      this.addChannel();
    }
  };

  addChannel = () => {
    const { channelsRef, channelDetails, channelName, user } = this.state;
    const { key } = channelsRef.push();
    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL
      }
    };

    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelDetails: '', channelName: '' });
        this.closeModal();
      })
      .catch(reason => console.error(reason));
  };

  displayChannels = channels =>
    channels.length > 0 &&
    channels.map(channel => (
      <Menu.Item
        key={channel.id}
        name={channel.name}
        onClick={() => this.changeChannel(channel)}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.activeChannel}
      >
        {this.getNotificationCount(channel) && (
          <Label color="red">{this.getNotificationCount(channel)}</Label>
        )}
        # {channel.name}
      </Menu.Item>
    ));

  getNotificationCount = channel => {
    let count = 0;
    const { notifications } = this.state;
    notifications.forEach(notification => {
      if (notification.id === channel.id) {
        count = notification.count;
      }
    });

    if (count > 0) return count;
  };

  changeChannel = channel => {
    const { setCurrentChannel, setPrivateChannel } = this.props;
    this.setActiveChannel(channel);
    this.clearNotifications();
    setCurrentChannel(channel);
    setPrivateChannel(false);
    this.setState({ channel });
  };

  clearNotifications = () => {
    const { notifications, channel } = this.state;
    const index = notifications.findIndex(({ id }) => id === channel.id);

    if (index !== -1) {
      const updatedNotifications = [...notifications];
      updatedNotifications[index].total = notifications[index].lastKnownTotal;
      updatedNotifications[index].count = 0;
      this.setState({ notifications: updatedNotifications });
    }
  };

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  render() {
    const { channels, modal } = this.state;
    return (
      <Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>{' '}
            &#40;{channels.length}&#41;{' '}
            <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {this.displayChannels(channels)}
        </Menu.Menu>
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" />
              Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" />
              Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Fragment>
    );
  }
}

export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(Channels);
