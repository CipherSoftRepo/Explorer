import { handleResponse } from '../Shared/Helpers';

const FILES = 'Files';
const FILES_SEARCH = 'Files/Search';

export const fileService = {
  getAllRoot: getAll,
  get,
  getForParent,
  edit,
  deleteFile,
  create,
  search,
};

function getAll() {
  const requestOptions = { method: 'GET' };
  return fetch(process.env.REACT_APP_API_ROOT + FILES, requestOptions).then(
    handleResponse
  );
}

function search(searchModel) {
  const requestOptions = {
    method: 'POST',
    headers: {      
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(searchModel),
  };
  return fetch(process.env.REACT_APP_API_ROOT + FILES_SEARCH, requestOptions).then(
    handleResponse
  );
}

function getForParent(parentId) {
  const requestOptions = { method: 'GET' };
  return fetch(process.env.REACT_APP_API_ROOT + FILES + '/' + parentId + '/files', requestOptions).then(
    handleResponse
  );
}

function get(id) {
  const requestOptions = { method: 'GET' };
  return fetch(process.env.REACT_APP_API_ROOT + FILES + '/' + id, requestOptions).then(
    handleResponse
  );
}

function create(file) {
  const requestOptions = {
    method: 'POST',
    headers: {      
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(file),
  };
  return fetch(process.env.REACT_APP_API_ROOT + FILES, requestOptions).then(
    handleResponse
  );
}

function edit(id, file) {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(file),
  };
  return fetch(process.env.REACT_APP_API_ROOT + FILES + '/' + id, requestOptions).then(
    handleResponse
  );
}

function deleteFile(id) {
  const requestOptions = { method: 'DELETE' };
  return fetch(
    process.env.REACT_APP_API_ROOT + FILES + '/' + id,
    requestOptions
  ).then(handleResponse);
}
