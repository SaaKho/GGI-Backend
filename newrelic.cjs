// newrelic.cjs
'use strict';

// Load environment variables directly
require('dotenv').config();

exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || 'ggi'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY || '',
  allow_all_headers: true,

  attributes: {
    exclude: [
      "request.headers.cookie",
      "request.headers.authorization",
      "request.headers.proxyAuthorization",
      "request.headers.setCookie*",
      "request.headers.x*",
      "response.headers.cookie",
      "response.headers.authorization",
      "response.headers.proxyAuthorization",
      "response.headers.setCookie*",
      "response.headers.x*",
    ],
  },

  application_logging: {
    forwarding: {
      enabled: true,
      max_samples_stored: 10000,
    },
  },

  distributed_tracing: {
    enabled: process.env.NEW_RELIC_DISTRIBUTED_TRACING_ENABLED === 'true',
  },
};