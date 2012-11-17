const PORT = 1443;

var http = require('http');
var exec = require('child_process').exec;
var url = require('url');
var child;

http.createServer(function (req, res) {
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

    child = exec(cmd, function(error, stdout, stderr) {
      res.write('stdout: ' + stdout + '\n');
      res.write('stderr: ' + stderr + '\n');
      if (error !== null) {
        res.write('exec error: ' + error);
      }
      res.end();
    });
  } else {
    res.end('Bad request');
  }
}).listen(PORT);
console.log('Server running at port ' + PORT);
