// @ts-nocheck
export async function run(input, ctx) {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
  const seed = hash(ymd);
  const rnd = mulberry32(seed);
  const W = 64, H = 24;
  const chars = [' ', '.', ':', '-', '~', '*', '+', '=', 'x', '%', '#', '@'];
  const lines = [];
  let t = rnd();
  for (let y=0;y<H;y++) {
    let row='';
    for (let x=0;x<W;x++) {
      const v = Math.sin((x*0.2)+t) + Math.cos((y*0.3)-t*1.3) + Math.sin((x+y)*0.12);
      const n = clamp(Math.floor(((v+3)/6)*chars.length), 0, chars.length-1);
      row += chars[n];
      t += 0.0007;
    }
    lines.push(row);
  }
  await ctx.typeLines(lines, 28);
}

function clamp(v,min,max){ return Math.max(min, Math.min(max,v)); }
function hash(s){ let h=2166136261>>>0; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=(h*16777619)>>>0; } return h; }
function mulberry32(a){ return function(){ let t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; } }
