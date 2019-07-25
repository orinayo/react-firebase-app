import React, { Component, Fragment } from 'react';
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';

export default class Channels extends Component {
  state = {
    channels: [],
    modal: false,
    channelName: '',
    channelDetails: ''
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
    const { channelDetails, channelName, errors } = this.state;
    if (this.isFormValid(channelDetails, channelName)) {
      this.setState({ errors: [], loading: true });
    }
  };

  render() {
    const { channels, modal } = this.state;
    return (
      <Fragment>
        <Menu.Menu style={{ paddingBottom: '2em' }}>
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>{' '}
            &#40;{channels.length}&#41;{' '}
            <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
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
