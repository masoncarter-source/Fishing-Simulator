'use strict';

const $ = selector => document.querySelector(selector);
const view = $('#view');
const canvas = $('#surface');
const ctx = canvas.getContext('2d');
const rod = $('#rod');
const action = $('#action');
const log = $('#log');
const progressMeter = $('#distance');
const tensionMeter = $('#tension');
const hint = $('#hint');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const storageKey = 'stillwater-first-person-v1';
const fish = [
  {name:'Yellowstone cutthroat', chance:46, min:10, max:22},
  {name:'Rainbow trout', chance:30, min:9, max:24},
  {name:'Mountain whitefish', chance:17, min:7, max:17},
  {name:'Brook trout', chance:7, min:6, max:15}
];
let records = {};
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && typeof saved === 'object') records = saved;
} catch {}

const labels = {
  ready:['Cast into the shallows','Choose a spot on the water or cast straight ahead.','Cast line','to cast'],
  casting:['Casting','Watch your line land on the water.','Casting…','to cast'],
  waiting:['Line in the water','Watch the bobber. A bite can come at any moment.','Recast','to recast'],
  bite:['Fish on','The bobber dipped. Set the hook now.','Set hook','to set the hook'],
  reeling:['Bring it in','Hold to reel. Ease off if the tension climbs.','Hold to reel','hold to reel'],
  missed:['The fish got away','Cast again and watch for the bobber to dip.','Cast again','to cast'],
  snapped:['The line snapped','Release the reel when the line tension climbs.','Cast again','to cast']
};
let phase = 'ready';
let started = performance.now();
let deadline = Infinity;
let previousFrame = started;
let width = 0, height = 0;
let target = {x:.48,y:.62};
let bobber = null;
let capturePointer = null;
let holdingKey = false;
let virtualReel = false;
let progress = 0;
let tension = 0;
let fishOnLine = null;
let drops = [];
let audio = null;

function setPhase(next, copy = labels[next], duration = Infinity) {
  phase = next;
  started = performance.now();
  deadline = started + duration;
  [$('#status').textContent, hint.textContent, action.textContent, $('#shortcut').textContent] = copy;
  $('#meters').hidden = next !== 'reeling';
  if (next !== 'reeling') virtualReel = false;
}

function updateLog() {
  let total = 0;
  let variety = 0;
  const rows = fish.map(({name}) => {
    const item = document.createElement('li');
    const details = document.createElement('span');
    const record = records[name];
    item.textContent = name;
    details.textContent = record ? `${record.count} · Best ${record.best.toFixed(1)} in` : '—';
    if (record) {
      total += record.count;
      variety++;
    }
    item.append(details);
    return item;
  });
  $('#total').textContent = total;
  $('#summary').textContent = total ? `${total} landed · ${variety} of ${fish.length} species` : 'Your first catch will appear here.';
  $('#species').replaceChildren(...rows);
}

function cast(point = {x:.48,y:.60}) {
  target = point;
  bobber = null;
  setPhase('casting', undefined, 650);
  tone(295, .13, .045);
}

function hook() {
  let roll = Math.random() * 100;
  fishOnLine = fish.find(species => (roll -= species.chance) < 0);
  progress = 0;
  tension = .15;
  progressMeter.value = progress;
  tensionMeter.value = tension;
  setPhase('reeling');
  tone(485, .14);
}

function land() {
  const {name,min,max} = fishOnLine;
  const size = Math.round((min + Math.random() * (max - min)) * 10) / 10;
  const record = records[name] ||= {count:0,best:0};
  record.count++;
  record.best = Math.max(size, record.best);
  try { localStorage.setItem(storageKey, JSON.stringify(records)); } catch {}
  updateLog();
  setPhase('caught', [name,`${size.toFixed(1)} inches · Released back into the lake.`,'Cast again','to cast']);
  splash(bobber.x, bobber.y, 16);
  bobber = null;
  tone(620, .23);
}

function activate() {
  if (phase === 'bite') hook();
  else if (phase === 'reeling') virtualReel = !virtualReel;
  else if (phase !== 'casting') cast();
}

view.addEventListener('pointerdown', event => {
  if (event.button !== 0 || phase === 'casting' || phase === 'reeling' || phase === 'bite') return;
  const bounds = view.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / width;
  const y = (event.clientY - bounds.top) / height;
  if (y >= .47) cast({x:Math.min(.90, Math.max(.10,x)),y:Math.min(.77,y)});
});
action.addEventListener('pointerdown', event => {
  if (event.button !== 0 || phase !== 'reeling') return;
  capturePointer = event.pointerId;
  action.setPointerCapture(capturePointer);
});
action.addEventListener('lostpointercapture', () => { capturePointer = null; });
action.addEventListener('click', event => {
  if (phase !== 'reeling' || event.detail === 0) activate();
});
document.addEventListener('keydown', event => {
  if (event.code !== 'Space' || log.open || event.altKey || event.ctrlKey || event.metaKey || (event.target.closest?.('button') && event.target !== action)) return;
  event.preventDefault();
  if (event.repeat) return;
  holdingKey = true;
  if (phase !== 'reeling') activate();
});
document.addEventListener('keyup', event => {
  if (event.code === 'Space') holdingKey = false;
});
window.addEventListener('blur', () => {
  holdingKey = false;
  capturePointer = null;
  virtualReel = false;
});
$('#journal').addEventListener('click', () => {
  virtualReel = false;
  holdingKey = false;
  log.showModal();
});

function tone(frequency, duration, volume = .08) {
  if (!audio || audio.state !== 'running') return;
  const oscillator = audio.createOscillator();
  const envelope = audio.createGain();
  const now = audio.currentTime;
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * .62, now + duration);
  envelope.gain.setValueAtTime(volume, now);
  envelope.gain.exponentialRampToValueAtTime(.001, now + duration);
  oscillator.connect(envelope).connect(audio.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

$('#sound').addEventListener('click', async event => {
  const control = event.currentTarget;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const enable = control.getAttribute('aria-pressed') === 'false';
    if (enable) await audio.resume();
    else await audio.suspend();
    control.setAttribute('aria-pressed', String(enable));
    control.textContent = enable ? 'Sound on' : 'Sound off';
    if (enable) tone(405, .16);
  } catch {
    control.textContent = 'Sound unavailable';
    control.disabled = true;
  }
});

function resize() {
  width = view.clientWidth;
  height = view.clientHeight;
  const scale = Math.min(devicePixelRatio, 2);
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  ctx.setTransform(scale,0,0,scale,0,0);
  drops = [];
}
window.addEventListener('resize', resize);

function splash(x, y, count) {
  for (let i = 0; i < count; i++) {
    drops.push({x,y,vx:(Math.random()-.5)*105,vy:-18-Math.random()*75,lifetime:.2+Math.random()*.45});
  }
}

function ring(x,y,r,alpha) {
  ctx.beginPath();
  ctx.ellipse(x,y,r,r*.23,0,0,Math.PI*2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = `rgba(223,240,233,${alpha})`;
  ctx.stroke();
}

function drawBobber(x, y, scale) {
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(scale,scale);
  ctx.fillStyle = '#2333336e';
  ctx.beginPath();
  ctx.ellipse(0,3,5.5,2,0,0,Math.PI*2);
  ctx.fill();
  const color = ctx.createLinearGradient(-5,-7,5,0);
  color.addColorStop(0,'#fe7e58');
  color.addColorStop(.45,'#da492d');
  color.addColorStop(1,'#712217');
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0,-2,4.7,5.4,0,0,Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#f3e8d0';
  ctx.fillRect(-3,0,6,1.6);
  ctx.fillRect(-.7,-10,1.4,4);
  ctx.restore();
}

function advance(now, dt) {
  const elapsed = (now-started)/1000;
  if (phase === 'casting' && now >= deadline) {
    bobber = {x:target.x*width,y:target.y*height};
    splash(bobber.x,bobber.y,9);
    tone(140,.17);
    setPhase('waiting', undefined, 2200+Math.random()*4300);
  } else if (phase === 'waiting' && now >= deadline) {
    splash(target.x*width,target.y*height,12);
    tone(250,.19);
    setPhase('bite', undefined, 5200);
  } else if (phase === 'bite' && now >= deadline) {
    bobber = null;
    setPhase('missed');
  } else if (phase === 'reeling' && !log.open) {
    const winding = holdingKey || capturePointer !== null || virtualReel;
    const surge = Math.pow(Math.sin(elapsed*1.15), 6);
    tension = Math.max(.08,tension+dt*(winding ? .06+surge*.51 : -.54));
    progress += winding ? dt*(.21-.075*surge) : -dt*.017;
    progress = Math.max(0,progress);
    progressMeter.value = progress;
    tensionMeter.value = tension;
    const guidance = tension > .77 ? 'Ease off to lower the line tension.' : labels.reeling[1];
    if (hint.textContent !== guidance) hint.textContent = guidance;
    if (tension >= 1) {
      bobber = null;
      setPhase('snapped');
      tone(100,.17);
    } else if (progress >= 1) land();
  }
}

function draw(now) {
  const dt = Math.min(.06,(now - previousFrame)/1000);
  previousFrame = now;
  advance(now,dt);
  const elapsed = (now-started)/1000;
  const motion = !reduceMotion.matches;
  ctx.clearRect(0,0,width,height);
  let angle = motion ? .65*Math.sin(now/920) : 0;
  if (phase === 'casting' && motion) angle += -20*Math.sin(Math.min(1,elapsed/.65)*Math.PI*2);
  if (phase === 'bite' && motion) angle += 2.5*Math.sin(now/60);
  if (phase === 'reeling' && motion) angle += 7*tension + 1.6*Math.sin(now/88);
  rod.style.transform = `rotate(${angle}deg)`;

  const rodHeight = rod.offsetHeight;
  const rodWidth = rod.offsetWidth;
  const pivotX = rod.offsetLeft + .92*rodWidth;
  const pivotY = rod.offsetTop + .91*rodHeight;
  const tipOffsetX = (.103-.92)*rodWidth;
  const tipOffsetY = (.039-.91)*rodHeight;
  const theta = angle*Math.PI/180;
  const tipX = pivotX + tipOffsetX*Math.cos(theta) - tipOffsetY*Math.sin(theta);
  const tipY = pivotY + tipOffsetX*Math.sin(theta) + tipOffsetY*Math.cos(theta);

  if (phase === 'casting' || phase === 'waiting' || phase === 'bite' || phase === 'reeling') {
    let x = target.x*width;
    let y = target.y*height;
    if (phase === 'casting') {
      const fraction = Math.min(1,elapsed/.65);
      x = tipX + (x-tipX)*fraction;
      y = tipY + (y-tipY)*fraction - (motion ? Math.sin(fraction*Math.PI)*height*.17 : 0);
    } else if (phase === 'reeling') {
      x += (width*.58-x)*progress + (motion ? Math.sin(now/203)*8 : 0);
      y += (height*.87-y)*progress;
    }
    if (phase === 'bite' && motion) y += Math.sin(now/62)*4;
    bobber = {x,y};
    if (phase !== 'casting') {
      for (let i = 0; i < 2; i++) {
        const ripple = ((now/1300 + i*.48)%1);
        ring(x,y,4+ripple*(phase === 'bite' ? 28 : 16),.58*(1-ripple));
      }
    }
    const line = ctx.createLinearGradient(tipX,tipY,x+1,y+1);
    line.addColorStop(0,'#e2e9dcaa');
    line.addColorStop(1,'#fcf3dbd9');
    ctx.strokeStyle = line;
    ctx.lineWidth = .8;
    ctx.beginPath();
    ctx.moveTo(tipX,tipY);
    ctx.quadraticCurveTo((tipX+x)/2,(tipY+y)/2 + (phase === 'reeling' ? 6 : 26),x,y-4);
    ctx.stroke();
    drawBobber(x,y,.8+Math.max(0,y/height-.45)*1.2);
  }

  drops = drops.filter(drop => {
    drop.lifetime -= dt;
    if (drop.lifetime <= 0) return false;
    drop.x += drop.vx*dt;
    drop.y += drop.vy*dt;
    drop.vy += 175*dt;
    ctx.fillStyle = `rgba(232,248,240,${drop.lifetime})`;
    ctx.beginPath();
    ctx.arc(drop.x,drop.y,1.2,0,Math.PI*2);
    ctx.fill();
    return true;
  });
  requestAnimationFrame(draw);
}

updateLog();
resize();
requestAnimationFrame(draw);
