import * as actionTypes from './types';

export const setUser = currentUser => {
  return {
    type: actionTypes.SET_USER,
    payload: {
      currentUser
    }
  };
};
