import { Input } from './input';
import { createPlayer, updatePlayer, type Player } from '../entities/player';
import { platforms, TILE } from '../world/level';
import { mulberry32 } from './rng';

const W=384, H=216;
type Pickup={x:number;y:number;taken:boolean};
type Microbot={x:number;y:number;home:number;dir:1|-1;alive:boolean;phase:number};
type Fist={x:number;y:number;dir:1|-1;life:number};
type Flame={x:number;y:number;dir:1|-1;life:number};
type AutonomousBaymax={x:number;y:number;facing:1|-1;fireTimer:number;stride:number};
export class Game {
  private canvas:HTMLCanvasElement; private ctx:CanvasRenderingContext2D; private surface:HTMLCanvasElement; private sctx:CanvasRenderingContext2D;
  private input=new Input(); private player:Player=createPlayer(); private raf=0; private last=0; private acc=0; private camera=0; private debug=false; private paused=false; private won=false; private fistCooldown=0;
  private rng=mulberry32(42); private dust=Array.from({length:34},()=>({x:this.rng()*W,y:this.rng()*H,s:this.rng()*.5+.18}));
  private walkFrames = ['/assets/game/baymax-walk-a-sprite.png','/assets/game/baymax-walk-b-sprite.png'].map((src) => { const image = new Image(); image.src = src; return image; });
  private pickups:Pickup[]=[126,181,230,322,496,548,704,739,902,944,1118].map((x,i)=>({x,y:i%3===0?130:i%3===1?155:102,taken:false}));
  private bots:Microbot[]=[];
  private fists:Fist[]=[];
  private flames:Flame[]=[];
  private baymax:AutonomousBaymax={x:146,y:121,facing:-1,fireTimer:.75,stride:0};
  constructor(canvas:HTMLCanvasElement) { this.canvas=canvas; this.ctx=canvas.getContext('2d')!; this.surface=document.createElement('canvas'); this.surface.width=W; this.surface.height=H; this.sctx=this.surface.getContext('2d')!; this.sctx.imageSmoothingEnabled=false; }
  start() { this.input.attach(); this.resize(); addEventListener('resize',this.resize); this.last=performance.now(); this.raf=requestAnimationFrame(this.frame); }
  stop() { cancelAnimationFrame(this.raf); this.input.detach(); removeEventListener('resize',this.resize); }
  private resize=()=>{ const scale=Math.max(1,Math.floor(Math.min(innerWidth/W,innerHeight/H))); this.canvas.width=W*scale; this.canvas.height=H*scale; this.canvas.style.width=`${W*scale}px`; this.canvas.style.height=`${H*scale}px`; this.ctx.imageSmoothingEnabled=false; };
  private frame=(now:number)=>{ const elapsed=Math.min(.1,(now-this.last)/1000); this.last=now; this.acc+=elapsed; while(this.acc>=1/60){this.step(1/60);this.acc-=1/60;} this.render();this.raf=requestAnimationFrame(this.frame); };
  private step(dt:number){
    if(this.input.state.pausePressed)this.paused=!this.paused; if(this.input.state.debugPressed)this.debug=!this.debug;
    if(this.input.state.restartPressed&&(this.player.cells===0||this.won))this.reset();
    if(!this.paused&&!this.won&&this.player.cells>0){
      updatePlayer(this.player,this.input.state,dt);
      if(this.input.state.jump){this.player.vy=-92;this.player.grounded=false;}
      this.player.y=Math.max(42,Math.min(151,this.player.y));
      this.updateBaymax(dt);
      this.fistCooldown=Math.max(0,this.fistCooldown-dt);
      if(this.input.state.fist&&this.fistCooldown===0){this.fists.push({x:this.player.x+this.player.facing*9,y:this.player.y+9,dir:this.player.facing,life:.18});this.fistCooldown=.22;}
      for(const fist of this.fists){fist.x+=fist.dir*250*dt;fist.life-=dt;}
      this.fists=this.fists.filter(f=>f.life>0);
      for(const flame of this.flames){flame.x+=flame.dir*95*dt;flame.life-=dt;if(Math.abs(flame.x-this.player.x)<8&&Math.abs(flame.y-this.player.y)<18){this.player.cells=Math.max(0,this.player.cells-1);flame.life=0;}}
      this.flames=this.flames.filter(f=>f.life>0);
      for(const gear of this.pickups) if(!gear.taken&&Math.abs(this.player.x-gear.x)<10&&Math.abs(this.player.y-gear.y)<18){gear.taken=true;this.player.gears++;}
      for(const bot of this.bots) if(bot.alive){
        bot.x+=bot.dir*(22+Math.sin(performance.now()/600+bot.phase)*8)*dt;
        if(Math.abs(bot.x-bot.home)>38)bot.dir=(bot.x>bot.home?-1:1);
        if(this.fists.some(f=>Math.abs(f.x-bot.x)<12&&Math.abs(f.y-bot.y)<13)){bot.alive=false;this.player.gears+=2;}
        if(Math.abs(this.player.x-bot.x)<9&&Math.abs(this.player.y-bot.y)<17){this.player.cells=Math.max(0,this.player.cells-1);bot.home+=bot.dir*26;this.player.x-=this.player.facing*18;}
      }
      if(this.player.x>1194&&this.pickups.filter(p=>p.taken).length>=6)this.won=true;
      const look=this.player.facing*36; this.camera+=(this.player.x-W*.43+look-this.camera)*Math.min(1,dt*5);
    }
    this.input.endFrame();
  }
  private updateBaymax(dt:number){const direction=this.player.x>this.baymax.x?1:-1;this.baymax.facing=direction;this.baymax.x+=direction*28*dt;this.baymax.x=Math.max(26,Math.min(1180,this.baymax.x));this.baymax.fireTimer-=dt;this.baymax.stride+=dt*4;if(this.baymax.fireTimer<=0){this.flames.push({x:this.baymax.x+direction*13,y:this.baymax.y+12,dir:direction,life:2.5});this.baymax.fireTimer=1.2;}}
  private reset(){this.player=createPlayer();this.camera=0;this.won=false;this.fists=[];this.flames=[];this.fistCooldown=0;this.baymax={x:146,y:121,facing:-1,fireTimer:.75,stride:0};this.pickups.forEach(p=>p.taken=false);}
  private rect(x:number,y:number,w:number,h:number,c:string){this.sctx.fillStyle=c;this.sctx.fillRect(Math.round(x-this.camera),Math.round(y),w,h);}
  private render(){ const c=this.sctx; c.clearRect(0,0,W,H); const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#14122b');sky.addColorStop(.52,'#1e1b4b');sky.addColorStop(.92,'#2b3a8c');sky.addColorStop(1,'#1f8f78');c.fillStyle=sky;c.fillRect(0,0,W,H);
    // portal and far scrap silhouettes
    c.save();c.translate(306,43);c.rotate(performance.now()/13000);c.strokeStyle='#2fd3a0';c.lineWidth=3;c.beginPath();c.arc(0,0,25,0,Math.PI*1.75);c.stroke();c.strokeStyle='#b692f6';c.beginPath();c.arc(0,0,20,Math.PI*.15,Math.PI*1.9);c.stroke();c.restore();
    c.fillStyle='#465276';for(let i=0;i<12;i++){const x=((i*49-this.camera*.15)%470+470)%470;c.fillRect(x,108-(i%4)*9,38,75);} c.fillStyle='#222a4b';for(let i=0;i<13;i++){const x=((i*67-this.camera*.35)%520+520)%520;c.fillRect(x,134-(i%3)*11,55,50);}
    for(const d of this.dust){d.x-=d.s;if(d.x<0)d.x=W; c.fillStyle='rgba(230,245,230,.28)';c.fillRect(d.x,d.y,1,1);}
    for(const p of platforms){this.rect(p.x,p.y,p.w,p.h,'#54382a');this.rect(p.x,p.y,p.w,2,'#5bbf5b');this.rect(p.x,p.y+2,p.w,2,'#8be08a');for(let x=p.x;x<p.x+p.w;x+=16){this.rect(x,p.y+5,1,p.h-5,'#6b4a33');this.rect(x+7,p.y+8,3,2,'#a58b73');}}
    this.drawPickups();this.drawPortal();this.drawBaymax();this.drawPixel();this.drawFists();this.drawFlames(); this.drawHud(); this.ctx.fillStyle='#101312';this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);this.ctx.drawImage(this.surface,0,0,this.canvas.width,this.canvas.height);
  }
  private drawPickups(){for(const p of this.pickups)if(!p.taken){const x=Math.round(p.x-this.camera),y=p.y;this.sctx.fillStyle='#ffdf53';this.sctx.fillRect(x-2,y,5,7);this.sctx.fillStyle='#fff4b3';this.sctx.fillRect(x-1,y+1,2,5);}}
  private drawMicrobots(){for(const b of this.bots)if(b.alive){const x=Math.round(b.x-this.camera),y=Math.round(b.y+Math.sin(performance.now()/180+b.phase)*2);const c=this.sctx;c.fillStyle='#20213d';c.fillRect(x-5,y-5,10,6);c.fillStyle='#5ce5db';c.fillRect(x-3,y-3,2,2);c.fillRect(x+1,y-3,2,2);c.fillStyle='#0d1023';c.fillRect(x-6,y+1,3,3);c.fillRect(x+3,y+1,3,3);}}
  private drawPortal(){const x=Math.round(1216-this.camera),c=this.sctx;c.save();c.translate(x,137);c.strokeStyle='#2fd3a0';c.lineWidth=3;c.beginPath();c.arc(0,0,16,0,Math.PI*2);c.stroke();c.strokeStyle='#b692f6';c.beginPath();c.arc(0,0,11,.5,Math.PI*1.8);c.stroke();c.restore();}
  private drawFists(){for(const f of this.fists){const x=Math.round(f.x-this.camera),y=Math.round(f.y);this.sctx.fillStyle='#f7eff1';this.sctx.fillRect(x-4,y-3,8,6);this.sctx.fillStyle='#ff899c';this.sctx.fillRect(x+(f.dir*4),y-2,4,4);}}
  private drawPixel(){const p=this.player,x=Math.round(p.x-this.camera),y=Math.round(p.y),c=this.sctx;c.save();c.translate(x+5,y+11);c.scale(p.facing,1);c.translate(-5,-11);c.fillStyle='#101312';c.fillRect(0,7,11,12);c.fillStyle='#4a5560';c.fillRect(1,6,9,10);c.fillStyle='#2b3340';c.fillRect(2,4,7,4);c.fillStyle='#4fc3f7';c.fillRect(3,6,2,2);c.fillRect(7,6,2,2);c.fillStyle='#b692f6';c.fillRect(3,17,2,3);c.fillRect(7,17,2,3);c.restore();}
  private drawBaymax(){const b=this.baymax,x=Math.round(b.x-this.camera),y=Math.round(b.y),c=this.sctx;const frame=this.walkFrames[Math.floor(b.stride)%2];c.save();c.translate(x+8,y+12);c.scale(b.facing,1);c.translate(-8,-12);if(frame.complete&&frame.naturalWidth)c.drawImage(frame,-11,-15+Math.sin(b.stride)*1,36,53);else{c.fillStyle='#f2f4f5';c.fillRect(2,5,13,20);c.fillRect(4,0,9,8);c.fillStyle='#101312';c.fillRect(6,3,1,1);c.fillRect(10,3,1,1);}c.restore();}
  private drawFlames(){for(const f of this.flames){const x=Math.round(f.x-this.camera),y=Math.round(f.y),c=this.sctx;c.fillStyle='#a83232';c.fillRect(x-5,y-3,10,6);c.fillStyle='#ff5c5c';c.fillRect(x-3,y-2,8,4);c.fillStyle='#ffd54f';c.fillRect(x-1,y-1,4,2);}}
  private drawHud(){const c=this.sctx;c.fillStyle='#101312';c.fillRect(7,7,116,17);c.fillStyle='#f2f4f5';c.font='8px monospace';c.fillText(`PIXEL ${'▰'.repeat(this.player.cells)}  ${String(this.player.gears).padStart(3,'0')}`,11,18);c.font='7px monospace';c.fillText('PORTAL',329,13);c.fillStyle='#4b5560';c.fillRect(297,17,76,5);c.fillStyle='#2fd3a0';c.fillRect(297,17,Math.min(76,this.player.x/1216*76),5); if(this.paused){c.fillStyle='#101312';c.fillRect(101,77,182,45);c.fillStyle='#f2f4f5';c.font='15px monospace';c.fillText('PAUSED',142,96);c.font='8px monospace';c.fillText('P / ESC TO RESUME',128,109);} if(this.won){c.fillStyle='#101312';c.fillRect(80,70,224,62);c.fillStyle='#2fd3a0';c.font='15px monospace';c.fillText('PORTAL REACHED',115,96);c.fillStyle='#f2f4f5';c.font='8px monospace';c.fillText('PRESS R TO REPLAY.',132,112);} if(this.player.cells===0){c.fillStyle='#101312';c.fillRect(80,70,224,62);c.fillStyle='#ff5c5c';c.font='15px monospace';c.fillText('PIXEL DOWN',134,96);c.fillStyle='#f2f4f5';c.font='8px monospace';c.fillText('PRESS R TO TRY AGAIN.',120,112);} if(this.debug){c.fillStyle='#a6e34f';c.font='7px monospace';c.fillText(`F3 X:${this.player.x|0} Y:${this.player.y|0}`,8,207);} }
}
