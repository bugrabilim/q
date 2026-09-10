// Geçici statik sunucu — sadece tema önizlemesini göstermek için (bağımlılık yok)
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '.onizleme');

http.createServer((req, res) => {
  const rel = req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]);
  const fp = path.join(ROOT, rel.replace(/^\/+/, ''));
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('bulunamadi'); return; }
    const ext = path.extname(fp).toLowerCase();
    const tip = ext === '.html' ? 'text/html; charset=utf-8'
      : ext === '.css' ? 'text/css; charset=utf-8'
      : ext === '.js' ? 'text/javascript; charset=utf-8' : 'text/plain';
    res.writeHead(200, { 'Content-Type': tip });
    res.end(data);
  });
}).listen(4321, '127.0.0.1', () => console.log('TEMA SUNUCU 127.0.0.1:4321 HAZIR'));
