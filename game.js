'use strict';
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const landscape = document.createElement('canvas');
landscape.width = 480;
landscape.height = 270;
const art = landscape.getContext('2d');
const rect = (g, x, y, w, h, color) => {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
};
function polygon(g, color, points) {
  g.fillStyle = color;
  g.beginPath();
  points.forEach(([x,y], i) => i ? g.lineTo(x,y) : g.moveTo(x,y));
  g.fill();
}
let seed = 431;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
function pine(g, x, y, h, color, light) {
  rect(g,x-1,y-h,2,h,'#273f39');
  for (let i=3;i<h-2;i+=2) {
    const spread = Math.max(1,Math.floor(i*.27 + (i%6===3 ? 2 : 0)));
    rect(g,x-spread,y-h+i,spread*2+1,2,color);
    rect(g,x-spread,y-h+i,Math.max(1,spread/2),1,light);
  }
}
const sky = art.createLinearGradient(0,0,0,145);
sky.addColorStop(0,'#548d9c');
sky.addColorStop(.73,'#b0d2c4');
sky.addColorStop(1,'#ffda9b');
rect(art,0,0,480,147,sky);
for(let y=-15;y<=15;y++){
  const w=Math.floor(Math.sqrt(225-y*y));
  rect(art,343-w,46+y,2*w+1,1,'#ffdfa3');
}
for (const [x,y,w] of [[40,37,75],[254,24,63],[366,65,83],[125,63,53]]) {
  rect(art,x,y,w,3,'#b5d4c8');
  rect(art,x+12,y-4,w*.55,4,'#c6ddcc');
  rect(art,x+24,y-7,w*.26,4,'#d0e3d0');
}
polygon(art,'#729a9b',[[0,100],[40,70],[65,92],[93,64],[155,96],[204,64],[250,96],[302,71],[338,97],[380,71],[405,89],[452,63],[480,87],[480,143],[0,143]]);
const peaks=[
  [77,54,[[0,117],[14,101],[37,87],[52,65],[65,64],[77,54],[91,69],[104,79],[120,96],[154,122]]],
  [165,31,[[55,128],[83,105],[104,92],[118,72],[133,60],[143,44],[153,45],[165,31],[179,42],[198,70],[217,89],[242,107],[262,127]]],
  [254,53,[[174,127],[192,104],[216,87],[232,68],[242,68],[254,53],[267,62],[285,88],[305,99],[342,127]]],
  [383,82,[[309,131],[331,110],[350,107],[361,92],[371,92],[383,82],[398,92],[419,101],[450,124],[480,132]]]
];
for(const [x,y,outline] of peaks) {
  polygon(art,'#476b77',outline);
  polygon(art,'#385765',[[x,y],[x+9,y+23],[x+6,y+38],[x+35,y+70],[outline.at(-1)[0],outline.at(-1)[1]],...outline.slice(outline.findIndex(p=>p[0]===x),-1).reverse()]);
  polygon(art,'#eef0d8',[[x-22,y+20],[x-12,y+14],[x,y],[x+12,y+10],[x+26,y+28],[x+10,y+22],[x+6,y+28],[x-3,y+17],[x-12,y+24],[x-12,y+16]]);
  polygon(art,'#a8c3bf',[[x,y],[x+12,y+10],[x+26,y+28],[x+10,y+22],[x+6,y+28],[x+4,y+15]]);
}
polygon(art,'#326765',[[0,113],[44,109],[78,119],[116,115],[157,128],[199,124],[235,132],[275,122],[319,125],[352,116],[401,110],[446,117],[480,111],[480,148],[0,148]]);
const water = art.createLinearGradient(0,143,0,270);
water.addColorStop(0,'#598b87');
water.addColorStop(.46,'#438888');
water.addColorStop(1,'#245b65');
rect(art,0,143,480,127,water);
art.save();
art.translate(0,286);
art.scale(1,-.48);
art.globalAlpha=.17;
for(const [, ,outline] of peaks) polygon(art,'#1d4c5e',outline.map(([x,y])=>[x,y+155]));
art.restore();
for(let x=0;x<480;x+=3){
  const y=141+Math.floor(random()*5);
  pine(art,x,y,4+Math.floor(random()*14),'#255551','#3d7165');
  rect(art,x,y,4,2,'#316760');
  if(x%6===0)rect(art,x,y+2,2,2+Math.floor(random()*6),'#477975');
}
for(let i=0;i<300;i++){
  const y=147+random()*123, x=random()*480;
  rect(art,x,y,2+random()*(5+(y-146)*.22),1,random()>.53?'#619e97':'#377778');
}
polygon(art,'#2b5551',[[0,191],[22,196],[28,202],[46,202],[69,217],[95,220],[108,233],[144,241],[159,252],[213,270],[0,270]]);
polygon(art,'#183b3b',[[0,204],[23,205],[30,213],[53,213],[63,223],[92,232],[124,244],[139,258],[182,270],[0,270]]);
for(let i=0;i<100;i++){
  const y=204+random()*66,x=random()*(y-185)*1.75;
  rect(art,x,y,2+random()*5,1,random()>.5?'#34644d':'#68805b');
}
for(const [x,y,h] of [[8,229,96],[34,231,78],[61,245,55],[93,253,37],[12,260,79]]){
  pine(art,x,y,h,'#153837','#386351');
}
polygon(art,'#203d3d',[[480,212],[463,221],[451,234],[428,241],[402,254],[392,270],[480,270]]);
for(const [x,y,h] of [[479,234,96],[461,247,72],[444,252,52],[476,270,66]]){
  pine(art,x,y,h,'#153736','#335c4c');
}
for(const x of [132,171,199,223]){
  rect(art,x,222,4,24,'#343b35');
  rect(art,x,223,1,20,'#785d48');
}
polygon(art,'#70503d',[[103,226],[210,218],[235,223],[123,236]]);
polygon(art,'#b38962',[[103,222],[210,214],[235,219],[123,232]]);
for(let i=0;i<16;i++){
  const x=108+i*7.3;
  polygon(art,i%2?'#947252':'#cca275',[[x,222-i*.53],[x+1,222-i*.53],[x+20,231-i*.76],[x+19,231-i*.76]]);
}
const sprite = [
 ['    HHHHH   ', '#a9613b','H'],
 ['   HHHHHHH  ', '#ce8b50','H'],
 ['  DDDDDDDDD ', '#623e35','D'],
 ['    SSFS    ', '#ebb480','S','#302f30','F'],
 ['    SSSS    ', '#ebb480','S'],
 ['   GGGGGG   ', '#d7a552','G'],
 ['  GGBGGGGS  ', '#b7803d','G','#38494a','B','#efbc87','S'],
 ['  GGGBGG    ', '#d7a552','G','#38494a','B'],
 ['   BBBBB    ', '#38494a','B'],
 ['   BB BB    ', '#38494a','B'],
 ['   DD DDD   ', '#402f2c','D']
];
for(const [i,row] of sprite.entries()){
  const [pixels,...colors]=row;
  for(const [j,pixel] of [...pixels].entries()){
    for(let k=0;k<colors.length;k+=2){
      if(colors[k+1]===pixel) rect(art,190+j*2,197+i*2,2,2,colors[k]);
    }
  }
}
const fish = [
  {name:'Cutthroat trout', weight:42, min:10, max:21},
  {name:'Rainbow trout', weight:32, min:9, max:23},
  {name:'Mountain whitefish', weight:18, min:7, max:16},
  {name:'Brook trout', weight:8, min:6, max:15}
];
let catches = {};
try { catches = JSON.parse(localStorage.getItem('stillwater-catches') || '{}') || {}; } catch {}
const status = document.querySelector('#status');
const hint = document.querySelector('#hint');
const action = document.querySelector('#action');
const log = document.querySelector('#log');
let state = 'ready', timer, castAt = 0;
const copy = {
  ready:['Ready to fish?','Cast into the lake and wait for a bite.','Cast line'],
  waiting:['Line in the water','Watch for a splash.','Recast'],
  bite:['Fish on!','Reel it in before it slips away.','Reel in!'],
  missed:['The fish slipped away','Cast again for another bite.','Cast again']
};
function setState(next, message=copy[next]) {
  state=next;
  [status.textContent,hint.textContent,action.textContent]=message;
}
function updateLog() {
  const total=fish.reduce((sum,f)=>sum+(catches[f.name]?.count||0),0);
  document.querySelector('#total').textContent=total;
  document.querySelector('#summary').textContent=total ? `${total} landed · ${fish.filter(f=>catches[f.name]).length} of ${fish.length} species` : 'Your first catch will appear here.';
  document.querySelector('#species').replaceChildren(...fish.map(f=>{
    const li=document.createElement('li'), detail=document.createElement('span');
    li.textContent=f.name;
    const record=catches[f.name];
    detail.textContent=record ? `${record.count} · Best ${record.best} in` : '—';
    li.append(detail);
    return li;
  }));
}
function play() {
  clearTimeout(timer);
  if(state==='bite'){
    let roll=Math.random()*100;
    const caught=fish.find(f=>(roll-=f.weight)<0);
    const size=caught.min+Math.floor(Math.random()*(caught.max-caught.min+1));
    const record=catches[caught.name] ||= {count:0,best:0};
    record.count++;
    record.best=Math.max(record.best,size);
    try { localStorage.setItem('stillwater-catches',JSON.stringify(catches)); } catch {}
    updateLog();
    setState('caught',[`Caught a ${caught.name.toLowerCase()}!`,`${size} inches · Added to your catch log.`,'Cast again']);
    return;
  }
  castAt=performance.now();
  setState('waiting');
  timer=setTimeout(()=>{
    setState('bite');
    timer=setTimeout(()=>setState('missed'),5500);
  },1800+Math.random()*2900);
}
action.addEventListener('click',play);
document.querySelector('#journal').addEventListener('click',()=>log.showModal());
document.addEventListener('keydown',e=>{
  if(e.code!=='Space'||log.open||e.altKey||e.ctrlKey||e.metaKey||(e.target.closest?.('button') && e.target!==action)) return;
  e.preventDefault();
  if(!e.repeat)play();
});
function draw(now) {
  ctx.drawImage(landscape,0,0);
  for(let i=0;i<16;i++){
    const x=(i*97+62)%469, y=151+(i*17)%110;
    if(Math.sin(now/760+i*1.8)>.2)rect(ctx,x,y,4+(i%4)*4,1,'#83b5a6');
  }
  polygon(ctx,'#644638',[[207,211],[222,191],[233,181],[232,184],[224,193],[209,212]]);
  if(state==='waiting'||state==='bite'){
    const progress=Math.min(1,(now-castAt)/420);
    const x=Math.round(233+64*progress);
    const y=Math.round(181+8*progress-13*Math.sin(progress*Math.PI)+(state==='bite'?3*Math.sin(now/52):Math.sin(now/430)));
    ctx.strokeStyle='#c4dcbd';
    ctx.beginPath();
    ctx.moveTo(232,182);
    ctx.quadraticCurveTo(264,174,x,y);
    ctx.stroke();
    rect(ctx,x-2,y-4,4,4,'#fa7750');
    rect(ctx,x-2,y,4,2,'#fff1c9');
    if(progress===1){
      const r=4+Math.floor(now/(state==='bite'?42:115))%13;
      rect(ctx,x-r,y+3,4,1,'#b7d7c8');
      rect(ctx,x+r-3,y+3,4,1,'#b7d7c8');
      if(state==='bite'){
        rect(ctx,x-7,y-5,2,2,'#ebedce');
        rect(ctx,x+5,y-7,2,2,'#ebedce');
        rect(ctx,x-15,y-28,30,15,'#183737');
        ctx.font='bold 9px monospace';
        ctx.fillStyle='#ffce80';
        ctx.fillText('BITE!',x-13,y-17);
      }
    }
  }
  requestAnimationFrame(draw);
}
updateLog();
requestAnimationFrame(draw);
