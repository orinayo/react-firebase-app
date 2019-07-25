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
import firebase from '../../firebase';

class Login extends Component {
  state = {
    email: '',
    password: '',
    errors: [],
    loading: false
  };

  displayErors = errors =>
    errors.map(({ message }, i) => <p key={i}>{message}</p>);

  handleChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  isFormValid = (email, password) => email && password;

  handleSubmit = event => {
    event.preventDefault();
    const { email, password, errors } = this.state;
    if (this.isFormValid(email, password)) {
      this.setState({ errors: [], loading: true });
      firebase
        .auth()
        .signInWithEmailAndPassword(email.toLowerCase(), password)
        .then(signedInUser => {
          console.log(signedInUser);
        })
        .catch(reason => {
          console.log(reason);
          this.setState({ errors: errors.concat(reason), loading: false });
        });
    }
  };

  handleInputError = (errors, inputName) => {
    return errors.some(({ message }) =>
      message.toLowerCase().includes(inputName)
    )
      ? 'error'
      : '';
  };

  render() {
    const { email, password, errors, loading } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="violet" textAlign="center">
            <Icon name="code branch" color="violet" />
            Login to DevChat
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
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
              <Button
                disabled={loading}
                color="violet"
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
            Don't have an account? <Link to="/register">Register</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Login;
