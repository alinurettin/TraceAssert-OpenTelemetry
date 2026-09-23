const http = require('http');
const path = require('path');
const fs = require('fs');
const TraceAssertEngine = require('./trace_engine');

const PORT = parseInt(process.env.PORT, 10) || 7074;
const startTime = Date.now();

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const pathname = reqUrl.pathname;

  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'UP', service: 'TraceAssert-OpenTelemetry', uptimeSeconds: Math.floor((Date.now() - startTime) / 1000) }));
  }

  if (req.method === 'POST' && pathname === '/api/trace') {
    const sampleSpans = [
      { traceId: 'trc-live', spanId: 's1', parentSpanId: null, serviceName: 'gateway', name: 'GET /orders', startTimeMs: 2000, endTimeMs: 2075, statusCode: 'OK' },
      { traceId: 'trc-live', spanId: 's2', parentSpanId: 's1', serviceName: 'order-service', name: 'findOrders', startTimeMs: 2010, endTimeMs: 2060, statusCode: 'OK' },
      { traceId: 'trc-live', spanId: 's3', parentSpanId: 's2', serviceName: 'postgres', name: 'SELECT * FROM orders', startTimeMs: 2020, endTimeMs: 2050, statusCode: 'OK' }
    ];
    const result = TraceAssertEngine.verifyTrace(sampleSpans, {
      maxTotalDurationMs: 100,
      assertNoErrors: true,
      causalOrder: [['gateway', 'order-service']]
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(result));
  }

  let filePath = path.join(__dirname, '..', 'public', pathname === '/' ? 'index.html' : pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return fs.createReadStream(filePath).pipe(res);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
  console.log('TraceAssert-OpenTelemetry running on port ' + PORT);
});
