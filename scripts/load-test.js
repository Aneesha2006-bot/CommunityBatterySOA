import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 Load Test Configuration (Requirement B5 / CO4)
// 20 Virtual Users (VUs) for 60 seconds
export const options = {
  vus: 20,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<500'], // p95 latency < 500ms
    http_req_failed: ['rate<0.01'],    // < 1% 5xx errors
  },
};

const BASE_URL = __ENV.GATEWAY_URL || 'http://localhost:8080';

// Obtain synthetic auth token
export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/auth/token`,
    JSON.stringify({ username: 'member-a', password: 'member-a-pass' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  if (loginRes.status === 200) {
    return { token: loginRes.json('accessToken') };
  }
  return { token: 'mock-token' };
}

export default function (data) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.token}`,
    },
  };

  // 70% GET /api/battery/state, 30% POST /api/discharges
  const isRead = Math.random() < 0.7;

  if (isRead) {
    const res = http.get(`${BASE_URL}/api/battery/state`, params);
    check(res, {
      'status is 200': (r) => r.status === 200,
    });
  } else {
    const payload = JSON.stringify({
      requestedKwh: 2.5,
      emergency: false,
    });
    const res = http.post(`${BASE_URL}/api/discharges`, payload, params);
    check(res, {
      'status is 200 or 400': (r) => r.status === 200 || r.status === 400,
    });
  }

  sleep(0.5);
}
