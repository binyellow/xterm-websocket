const fs = require('fs');
const http = require('http');
const path = require('path');


http.createServer(function (req, res) {
    res.setHeader('Content-Type','text/html;charset=utf-8');
    res.end('<body><h1>我测试一下</h1></body>');
}).listen(9000);

console.log('Server running at http://127.0.0.1:9000/');
