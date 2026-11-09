import {Application,Container,Graphics,Sprite,Texture,Rectangle} from 'pixi.js';
const W=1440,H=900;
const BUILDINGS=[
{id:'amphitheater',x:50,y:218,w:240,h:183,kind:'monument'},
{id:'lager',x:323,y:245,w:190,h:148,kind:'building',cell:12},
{id:'forum',x:505,y:330,w:338,h:260,kind:'monument'},
{id:'thermen',x:898,y:231,w:270,h:213,kind:'monument'},
{id:'herberge',x:1161,y:266,w:195,h:159,kind:'building',cell:5},
{id:'werkstatt',x:1135,y:480,w:183,h:144,kind:'building',cell:7},
{id:'tempel',x:923,y:595,w:200,h:166,kind:'building',cell:13},
{id:'insula',x:135,y:546,w:208,h:170,kind:'building',cell:3},
{id:'wasser',x:405,y:666,w:118,h:110,kind:'building',cell:15},
{id:'tor',x:697,y:93,w:129,h:123,kind:'building',cell:14},
{id:'hafen',x:1230,y:661,w:183,h:157,kind:'harbor',cell:0}
];
const rect=(x,y,w,h,c,a=1)=>new Graphics().rect(x,y,w,h).fill({color:c,alpha:a});
const oval=(x,y,rx,ry,c,a=1)=>new Graphics().ellipse(x,y,rx,ry).fill({color:c,alpha:a});
const valid=img=>img&&img.complete&&img.naturalWidth>0;
const tex=img=>valid(img)?Texture.from(img):null;
function sheet(atlas,idx,columns,w,h){
 if(!atlas?.ready||!valid(atlas.img))return null;
 const base=tex(atlas.img);
 return new Texture({source:base.source,frame:new Rectangle((idx%columns)*w,Math.floor(idx/columns)*h,w,h)});
}
function tree(x,y,r){
 const c=new Container();c.position.set(x,y);
 c.addChild(oval(2,5,r,r*.35,0x243624,.35),oval(-2,-7,r*.8,r*.75,0x385d39),oval(3,-13,r*.6,r*.52,0x71875b));
 return c;
}
function paintBase(root){
 root.addChild(rect(0,0,W,H,0x899477));
 root.addChild(rect(0,0,W,200,0x8d9a83));
 for(let i=0;i<85;i++)root.addChild(tree((i*193)%W,38+(i*73)%176,9+i%6*2));
 root.addChild(rect(20,175,1210,708,0xb3a17e));
 root.addChild(rect(1290,175,150,725,0x447d88));
 root.addChild(rect(1258,276,38,624,0x91856b));
 const rows=[230,440,674,830],cols=[275,473,837,1084];
 for(const y of rows)root.addChild(rect(20,y,1225,49,0xc5b398));
 for(const x of cols)root.addChild(rect(x,195,47,680,0xc5b398));
 root.addChild(rect(460,315,423,325,0xcdb795));
 root.addChild(rect(15,154,670,24,0xa99b82),rect(844,154,388,24,0xa99b82));
 for(let x=17;x<1240;x+=22)if(x<679||x>843)root.addChild(rect(x,140,14,15,0xd3be9c));
 for(const x of [50,299,603,937,1165]){
  root.addChild(rect(x,114,49,68,0x9b8670),rect(x+5,104,39,14,0xb47550));
 }
 for(const y of [548,678,808]){root.addChild(rect(1250,y,145,13,0x92714f));for(let x=1265;x<1390;x+=35)root.addChild(rect(x,y+11,7,20,0x705439))}
}
function resource(key,assets){
 if(['forum','thermen','amphitheater'].includes(key))return tex(assets.monuments?.[key]?.img);
 return null;
}
function assetFor(o,a){
 if(o.kind==='monument')return resource(o.id,a);
 if(o.kind==='harbor')return sheet(a.atlases?.harbor,o.cell,4,170,132);
 return sheet(a.atlases?.buildings,o.cell,4,136,124);
}
function addBuilding(stage,o,a,click){
 const group=new Container();group.position.set(o.x,o.y);
 group.addChild(oval(o.w*.53,o.h*.91,o.w*.41,o.h*.08,0x3d3025,.26));
 const t=assetFor(o,a);
 if(t){const sp=new Sprite(t);sp.width=o.w;sp.height=o.h;group.addChild(sp)}
 else{group.addChild(rect(7,o.h*.3,o.w-14,o.h*.6,0xe3caa5));
 group.addChild(new Graphics().moveTo(0,o.h*.3).lineTo(o.w*.5,0).lineTo(o.w,o.h*.3).closePath().fill(0xb66743))}
 if(o.id){
  group.eventMode='static';group.cursor='pointer';
  group.on('pointertap',()=>{if(click)click(o.id)});
 }
 stage.addChild(group);return group;
}
function houses(){
 const out=[];
 for(let row=0;row<4;row++)for(let col=0;col<8;col++){
  const x=48+col*158+(row%2)*8,y=255+row*160,w=124,h=103;
  if(BUILDINGS.some(o=>x<o.x+o.w+18&&x+w>o.x-12&&y<o.y+o.h+12&&y+h>o.y-10))continue;
  if([440,674,830].some(v=>y<v+33&&y+h>v+8))continue;
  out.push({x,y,w,h,kind:'building',cell:(col*3+row)%5});
 }
 return out;
}
export class ColoniaPixi21{
 constructor({mount,assets,openBuilding=()=>{}}){this.mount=mount;this.assets=assets;this.openBuilding=openBuilding;this.active=false;this.actors=[];this.boats=[];this.pointers=new Map();this.zoom=1;this.panX=0;this.panY=0;this.seconds=0}
 async start(){
  if(this.active)return;
  this.app=new Application();
  await this.app.init({width:this.mount.clientWidth||800,height:this.mount.clientHeight||600,preference:'webgl',background:0x899477,resolution:Math.min(2,devicePixelRatio||1),autoDensity:true});
  this.canvas=this.app.canvas;
  Object.assign(this.canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',touchAction:'none',zIndex:'1'});
  this.mount.appendChild(this.canvas);
  this.world=new Container();this.app.stage.addChild(this.world);
  paintBase(this.world);
  for(const o of [...houses(),...BUILDINGS].sort((a,b)=>a.y+a.h-b.y-b.h))addBuilding(this.world,o,this.assets,id=>{if(!this.dragged)this.openBuilding(id)});
  this.population=new Container();this.world.addChild(this.population);
  for(let i=0;i<22;i++){
   const role=(i*3)%10,entity=new Container(),sp=sheet(this.assets.atlases?.people,role,4,64,88);
   entity.addChild(oval(0,1,7,2.5,0x393126,.35));
   if(sp){const img=new Sprite(sp);img.width=role===9?17:23;img.height=role===9?27:36;img.anchor.set(.5,1);entity.addChild(img)}
   else entity.addChild(rect(-3,-25,6,23,0xa47a53));
   this.population.addChild(entity);this.actors.push({entity,i});
  }
  for(let i=0;i<2;i++){const e=new Container(),sp=sheet(this.assets.atlases?.harbor,3,4,170,132);
   if(sp){const boat=new Sprite(sp);boat.anchor.set(.5,.5);boat.width=84;boat.height=70;e.addChild(boat)}
   else e.addChild(rect(-29,-8,58,16,0x76573b));
   this.world.addChild(e);this.boats.push({entity:e,i})}
  this.active=true;this.resize();this.bind();
  this.tickFn=t=>this.tick(t.deltaMS/1000);this.app.ticker.add(this.tickFn);
 }
 resize(){if(!this.active)return;const w=Math.max(1,this.mount.clientWidth),h=Math.max(1,this.mount.clientHeight);
  this.app.renderer.resize(w,h);this.factor=Math.max(w/W,h/H)*this.zoom;
  this.world.scale.set(this.factor);this.world.position.set((w-W*this.factor)/2+this.panX,(h-H*this.factor)/2+this.panY);
 }
 bind(){
  const cv=this.canvas;
  this.down=e=>{e.stopPropagation();e.preventDefault();cv.setPointerCapture?.(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});this.dragged=false;this.start={x:e.clientX,y:e.clientY};
   if(this.pointers.size===2){const [a,b]=[...this.pointers.values()];this.pinching={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:this.zoom}}};
  this.move=e=>{if(!this.pointers.has(e.pointerId))return;e.stopPropagation();e.preventDefault();const p=this.pointers.get(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(this.pointers.size===2&&this.pinching){const [a,b]=[...this.pointers.values()];this.zoom=Math.max(.8,Math.min(3,this.pinching.zoom*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,this.pinching.distance)));this.dragged=true;this.resize()}
   else {if(Math.hypot(e.clientX-this.start.x,e.clientY-this.start.y)>9)this.dragged=true;
    if(this.dragged){this.panX+=e.clientX-p.x;this.panY+=e.clientY-p.y;this.resize()}}};
  this.up=e=>{if(!this.pointers.has(e.pointerId))return;e.stopPropagation();this.pointers.delete(e.pointerId);
   if(!this.pointers.size){this.pinching=null;this.dragged=false}};
  cv.addEventListener('pointerdown',this.down,{passive:false});
  cv.addEventListener('pointermove',this.move,{passive:false});
  cv.addEventListener('pointerup',this.up);cv.addEventListener('pointercancel',this.up);
 }
 tick(dt){this.seconds+=Math.min(.07,dt);
  for(const {entity,i} of this.actors){const span=1150;const a=(i*61+this.seconds*(18+i%6*5))%(span*2);entity.x=a>span?1220-(a-span):70+a;entity.y=[293,510,735][i%3]+Math.sin(this.seconds*6+i)*.7;entity.scale.x=a>span?-1:1}
  for(const {entity,i} of this.boats){entity.x=1354+Math.sin(this.seconds*.3+i)*20;entity.y=360+((this.seconds*(i?21:30)+i*260)%480)}
 }
 zoomBy(k){this.zoom=Math.max(.8,Math.min(3,this.zoom*k));this.resize()}
 reset(){this.zoom=1;this.panX=0;this.panY=0;this.resize()}
 stop(){if(!this.active)return;this.active=false;this.canvas.removeEventListener('pointerdown',this.down);this.canvas.removeEventListener('pointermove',this.move);this.canvas.removeEventListener('pointerup',this.up);this.canvas.removeEventListener('pointercancel',this.up);this.app.ticker.remove(this.tickFn);this.app.destroy(true,{children:true,texture:false,textureSource:false});this.app=null}
}
window.ColoniaPixi21=ColoniaPixi21;
