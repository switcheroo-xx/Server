const PORT = process.argv[2];

var https = require('https');
var fs = require('fs');
var exec = require('child_process').exec;
var url = require('url');
var crypto = require('crypto');
var pw = require('./pw');

// Read salt and hash for authorization
var saltAndHash = fs.readFileSync(pw.FILENAME);
const mSalt = saltAndHash.slice(0, pw.SALT_LEN);
const mHash = saltAndHash.slice(pw.SALT_LEN);

// Verify authorization header and callback result
function auth(req, callback) {
    var authHeader = req.headers.authorization;
    if (authHeader) {
        var tmp = authHeader.split(' ');
        if (tmp.length == 2) {
            var creds = (new Buffer(tmp[1], 'base64')).toString().split(':');
            if (creds.length == 2) {
                var password = creds[1];
                crypto.pbkdf2(
                        password,
                        mSalt,
                        pw.ITERATIONS,
                        pw.KEY_LEN,
                    function(ex, buf) {
                        var hash = new Buffer(buf);
                        if (hash.length == mHash.length) {
                            for (var i = 0; i < hash.length; i++) {
                                if (hash[i] != mHash[i]) {
                                    callback(false);
                                    return;
                                }
                            }
                            callback(true);
                            return;
                        }

                        callback(false);
                    });
                return;
            }
        }
    }
    callback(false);
}

// Invoked on authorized access
function onAuthorized(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });

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

        exec(cmd, function(error, stdout, stderr) {
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
}

// Invoked on unauthorized access
function onUnauthorized(res) {   
    console.log('Unauthorized access');

    res.writeHead(401, {
        'Content-Type': 'text/plain'
    });
    res.end('Unauthorized access');
}

// Read options and start https server
const httpsOptions = {
    key: fs.readFileSync('keys/key.pem'),
    cert: fs.readFileSync('keys/cert.pem')
}
https.createServer(httpsOptions, function (req, res) {
    auth(req, function(isAuth) {
        if (isAuth) {
            onAuthorized(req, res);
        } else {
            onUnauthorized(res);
        }
    });
}).listen(PORT);

console.log('Server running at port ' + PORT);
