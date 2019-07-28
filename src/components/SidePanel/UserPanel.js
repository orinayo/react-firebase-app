import React from 'react';
import {
  Grid,
  Header,
  Icon,
  Dropdown,
  Image,
  Modal,
  Input,
  Button
} from 'semantic-ui-react';
import AvatarEditor from 'react-avatar-editor';
import firebase from '../../firebase';

class UserPanel extends React.Component {
  state = {
    user: this.props.currentUser,
    modal: false,
    file: null,
    previewImage: '',
    croppedImage: '',
    uploadedCroppedImage: '',
    blob: '',
    metadata: {
      contentType: 'image/jpeg'
    },
    storageRef: firebase.storage().ref(),
    usersRef: firebase.database().ref('users'),
    userRef: firebase.auth().currentUser
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  dropdownOptions = () => [
    {
      key: 'user',
      text: (
        <span>
          Signed in as <strong>{this.state.user.displayName}</strong>
        </span>
      ),
      disabled: true
    },
    {
      key: 'avatar',
      text: <span onClick={this.openModal}>Change Avatar</span>
    },
    {
      key: 'signout',
      text: <span onClick={this.handleSignout}>Sign Out</span>
    }
  ];

  uploadCroppedImage = () => {
    const {
      storageRef,
      userRef: { uid },
      blob,
      metadata
    } = this.state;
    storageRef
      .child(`avatars/users/${uid}`)
      .put(blob, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(downloadURL => {
          this.setState({ uploadedCroppedImage: downloadURL }, () =>
            this.changeAvatar()
          );
        });
      });
  };

  changeAvatar = () => {
    const {
      user: { uid },
      userRef,
      uploadedCroppedImage,
      usersRef
    } = this.state;
    userRef
      .updateProfile({
        photoURL: uploadedCroppedImage
      })
      .then(() => {
        this.closeModal();
      })
      .catch(reason => console.error(reason));

    usersRef
      .child(uid)
      .update({ avatar: uploadedCroppedImage })
      .then(() => {
        console.log('avatar uploaded');
      })
      .catch(reason => console.error(reason));
  };

  handleChange = event => {
    const file = event.target.files[0];
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        this.setState({ previewImage: reader.result });
      });
    }
  };

  handleCropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
        const imageUrl = URL.createObjectURL(blob);
        this.setState({ croppedImage: imageUrl, blob });
      });
    }
  };

  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log('signed out!'));
  };

  render() {
    const { user, modal, previewImage, croppedImage } = this.state;
    const { primaryColor } = this.props;

    return (
      <Grid style={{ background: primaryColor }}>
        <Grid.Column>
          <Grid.Row style={{ padding: '1.2em', margin: 0 }}>
            {/* App Header */}
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <Header.Content>DevChat</Header.Content>
            </Header>

            {/* User Dropdown  */}
            <Header style={{ padding: '0.25em' }} as="h4" inverted>
              <Dropdown
                trigger={
                  <span>
                    <Image src={user.photoURL} spaced="right" avatar />
                    {user.displayName}
                  </span>
                }
                options={this.dropdownOptions()}
              />
            </Header>
          </Grid.Row>

          {/* Change User Avatar Modal */}
          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input
                onChange={this.handleChange}
                fluid
                label="New Avatar"
                name="previewImage"
                type="file"
              />
              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {previewImage && (
                      <AvatarEditor
                        ref={node => (this.avatarEditor = node)}
                        image={previewImage}
                        width={120}
                        height={120}
                        border={50}
                        scale={1.2}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {croppedImage && (
                      <Image
                        style={{ margin: '3.5em auto' }}
                        width={100}
                        height={100}
                        src={croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              <Button color="green" inverted onClick={this.uploadCroppedImage}>
                <Icon name="save" /> Change Avatar
              </Button>
              <Button color="green" inverted onClick={this.handleCropImage}>
                <Icon name="image" /> Preview
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" /> Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;
