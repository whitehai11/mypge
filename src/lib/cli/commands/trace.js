// @ts-nocheck
export async function run(input, ctx) {
  const target = input.split(/\s+/).slice(1).join(' ') || 'example.net';
  await ctx.typeLines([`tracing route to ${target}...`], 24);
  const hops = [
    '192.168.0.1', '10.21.32.4', '172.16.40.12', target
  ];
  for (let i=0;i<hops.length;i++){
    const lat = 2 + Math.floor(Math.random()*50);
    await ctx.typeLines([`hop ${i+1}: ${hops[i]}    ${lat}ms`], 24);
    await wait(200);
  }
  await ctx.typeLines(['latency spikes detected.', 'trace complete.'], 24);
}
function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }
