// Node-only behavioural probes. These do not constitute browser play-testing.
import fs from 'node:fs';
import * as THREE from 'three';
import {SurfSession} from '../../../src/surf/surfSession.js';
import {Diver} from '../../../src/dive/diver.js';
import {gbr} from '../../../src/ecosystems/gbr.js';
import {evaluatePhoto} from '../../../src/learn/photo.js';
import {simulate,dhw} from '../../../src/learn/reefModel.js';
const results={};
const input=()=>({keys:new Set(),pressed:new Set(),down(...c){return c.some(x=>this.keys.has(x))},hit(...c){return c.some(x=>this.pressed.has(x))},takeMouse(){return [0,0]}});
for(const scenario of ['idle','early-popup','slow-popup','prompt-popup','prompt-popup-crouch','prompt-popup-steer','reactive-popup','reactive-popup-crouch']){
 const inp=input(); let result; const prompts=[];
 const surfer={root:new THREE.Group(),reset(){},setPose(){},update(){},wipeout(){}};
 const old=Math.random; Math.random=()=>0.5;
 const s=new SurfSession({eco:gbr,surfer,camera:new THREE.PerspectiveCamera(),input:inp,fx:{sprayBurst(){}},settings:{},onEnd:r=>result=r});
 let popped=false;
 for(let i=0;i<120*60&&!result;i++){
  inp.keys.clear();inp.pressed.clear();
  if(scenario.includes('prompt'))inp.keys.add('KeyW');
  if(scenario.startsWith('reactive')&&(/Paddle/.test(s.prompt)||s.state==='ride'))inp.keys.add('KeyW');
  if(scenario==='early-popup'&&i===60)inp.pressed.add('Space');
  if(scenario==='slow-popup'&&s.waveInfo&&s.waveInfo.s>0&&s.waveInfo.s<s.waveInfo.H)inp.pressed.add('Space');
  if(!popped&&s.prompt.includes('POP UP')){inp.pressed.add('Space');popped=true;}
  if(scenario.includes('crouch')&&s.state==='ride')inp.keys.add('KeyS');
  if(scenario.includes('steer')&&s.state==='ride'){if(s.ride.ft>.7)inp.keys.add('KeyA');else if(s.ride.ft<.3)inp.keys.add('KeyD');}
  s.update(1/60,i/60);
  if(s.msg&&prompts.at(-1)!==s.msg)prompts.push(s.msg);
 }
 Math.random=old;
 results[scenario]={end:result&&{...result,pos:result.pos.toArray()},state:s.state,finalFaceFraction:s.ride?.ft,messages:prompts};
}
const world={surfaceAt:()=>0,groundAt:()=>-30,nearbyColliders:()=>[],bounds:gbr.bounds};
for(const eq of [false,true]){
 const inp=input(), d=new Diver(new THREE.PerspectiveCamera(),inp,{});d.spawn(new THREE.Vector3(0,-.1,0));
 const events=[];let max=0;
 for(let i=0;i<60*30;i++){inp.keys.add('KeyC');inp.pressed.clear();if(eq&&i%45===0)inp.pressed.add('KeyQ');d.update(1/60,world);events.push(...d.takeEvents());max=Math.max(max,d.depthNow);}
 results['descent-'+eq]={maxDepth:max,depth:d.depthNow,ear:d.ear,events:[...new Set(events)]};
}
const inp=input(),d=new Diver(new THREE.PerspectiveCamera(),inp,{});d.spawn(new THREE.Vector3(0,-12,0));
let blackAt;
for(let i=0;i<60*130;i++){d.update(1/60,world);if(d.takeEvents().includes('blackout')){blackAt=i/60;break;}}
results.blackout={seconds:blackAt,depth:d.depthNow,breath:d.breath};
d.lowWarned=true;d.earWarned=true;d.spawn(new THREE.Vector3(0,-2,0));results.spawnFlags={lowWarned:d.lowWarned,earWarned:d.earWarned};
const cam=new THREE.PerspectiveCamera(50,1.6,.05,100);cam.updateMatrixWorld();
const photo=evaluatePhoto(cam,[{id:'parrotfish',pos:new THREE.Vector3(0,0,-2),r:.6,agent:{}},{id:'cleanerwrasse',pos:new THREE.Vector3(.7,0,-5),r:.15,agent:{cleaning:true}}]);
results.cleaningMisattribution={subject:photo.subject.id,behaviours:photo.behaviours,quality:photo.quality};
results.lab={dhw09:dhw(.9),dhw1:dhw(1),fullBleachPlotPercent:100*.5,baseline:simulate(gbr.labDefaults,5).at(-1)};
// Import the Game class without constructing WebGL or editing the source file.
let main=fs.readFileSync(new URL('../../../src/main.js',import.meta.url),'utf8');
main=main.slice(0,main.indexOf('const game = new Game();'))+'export { Game };';
main=main.replace(/from '(\.\/[^']+)'/g,(_,p)=>`from '${new URL(p,new URL('../../../src/main.js',import.meta.url)).href}'`);
globalThis.location={search:''};
const {Game}=await import('data:text/javascript;base64,'+Buffer.from(main).toString('base64'));
const el={style:{setProperty(){}},classList:{toggle(){},add(){},remove(){}},textContent:''};
globalThis.document={querySelector:()=>el};
const fake={diver:d,panels:{body:{querySelector:()=>({})}},settings:{freezeBreathInCards:false},eco:{surf:false},world:{waveMesh:{update(){}}},frame:1,cameraMode:false,onDiverEvent:e=>events.push(e)};
const events=[];d.breath=.01;d.depthNow=12;d.events=[];
Game.prototype.updateDive.call(fake,10,true);
results.cardZeroOxygen={breath:d.breath,events};
// Inspect quiz completion using the real panel code with a minimal DOM callback fixture.
const {Panels}=await import('../../../src/ui/panels.js');
const nodes=new Map();const node=k=>{if(!nodes.has(k))nodes.set(k,{...el,onclick:null,classList:el.classList});return nodes.get(k)};
globalThis.document={querySelector:s=>node(s)};
const buttons=[0,1,2,3].map(k=>({dataset:{k:String(k)},classList:el.classList}));
const body={innerHTML:'',querySelector:s=>node(s),querySelectorAll:()=>buttons};
const p={body,game:{persist(){},audio:{blip(){}}},open(){},close(){}};
const progress={missions:{}};
Panels.prototype.quiz.call(p,gbr,gbr.missions[0],progress);
for(let i=0;i<3;i++){const q=gbr.missions[0].questions[i];buttons[(q.answer+1)%4].onclick();node('#q-next').onclick();}
results.allWrongQuiz=progress.missions['gbr:read-the-waves'];
const logged={};const recorder={eco:gbr,progress:{journal:logged},persist(){},toast(){},checkMission(){}};
for(const id of ['clownfish','bluetang','moorishidol','cleanerwrasse','parrotfish'])Game.prototype.storePhoto.call(recorder,{subject:{id},quality:2,behaviours:[]},null);
results.fiveFishBookkeeping=Object.keys(logged);
const board={diver:{pos:new THREE.Vector3(0,-.1,0),depthNow:.1},boardPos:new THREE.Vector3(2,0,1),eco:gbr,startSurf(){this.returned=true},toast(){},boardDirection(){return ''}};
Game.prototype.tryBoard.call(board);results.boardReturnNearSurface=!!board.returned;
fs.writeFileSync(new URL('./probe-results.json',import.meta.url),JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
