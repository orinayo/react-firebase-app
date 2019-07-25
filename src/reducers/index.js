import { combineReducers } from 'redux';
import * as actionTypes from '../actions/types';

const initialState = { currentUser: null, isLoading: true };

const userReducer = (state = initialState, { type, payload }) => {
  const reducer = {
    [actionTypes.SET_USER]: {
      currentUser: payload ? payload.currentUser : null,
      isLoading: false
    },
    [actionTypes.CLEAR_USER]: {
      ...state,
      isLoading: false
    }
  };
  return reducer[type] || state;
};

const initialChannelState = { currentChannel: null };

const channelReducer = (state = initialChannelState, { type, payload }) => {
  const reducer = {
    [actionTypes.SET_CURRENT_CHANNEL]: {
      ...state,
      currentChannel: payload ? payload.currentChannel : null
    }
  };
  return reducer[type] || state;
};

const rootReducer = combineReducers({
  user: userReducer,
  channel: channelReducer
});

export default rootReducer;
