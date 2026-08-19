const {
  diag,
  DiagConsoleLogger,
  DiagLogLevel
} = require('@opentelemetry/api');

const { NodeSDK } = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations
} = require('@opentelemetry/auto-instrumentations-node');
const {
  OTLPTraceExporter
} = require('@opentelemetry/exporter-trace-otlp-grpc');

process.env.OTEL_SERVICE_NAME = 'cart-service';

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
});

const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations(),
  ],
});

sdk.start();

console.log('OpenTelemetry tracing initialized');

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('OpenTelemetry SDK shut down'))
    .catch((error) => console.error('Error shutting down OpenTelemetry SDK', error))
    .finally(() => process.exit(0));
});
