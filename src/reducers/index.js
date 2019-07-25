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
      ...initialState,
      isLoading: false
    }
  };
  return reducer[type] || state;
};

const rootReducer = combineReducers({
  user: userReducer
});

export default rootReducer;
