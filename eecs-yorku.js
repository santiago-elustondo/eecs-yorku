util = require('util');

const HOST = 'red.cse.yorku.ca'
process.stdin.setEncoding('utf8');

var Client = require('ssh2').Client;
var conn = new Client();
conn.on('ready', function() {
  console.log('Client :: ready');
  conn.shell(function(err, stream) {
    if (err) throw err;

    stream

      .on('close', function() {
        console.log('Stream :: close');
        conn.end();
      })

      .on('data', function(data) {
        console.log('STDOUT: ' + data);
      })

      .stderr.on('data', function(data) {
        console.log('STDERR: ' + data);
      });

    process.stdin.on('data', function (text) {
      stream.write(text);
    });

  });

}).connect({
  host: HOST,
  username: 'santi92',
  password: '$$Pp1_!'
});