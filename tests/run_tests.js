const assert = require('assert');
const TraceAssertEngine = require('../src/trace_engine');

console.log('Running test suite for TraceAssert-OpenTelemetry...');

const validSpans = [
  { traceId: 'trc-1', spanId: 'sp-1', parentSpanId: null, serviceName: 'api-gateway', name: 'POST /checkout', startTimeMs: 1000, endTimeMs: 1140, statusCode: 'OK' },
  { traceId: 'trc-1', spanId: 'sp-2', parentSpanId: 'sp-1', serviceName: 'auth-service', name: 'verifyToken', startTimeMs: 1010, endTimeMs: 1040, statusCode: 'OK' },
  { traceId: 'trc-1', spanId: 'sp-3', parentSpanId: 'sp-1', serviceName: 'payment-service', name: 'authorizeCharge', startTimeMs: 1050, endTimeMs: 1130, statusCode: 'OK' }
];

// Test 1: Successful trace verification
const resSuccess = TraceAssertEngine.verifyTrace(validSpans, {
  maxTotalDurationMs: 200,
  assertNoErrors: true,
  requiredSpans: [
    { serviceName: 'api-gateway', name: 'POST /checkout', maxDurationMs: 150 },
    { serviceName: 'payment-service', name: 'authorizeCharge', maxDurationMs: 90 }
  ],
  causalOrder: [['api-gateway', 'payment-service']]
});

console.log('Valid Trace Verification:', { status: resSuccess.status, passed: resSuccess.passedChecksCount });
assert.strictEqual(resSuccess.status, 'PASSED');
assert.strictEqual(resSuccess.failedChecksCount, 0);
assert.strictEqual(resSuccess.totalDurationMs, 140);

// Test 2: Injected failure (exceeded duration budget and missing audit span)
const resFailure = TraceAssertEngine.verifyTrace(validSpans, {
  maxTotalDurationMs: 100,
  requiredSpans: [{ serviceName: 'audit-service', name: 'logKafka' }]
});

console.log('Failed Trace Verification:', { status: resFailure.status, failures: resFailure.failures });
assert.strictEqual(resFailure.status, 'FAILED');
assert.strictEqual(resFailure.failedChecksCount, 2);

console.log('✅ ALL TESTS PASSED (100% Assertion Rate)');
