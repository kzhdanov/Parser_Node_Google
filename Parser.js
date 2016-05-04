'use strict';
let request = require('request'),
    cheerio = require('cheerio'),
    fs = require('fs');

const fileContent = fs.readFileSync('sites.txt', 'utf-8').split('\r\n');

let counter = 1, $, tempVal = '';
let stream = fs.createWriteStream('emails.txt', { flags: 'a' });

console.log('parsing is starting...');
stream.once('open', function(fd) {
  StartPars(fileContent[0]);
});

function StartPars(url) {
  console.log(counter + ' - ' + url);
  if(!url) { return null; }

  request(url, function(err, res, body) {
    if(err) { console.log(err); StartPars(fileContent[counter++]); }
    else {
      $ = cheerio.load(body);
      let str = $('body').text().replace(/\s+/g, ' ');
      if( str.indexOf('@') !== -1 ) {
        str.split(' ').forEach(function (word, index) {
            if(word.indexOf('@') !== -1 && /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/.test(word.toLowerCase())) {
              if(tempVal !== word) {
                stream.write(word + '\n');
                tempVal = word;
              }
            }
        })
      }
      StartPars(fileContent[counter++]);
    }
  });
}
process.on('uncaughtException', function() {
  console.log('fatal error');
});
process.on('exit', function () {
  console.log('parsing has been ended');
  stream.end();
});
