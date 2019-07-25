import * as actionTypes from './types';

export const setUser = currentUser => {
  return {
    type: actionTypes.SET_USER,
    payload: {
      currentUser
    }
  };
};

export const clearUser = () => {
  return {
    type: actionTypes.CLEAR_USER
  };
};

export const setCurrentChannel = currentChannel => {
  return {
    type: actionTypes.SET_CURRENT_CHANNEL,
    payload: {
      currentChannel
    }
  };
};
