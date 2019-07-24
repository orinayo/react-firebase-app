import * as actionTypes from '../actions/types';
import { combineReducers } from 'redux';

const initialState = { currentUser: null, isLoading: true };

const user_reducer = (state = initialState, { type, payload }) => {
  const reducer = {
    [actionTypes.SET_USER]: {
      currentUser: payload.currentUser,
      isLoading: false
    }
  };
  return reducer[type] || state;
};

const rootReducer = combineReducers({
  user: user_reducer
});

export default rootReducer;
