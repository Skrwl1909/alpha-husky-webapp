// One process also works in restricted Windows environments that deny test-worker spawning.
await import('../simulation.test.mjs');
await import('../presentation.test.mjs');
await import('../p2/authority.test.mjs');
await import('../p2/compatibility.test.mjs');
await import('../p2/public-safety.test.mjs');
await import('./balance.test.mjs');
await import('./raid-contract.test.mjs');
