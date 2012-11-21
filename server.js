const PORT = process.argv[2];

var https = require('https');
var fs = require('fs');
var exec = require('child_process').exec;
var url = require('url');
var child;

var options = {
  key: fs.readFileSync('keys/key.pem'),
  cert: fs.readFileSync('keys/cert.pem')
}

https.createServer(options, function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});

  p = url.parse(req.url, true);

  res.write('Device: ' + p.query.device + '\n');
  res.write('Command: ' + p.query.command + '\n');

  if (p.query.command) {
    var cmd = "tdtool --";

    // Treat and append inparam
    cmd += p.query.command.replace(/[^a-zA-Z 0-9]+/g,'');

    // Treat and append inparam: device
    if (p.query.device) {
      cmd += " " + p.query.device.replace(/[^a-zA-Z 0-9]+/g,'');
    }

    console.log('Executing command: ' + cmd);

    child = exec(cmd, function(error, stdout, stderr) {
      res.write('stdout: ' + stdout + '\n');
      res.write('stderr: ' + stderr + '\n');
      if (error !== null) {
        res.write('exec error: ' + error);
      }
      res.end();
      console.log('Request finished.');
    });
  } else {
    res.end('Bad request');
  }
}).listen(PORT);
console.log('Server running at port ' + PORT);
