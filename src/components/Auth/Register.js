import React, { Component } from 'react';
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon
} from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import md5 from 'md5';
import firebase from '../../firebase';

class Register extends Component {
  state = {
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    errors: [],
    loading: false,
    usersRef: firebase.database().ref('users')
  };

  isFormValid = () => {
    const errors = [];
    let error;
    if (this.isFormEmpty(this.state)) {
      error = { message: 'Fill in all fields' };
      this.setState({ errors: errors.concat(error) });
      return false;
    }
    if (this.isPasswordValid(this.state)) {
      error = { message: 'Password is invalid' };
      this.setState({ errors: errors.concat(error) });
      return false;
    }
    return true;
  };

  isPasswordValid = ({ password, passwordConfirmation }) => {
    if (password.length < 6 || passwordConfirmation.length < 6) {
      return true;
    }
    if (password !== passwordConfirmation) {
      return true;
    }
    return false;
  };

  isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation.length
    );
  };

  displayErors = errors =>
    errors.map(({ message }, i) => <p key={i}>{message}</p>);

  handleChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid()) {
      const { email, password, errors, username } = this.state;
      this.setState({ errors: [], loading: true });
      firebase
        .auth()
        .createUserWithEmailAndPassword(email.toLowerCase(), password)
        .then(createdUser => {
          console.log(createdUser);
          createdUser.user
            .updateProfile({
              displayName: username,
              photoURL: `http://gravatar.com/avatar/${md5(
                createdUser.user.email
              )}?id=identicon`
            })
            .then(() => {
              this.saveUser(createdUser).then(() => {
                console.log('user saved');
              });
              this.setState({ loading: false });
            })
            .catch(reason => {
              console.log(reason);
              this.setState({ errors: errors.concat(reason), loading: false });
            });
        })
        .catch(reason => {
          console.log(reason);
          this.setState({ errors: errors.concat(reason), loading: false });
        });
    }
  };

  saveUser = createdUser => {
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL
    });
  };

  handleInputError = (errors, inputName) => {
    return errors.some(({ message }) =>
      message.toLowerCase().includes(inputName)
    )
      ? 'error'
      : '';
  };

  render() {
    const {
      username,
      email,
      password,
      passwordConfirmation,
      errors,
      loading
    } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="orange" textAlign="center">
            <Icon name="puzzle piece" color="orange" />
            Register for DevChat
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input
                fluid
                name="username"
                icon="user"
                iconPosition="left"
                placeholder="Username"
                onChange={this.handleChange}
                type="text"
                value={username}
              />
              <Form.Input
                fluid
                name="email"
                icon="mail"
                iconPosition="left"
                placeholder="Email Address"
                onChange={this.handleChange}
                type="email"
                className={this.handleInputError(errors, 'email')}
                value={email}
              />
              <Form.Input
                fluid
                name="password"
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                onChange={this.handleChange}
                type="password"
                className={this.handleInputError(errors, 'password')}
                value={password}
              />
              <Form.Input
                fluid
                name="passwordConfirmation"
                icon="repeat"
                iconPosition="left"
                placeholder="Password Confirmation"
                onChange={this.handleChange}
                type="password"
                className={this.handleInputError(errors, 'password')}
                value={passwordConfirmation}
              />
              <Button
                disabled={loading}
                color="orange"
                fluid
                size="large"
                className={loading ? 'loading' : ''}
              >
                Submit
              </Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErors(errors)}
            </Message>
          )}
          <Message>
            Already a user? <Link to="/login">Login</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;
