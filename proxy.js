require.paths.unshift(__dirname); //make local paths accessible

var http = require('http'), 
    httpProxy = require('http-proxy'),
    util = require('util'),
    express = require('express'),
    stitch = require('stitch'),
    _ = require('merger');

var app = express.createServer();
app.set('view engine', 'jade');

var options = {
  paths : [__dirname + '/views', __dirname + '/lib'],
  
  compilers: {
    jade: function(module, filename)  {
      var jade = require('jade');
      var source = require('fs').readFileSync(filename, 'utf8');
      source = "module.exports = " + jade.compile(source) + ";";
      module._compile(source, filename);
    }
  }
};

var stitchPackage = stitch.createPackage(options);


app.get('/application.js', stitchPackage.createServer());
app.get('/foo', function(req, res) {
  res.render('index', { layout: false, name: 'aaron' });
});

app.all('*', function(req, res) {
  var proxy = new httpProxy.HttpProxy(req, res);
  proxy.proxyRequest(3000, 'localhost', req, res);
});

app.listen(3002);

httpProxy.createServer(function (req, res, proxy) {
  if (req.method === 'GET' && !req.url.match(/\.json$/)) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hi');
  }
  else {
    proxy.proxyRequest(3000, 'localhost');
  }
}).listen(3001);



