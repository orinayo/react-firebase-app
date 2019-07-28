import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

const config = {
  apiKey: 'AIzaSyC9qUqVq2SDWJfXps_IoZaIiMCbJf2_b2w',
  authDomain: 'react-chat-982e5.firebaseapp.com',
  databaseURL: 'https://react-chat-982e5.firebaseio.com',
  projectId: 'react-chat-982e5',
  storageBucket: 'react-chat-982e5.appspot.com',
  messagingSenderId: '457721052746',
  appId: '1:457721052746:web:d5d844a1818593cc'
};
firebase.initializeApp(config);

export default firebase;
