#!/usr/bin/env node

var SshClient = require('node-ssh')
var JsonFile = require('jsonfile') 

const HOST = 'red.cse.yorku.ca';
const HOME_PATH = '/eecs/home';
const USER_FILE = 'credentials.json';
const msg = {
  CONFIGURE_CREDENTIALS: 'You must configure your credentials.',
  SET_USER: 'Set your username: "eecs-yorku set-user <username>"',
  SET_PASS: 'Set your password: "eecs-yorkus set-pass <password>"',
  PROVIDE_USER: 'Provide user as second parameter',
  PROVIDE_PASS: 'Provide password as second parameter'
}

var client = new SshClient()
var close = (msg) => { console.log(msg || 'closing..'); client.dispose(); }

var args = getArgs();
var user;

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
}


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
      });
    case 'set-user':
      Object.assign(ar, {
        username: process.argv[3]
      });
    case 'set-pass':
      Object.assign(ar, {
        password: process.argv[3]
      });
  }
  return ar;
}


function getUser(){
  return new Promise((resolve, reject) => {
    JsonFile.readFile(USER_FILE, (error, usr) => {
      var err = (t, m) => { reject(Object.create({type:t, message:m})) };
      if(error) {
        if(error.code == 'ENOENT') err('NO_CREDS', msg.CONFIGURE_CREDENTIALS)
        else err('UNKNOWN', error);
      } else {
        if(!usr || !usr.username){ err('NO_USER', msg.SET_USER) }
        else if(!usr.password){ err('NO_PASS', msg.SET_PASS) }
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
    if(!username) reject('INVALID_PARAMS', msg.PROVIDE_USER)
    JsonFile.readFile(USER_FILE, (err, usr) => {
      var newCreds = { username };
      if(usr) newCreds.password = usr.password;
      JsonFile.writeFileSync(USER_FILE, newCreds);
      resolve();
    });
  });
}


function setPassword(password){
  return new Promise((resolve, reject) => {
    if(!password) reject('INVALID_PARAMS', msg.PROVIDE_PASS)
    JsonFile.readFile(USER_FILE, (err, usr) => {
      var newCreds = { password };
      if(usr) newCreds.username = usr.username;
      JsonFile.writeFileSync(USER_FILE, newCreds);
      resolve();
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
  var err = (t,m) => { throw Object.create({type:t, message:m, fname:fname}) };
  return client.putFile(fname, path)
    .catch((error) => {
      if (error.message.indexOf('does not exist') !== -1) 
        err('NOT_FOUND', fname + ' not found')
      else err('UNKNOWN')
    })
}
