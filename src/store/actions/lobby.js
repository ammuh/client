import shortid from 'shortid';
import * as actionTypes from './actionTypes';
import socket from '../../socket';
import api from '../../api';

/**
 * Handle the LOBBY_ACTION_START action
 * @returns {Object}
 *   the data for LOBBY_ACTION_START
 */
export const lobbyActionStart = () => ({
  type: actionTypes.LOBBY_ACTION_START,
});

/**
 * Handle the CREATE_LOBBY_FAILURE action
 * @param {String} error
 *   the current application error message
 * @returns {Object}
 *   the data for CREATE_LOBBY_FAILURE
 */
export const lobbyActionFailure = error => ({
  type: actionTypes.LOBBY_ACTION_FAILURE,
  error,
});

/**
 * Handle the JOIN_TEAM_SUCCESS action
 * @param {Number} teamNumber
 *   the number of the team joined
 */
export const joinTeamSuccess = teamNumber => ({
  type: actionTypes.JOIN_TEAM_SUCCESS,
  teamNumber,
});

/**
 * Add a user to a team
 * @param {String} lid
 *   the unique lobbyid
 * @param {String} uid
 *   the unique userid
 * @param {Number} teamNumber
 *   the number of the team to join
 */
export const joinTeam = (lid, teamNumber, uid) => (dispatch) => {
  dispatch(lobbyActionStart());
  const data = { lid, teamNumber, uid };
  try {
    socket.joinTeam(data);
    localStorage.setItem('teamNumber', teamNumber);
    dispatch(joinTeamSuccess(teamNumber));
  } catch (e) {
    dispatch(lobbyActionFailure(e));
  }
};

export const joinTeamAuto = () => (dispatch) => {
  const lid = localStorage.getItem('lid');
  const teamNumber = localStorage.getItem('teamNumber');
  const uid = localStorage.getItem('uid');
  if (lid !== null && teamNumber !== null && uid !== null) {
    dispatch(joinTeam(lid, teamNumber, uid));
  }
};

/**
 * Handle the CREATE_LOBBY_SUCCESS action
 * @param {String} lid
 *   the unique lobbyid
 * @returns {Object}
 *   the data for CREATE_LOBBY_SUCCESS
 */
export const createLobbySuccess = () => ({
  type: actionTypes.CREATE_LOBBY_SUCCESS,
});

/**
 * Handle the JOIN_LOBBY_SUCCESS action
 * @param {String} lid
 *   the unique lobbyid
 */
export const joinLobbySuccess = lid => ({
  type: actionTypes.JOIN_LOBBY_SUCCESS,
  lid,
});

/**
 * Add a user to a lobby
 * @param {String} lid
 *   the unique lobbyid
 * @param {String} uid
 *   the unique userid of the user joining the lobby
 */
export const joinLobby = (lid, uid) => (dispatch) => {
  dispatch(lobbyActionStart());
  const data = { lid, uid };
  socket.connect(lid)
    .then(() => {
      socket.joinLobby(data);
      localStorage.setItem('lid', lid);
      dispatch(joinLobbySuccess(lid));
      dispatch(joinTeamAuto());
    })
    .catch(e => dispatch(lobbyActionFailure(e)));
};

export const joinLobbyOnly = (lid) => {
  localStorage.setItem('lid', lid);
};

/**
 * Remove a user from a lobby
 * @param {String} lid
 *   the unique lobbyid
 * @param {String} uid
 *   the unique userid
 */
export const leaveLobby = (lid, uid) => (dispatch) => {
  dispatch(lobbyActionStart());
  const data = { lid, uid };
  try {
    socket.leaveLobby(data);
    localStorage.removeItem('lid');
    localStorage.removeItem('teamNumber');
  } catch (e) {
    dispatch(lobbyActionFailure(e));
  }
};

/**
 * Join a lobby automatically if the user has valid values in localStorage
 */
export const joinLobbyAuto = () => (dispatch) => {
  const lid = localStorage.getItem('lid');
  const uid = localStorage.getItem('uid');
  if (!lid) {
    localStorage.removeItem('lid');
  } else {
    dispatch(joinLobby(lid, uid));
  }
};

/**
 * Handle the creation of a new lobby
 * @param {String} lobbyname
 *   the lobbynam entered by the lobby
 */
export const createLobby = uid => (dispatch) => {
  dispatch(lobbyActionStart());
  const lid = encodeURIComponent(shortid.generate());
  const lobbyData = { lid, uid };
  api.lobbys.createLobby(lobbyData)
    .then(() => {
      dispatch(createLobbySuccess());
      dispatch(joinLobby(lid, uid));
    })
    .catch(e => dispatch(lobbyActionFailure(e)));
};