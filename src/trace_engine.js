// TraceAssert-OpenTelemetry: Trace-Driven Verification Engine
class TraceAssertEngine {
  /**
   * Reconstruct hierarchical trace tree and compute timing DAG
   */
  static analyzeTrace(spans) {
    const spanMap = new Map();
    const childrenMap = new Map();
    let minStart = Infinity;
    let maxEnd = -Infinity;

    for (const span of spans) {
      const duration = span.endTimeMs - span.startTimeMs;
      const normalized = { ...span, durationMs: duration };
      spanMap.set(span.spanId, normalized);

      if (span.startTimeMs < minStart) minStart = span.startTimeMs;
      if (span.endTimeMs > maxEnd) maxEnd = span.endTimeMs;

      const parentId = span.parentSpanId || 'ROOT';
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId).push(span.spanId);
    }

    const totalDuration = maxEnd >= minStart ? maxEnd - minStart : 0;

    return {
      spanMap,
      childrenMap,
      totalDurationMs: totalDuration,
      totalSpans: spans.length
    };
  }

  /**
   * Evaluate assertion rules against an OpenTelemetry trace
   */
  static verifyTrace(spans, rules = {}) {
    const analysis = this.analyzeTrace(spans);
    const { spanMap, totalDurationMs, totalSpans } = analysis;
    const failures = [];
    const passedChecks = [];

    // Rule 1: Max total trace duration
    if (rules.maxTotalDurationMs !== undefined) {
      if (totalDurationMs > rules.maxTotalDurationMs) {
        failures.push({
          type: 'MAX_TOTAL_DURATION_EXCEEDED',
          message: 'Total trace duration ' + totalDurationMs + 'ms exceeded threshold of ' + rules.maxTotalDurationMs + 'ms'
        });
      } else {
        passedChecks.push('Total trace duration (' + totalDurationMs + 'ms) within limit');
      }
    }

    // Rule 2: Zero error spans
    if (rules.assertNoErrors) {
      const errorSpans = spans.filter(s => s.statusCode === 'ERROR');
      if (errorSpans.length > 0) {
        failures.push({
          type: 'ERROR_SPANS_DETECTED',
          message: 'Found ' + errorSpans.length + ' span(s) with ERROR status',
          errorSpans: errorSpans.map(s => ({ id: s.spanId, service: s.serviceName, name: s.name }))
        });
      } else {
        passedChecks.push('Zero error spans verified');
      }
    }

    // Rule 3: Required spans existence
    if (rules.requiredSpans) {
      for (const req of rules.requiredSpans) {
        const found = spans.find(s => 
          (!req.serviceName || s.serviceName === req.serviceName) &&
          (!req.name || s.name === req.name)
        );
        if (!found) {
          failures.push({
            type: 'REQUIRED_SPAN_MISSING',
            message: 'Required span missing: service=' + req.serviceName + ', name=' + req.name
          });
        } else {
          passedChecks.push('Required span found: ' + req.serviceName + ' - ' + req.name);
          if (req.maxDurationMs !== undefined && found.durationMs > req.maxDurationMs) {
            failures.push({
              type: 'SPAN_DURATION_EXCEEDED',
              message: 'Span ' + found.name + ' duration ' + found.durationMs + 'ms exceeded max ' + req.maxDurationMs + 'ms'
            });
          }
        }
      }
    }

    // Rule 4: Causal order check (Service A starts before Service B)
    if (rules.causalOrder) {
      for (const [svcA, svcB] of rules.causalOrder) {
        const spanA = spans.find(s => s.serviceName === svcA);
        const spanB = spans.find(s => s.serviceName === svcB);
        if (spanA && spanB) {
          if (spanA.startTimeMs > spanB.startTimeMs) {
            failures.push({
              type: 'CAUSAL_ORDER_VIOLATION',
              message: 'Causal order violated: ' + svcA + ' started after ' + svcB
            });
          } else {
            passedChecks.push('Causal ordering verified: ' + svcA + ' -> ' + svcB);
          }
        }
      }
    }

    return {
      status: failures.length === 0 ? 'PASSED' : 'FAILED',
      totalSpans,
      totalDurationMs,
      passedChecksCount: passedChecks.length,
      failedChecksCount: failures.length,
      failures,
      passedChecks,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = TraceAssertEngine;