import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.SERVERURL || 'http://127.0.0.1:8000',
});

instance.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
instance.defaults.headers.common['Access-Control-Allow-Methods'] = 'HEAD, GET, POST, PUT, PATCH, DELETE, OPTIONS';
instance.defaults.headers.common['Access-Control-Allow-Headers'] = 'Origin, Content-Type, X-Auth-Token';

const api = {
  users: {
    createUser: payload => instance.post('/users/createUser', payload).then(res => res.data),
    removeUser: payload => instance.post('/users/removeUser', payload).then(res => res.data),
  },
  lobbys: {
    createLobby: payload => instance.post('/lobbys/createLobby', payload).then(res => res.data),
    joinLobby: payload => instance.post('/lobbys/joinLobby', payload).then(res => res.data),
    leaveLobby: payload => instance.post('/lobbys/leaveLobby', payload).then(res => res.data),
    getLobby: payload => instance.get('/lobbys/publicLobby', payload).then(res => res.data),
  },
};

export default api;
