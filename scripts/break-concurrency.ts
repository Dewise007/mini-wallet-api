const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJlbWFpbCI6ImNvbmN1cnJlbmN5QGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODg3NTQ1NjEsImV4cCI6MTc4ODc1NTQ2MX0.3wm6zBryIflPIhQcXJU_OWjzFlU8OILBmyX-Si_7NWs';
const BASE_URL = 'http://localhost:3000';

async function withdraw(amountMinor: number, idempotencyKey: string) {
  const res = await fetch(`${BASE_URL}/wallets/withdraw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ amountMinor }),
  });
  const body = await res.json();
  return { status: res.status, body };
}

async function main() {
  const requests = Array.from({ length: 10 }, (_, i) =>
    withdraw(2000, `retest-${Date.now()}-${i}`),
  );

  const results = await Promise.all(requests);

  let succeeded = 0;
  let rejected = 0;

  results.forEach((r, i) => {
    console.log(`Request ${i + 1}: ${r.status}`, r.body);
    if (r.status === 201) succeeded++;
    else rejected++;
  });

  console.log(`\nSucceeded: ${succeeded}, Rejected: ${rejected}`);
}

void main();
