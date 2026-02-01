const d3 = (globalThis as any).d3;

if (!d3) {
  throw new Error('Global d3 not found. Include d3 v3 before importing fornac.');
}

export default d3;
