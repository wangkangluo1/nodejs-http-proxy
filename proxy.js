/*** config start ***/
var PROXY_PORT = '8081';            //对外端口
/*** config end ***/

var http = require('http');
var https = require('https');
var fs = require('fs');
var net = require('net');
var url = require('url');

function request(cReq, cRes) {
  var u = url.parse(cReq.url);

  var options = {
    hostname : u.hostname,
    port     : u.port || 80,
    path     : u.path,
    method   : cReq.method,
    headers  : cReq.headers
  };

  var pReq = http.request(options, function(pRes) {
    cRes.writeHead(pRes.statusCode, pRes.headers);
    pRes.pipe(cRes);
  }).on('error', function(e) {
    cRes.end();
  });

  cReq.pipe(pReq);
}

function connect(cReq, cSock) {
  var u = url.parse('http://' + cReq.url);

  var pSock = net.connect(u.port, u.hostname, function() {
    cSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    pSock.pipe(cSock);
  }).on('error', function(e) {
    cSock.end();
  });

  cSock.pipe(pSock);
}

// var options = {
//   key  : fs.readFileSync('./private.pem'),
//   cert : fs.readFileSync('./public.crt')
// };

https.createServer({
    // key: fs.readFileSync('ryans-ley.pem'),
    // cert: fs.readFileSync('ryans-cert.pem'),
    NPNProtocols: ['http/2.0', 'spdy', 'http/1.1', 'http/1.0']
  })
  .on('request', request)
  .on('connect', connect)
  .listen(PROXY_PORT, '0.0.0.0');
