#!/usr/bin/env node

var compareVersions = require('compare-versions')
var path = require('path')
var fs = require('fs')
var fsPromise = require('fs-es6-promise')
var OS = require('os')
var SshClient = require('node-ssh')
var JsonFile = require('jsonfile') 

const NODE_MIN_VERSION = '6.7.0'
const HOST = 'red.cse.yorku.ca'
const HOME_PATH = '/eecs/home'
const LOCAL_HOME = OS.homedir()
const APP_DATA = path.resolve(LOCAL_HOME, 'eecs-yorku')
const USER_FILE = path.resolve(APP_DATA, 'credentials.json')
const msg = {
  CONFIGURE_CREDENTIALS: 'You must configure your credentials.',
  SET_USER: 'Set your username: "eecs-yorku set-user <username>"',
  SET_PASS: 'Set your password: "eecs-yorkus set-pass <password>"',
  PROVIDE_USER: 'Provide user as second parameter',
  PROVIDE_PASS: 'Provide password as second parameter',
  INVALID_ACTION: 'Invalid action. try: submit, set-user, set-pass',
  COULDNT_WRITE: 'Attempt to write to file failed. Did you try "sudo"?',
  HOME_DIR_PERMISSION: 'Process needs permission to write to home dir',
  APP_DATA_PERMISSION: 'Process cannot write to <home-dir>/eecs-yorku',
  NODE_VERSION: 'Please install Node version 6.7.0 or higher.'
}

if(!checkNodeVersion()) process.exit();

var client = new SshClient()
var close = (msg) => { console.log(msg || 'closing..'); client.dispose(); process.exit(); }
var error = (t, m, r) => { 
  var o = Object.create({type:t, message:m}); if(r){ r(o) } else { throw o } 
}

var args = getArgs();
var user;

checkDataStorage()
.then(() =>{
  switch(args.action){
    case 'submit':
      getUser()
        .then(connect)
        .then(() => uploadSubmissions(client, args.file_names))
        .then(dir => submitFiles(dir, args.file_names))
        .then(res => close(res))
        .catch(e => close(e.message)); break;
    case 'set-user':
      setUser(args.username)
        .then(() => console.log('user set'))
        .catch(e => close(e.message)); break;
    case 'set-pass':
      setPassword(args.password)
        .then(() => console.log('password set'))  
        .catch(e => close(e.message)); break;
    default: 
      console.log(msg.INVALID_ACTION); break;
  }
}).catch(e => close(e.message))


//-----------------------


function connect(user){
  return client.connect({
    host: HOST,
    username: user.username,
    password: user.password
  })
}


function getArgs(action){
  var ar = {
    action: process.argv[2]
  }
  switch(ar.action){
    case 'submit':
      Object.assign(ar, {
        course_num: process.argv[3],
        assignment: process.argv[4],
        file_names: process.argv.slice(5)
      }); break;
    case 'set-user':
      Object.assign(ar, {
        username: process.argv[3]
      }); break;
    case 'set-pass':
      Object.assign(ar, {
        password: process.argv[3]
      }); break;
  }
  return ar;
}


function getUser(){
  return new Promise((resolve, reject) => {
    JsonFile.readFile(USER_FILE, (err, usr) => {
      if(err) {
        if(err.code == 'ENOENT') error('NO_CREDS', msg.CONFIGURE_CREDENTIALS, reject)
        else error('UNKNOWN', err, reject);
      } else {
        if(!usr || !usr.username){ error('NO_USER', msg.SET_USER, reject) }
        else if(!usr.password){ error('NO_PASS', msg.SET_PASS, reject) }
        else { 
          user = usr;
          resolve(usr); 
        }
      }
    });
  });
}


function setUser(username){
  return new Promise((resolve, reject) => {
    if(!username) err('INVALID_PARAMS', msg.PROVIDE_USER)
    JsonFile.readFile(USER_FILE, (err, usr) => {
      var newCreds = { username };
      if(usr) newCreds.password = usr.password;
      JsonFile.writeFile(USER_FILE, newCreds, (err) => {
        if(err) error('UNKNOWN', msg.COULDNT_WRITE, reject);
        else resolve();
      });
    });
  });
}


function setPassword(password){
  return new Promise((resolve, reject) => {
    if(!password) err('INVALID_PARAMS', msg.PROVIDE_PASS)
    JsonFile.readFile(USER_FILE, (err, usr) => {
      var newCreds = { password };
      if(usr) newCreds.username = usr.username;
      JsonFile.writeFile(USER_FILE, newCreds, (err) => {
        if(err) error('UNKNOWN', msg.COULDNT_WRITE, reject);
        else resolve();
      });
    });
  });
}


function submitFiles(dir, fnames){
  var cmd = 'submit ' + args.course_num + ' ' + args.assignment;
  cmd += fnames.map((fname) => ' ' + dir + '/' + fname).join('');
  return client.execCommand(cmd).then((res) => (res.stdout || res.stderr))
}


function uploadSubmissions(client, fnames){
  var dir = HOME_PATH + '/' + user.username + '/submissions/' + args.course_num + '/' + args.assignment;
  return Promise.all(fnames.map((fname) => uploadFile(client, fname, dir))).then(() => dir);
}


function uploadFile(client, fname, dir){
  if(!dir) dir = HOME_PATH;
  var path = dir + '/' + fname;
  return client.putFile(fname, path)
    .catch((err) => {
      if (err.message.indexOf('does not exist') !== -1) 
        error('NOT_FOUND', fname + ' not found')
      else error('UNKNOWN', 'unknown error: could not upload file')
    })
}


function checkDataStorage(){
  return fsPromise.access(LOCAL_HOME, fs.constants.W_OK)
  .catch(err => error('NO_PERMISSION', msg.HOME_DIR_PERMISSION))
  .then(() => fsPromise
    .access(APP_DATA, fs.constants.F_OK)
    .catch(() => fsPromise.mkdir(APP_DATA) // try to make APP_DATA folder
      .catch(err => error('NO_PERMISSION', msg.APP_DATA_PERMISSION))
    )
  )
}


function checkNodeVersion(){
  var v = process.versions.node;
  var c = compareVersions(v, NODE_MIN_VERSION);
  var r = true;
  if(c < 0) { 
    console.log(msg.NODE_VERSION);
    console.log('Current Version: ' + v);
    r = false;
  }
  return r;
}
