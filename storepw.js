var readline = require('readline');
var crypto = require('crypto');
var fs = require('fs');

var pw = require('./pw');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Server password: ", function(answer) {
  rl.close();

  crypto.randomBytes(pw.SALT_LEN, function(ex, salt) {
    console.log("Salt");
    console.log(salt);
    crypto.pbkdf2(
        answer,
        salt,
        pw.ITERATIONS,
        pw.KEY_LEN,
        function(ex, buf) {
      hash = new Buffer(buf);
      console.log("Hash");
      console.log(hash);
      fs.writeFile(pw.FILENAME, Buffer.concat([salt, hash]), function(ex) {
        if (ex) {
          console.log(ex);
          console.log("Failure");
        } else {
          console.log("Success");
        }
      });
    });
  });
});

