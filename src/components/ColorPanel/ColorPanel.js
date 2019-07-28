import React from 'react';
import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Icon,
  Label,
  Segment
} from 'semantic-ui-react';
import { SliderPicker } from 'react-color';
import { connect } from 'react-redux';
import { setColors } from '../../actions';
import firebase from '../../firebase';

class ColorPanel extends React.Component {
  state = {
    modal: false,
    user: this.props.currentUser,
    primary: '',
    secondary: '',
    usersRef: firebase.database().ref('users'),
    userColors: []
  };

  componentDidMount() {
    const { user } = this.state;
    if (user) {
      this.addListeners(user.uid);
    }
  }

  componentWillUnmount() {
    this.removeListener();
  }

  addListeners = userId => {
    const userColors = [];
    const { usersRef } = this.state;
    usersRef.child(`${userId}/colors`).on('child_added', snap => {
      userColors.unshift(snap.val());
      this.setState({
        userColors
      });
    });
  };

  removeListener = () =>
    this.state.usersRef.child(`${this.state.user.uid}/colors`).off();

  handleChangePrimary = ({ hex }) => this.setState({ primary: hex });

  handleChangeSecondary = ({ hex }) => this.setState({ secondary: hex });

  handleSaveColors = () => {
    const { primary, secondary } = this.state;
    if (primary && secondary) {
      this.saveColors(primary, secondary);
    }
  };

  saveColors = (primary, secondary) => {
    const {
      usersRef,
      user: { uid }
    } = this.state;
    usersRef
      .child(`${uid}/colors`)
      .push()
      .update({
        primary,
        secondary
      })
      .then(() => {
        this.closeModal();
      })
      .catch(reason => console.error(reason));
  };

  displayUserColors = colors =>
    colors.length > 0 &&
    colors.map(({ primary, secondary }, i) => (
      <React.Fragment key={i}>
        <Divider />
        <div
          className="color__container"
          onClick={() => this.props.setColors(primary, secondary)}
        >
          <div className="color__square" style={{ background: primary }}>
            <div className="color__overlay" style={{ background: secondary }} />
          </div>
        </div>
      </React.Fragment>
    ));

  setColors = (primary, secondary) => {};

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  render() {
    const { modal, primary, secondary, userColors } = this.state;
    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />
        {this.displayUserColors(userColors)}
        {/** Color Picker Modal */}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Choose App Colours</Modal.Header>
          <Modal.Content>
            <Segment>
              <Label content="Primary Colour" />
              <SliderPicker
                color={primary}
                onChange={this.handleChangePrimary}
              />
            </Segment>
            <Segment>
              <Label content="Secondary Colour" />
              <SliderPicker
                color={secondary}
                onChange={this.handleChangeSecondary}
              />
            </Segment>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColors}>
              <Icon name="checkmark" /> Save Colours
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}

export default connect(
  null,
  { setColors }
)(ColorPanel);
