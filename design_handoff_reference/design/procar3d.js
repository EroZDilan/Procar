(function(){
const CYAN=0xE3B55B, AMBER=0xFFB23E, RED=0xFF4D2E;
function mkRenderer(canvas){
  const r=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  r.outputEncoding=THREE.sRGBEncoding;
  return r;
}
function fit(r,cam,canvas){
  const w=canvas.clientWidth,h=canvas.clientHeight;
  if(!w||!h)return;
  const s=r.getSize(new THREE.Vector2());
  if(s.x!==w||s.y!==h){r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
}
function dragger(canvas,state){
  let down=false,lx=0,ly=0;
  canvas.style.touchAction='pan-y';canvas.style.cursor='grab';
  const pd=e=>{down=true;lx=e.clientX;ly=e.clientY;canvas.style.cursor='grabbing';state.interacted=true;};
  const pm=e=>{if(!down)return;state.dragY+=(e.clientX-lx)*0.008;state.dragX=Math.max(-0.6,Math.min(0.6,state.dragX+(e.clientY-ly)*0.004));lx=e.clientX;ly=e.clientY;};
  const pu=()=>{down=false;canvas.style.cursor='grab';};
  canvas.addEventListener('pointerdown',pd);window.addEventListener('pointermove',pm);window.addEventListener('pointerup',pu);
  const hover=e=>{const b=canvas.getBoundingClientRect();state.mx=((e.clientX-b.left)/b.width-.5);state.my=((e.clientY-b.top)/b.height-.5);};
  window.addEventListener('pointermove',hover);
  return ()=>{canvas.removeEventListener('pointerdown',pd);window.removeEventListener('pointermove',pm);window.removeEventListener('pointerup',pu);window.removeEventListener('pointermove',hover);};
}
function rng(seed){let s=seed;return()=>((s=Math.imul(s^s>>>15,1|s)+0x6D2B79F5|0,((s^s>>>14)>>>0)/4294967296));}

function chip(canvas,opts={}){
  const r=mkRenderer(canvas),scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(32,1,0.1,100);
  cam.position.set(0,7.2,8.6);cam.lookAt(0,0,0);let lastAsp=0;
  scene.add(new THREE.HemisphereLight(0xbfd8ff,0x05070a,0.55));
  const key=new THREE.DirectionalLight(0xffffff,1.1);key.position.set(4,8,5);scene.add(key);
  const rim=new THREE.DirectionalLight(CYAN,0.6);rim.position.set(-6,3,-4);scene.add(rim);
  const glow=new THREE.PointLight(CYAN,2,6);glow.position.set(0,1.2,0);scene.add(glow);
  const root=new THREE.Group();scene.add(root);
  const rand=rng(7);
  const board=new THREE.Mesh(new THREE.BoxGeometry(8,0.16,5.4),new THREE.MeshStandardMaterial({color:0x0b1418,metalness:0.35,roughness:0.55}));
  root.add(board);
  const edge=new THREE.LineSegments(new THREE.EdgesGeometry(board.geometry),new THREE.LineBasicMaterial({color:CYAN,transparent:true,opacity:0.35}));
  root.add(edge);
  const top=0.08;
  // halo
  const hc=document.createElement('canvas');hc.width=hc.height=256;const hg=hc.getContext('2d');
  const grd=hg.createRadialGradient(128,128,0,128,128,128);grd.addColorStop(0,'rgba(227,181,91,.9)');grd.addColorStop(.35,'rgba(227,181,91,.25)');grd.addColorStop(1,'rgba(227,181,91,0)');hg.fillStyle=grd;hg.fillRect(0,0,256,256);
  const haloMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(hc),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
  const halo=new THREE.Mesh(new THREE.PlaneGeometry(5.5,5.5),haloMat);halo.rotation.x=-Math.PI/2;halo.position.y=top+0.005;root.add(halo);
  // chip
  const chipM=new THREE.Mesh(new THREE.BoxGeometry(2.1,0.32,2.1),new THREE.MeshStandardMaterial({color:0x0a0b0d,metalness:0.55,roughness:0.32}));
  chipM.position.y=top+0.16;root.add(chipM);
  const lc=document.createElement('canvas');lc.width=lc.height=512;const lg=lc.getContext('2d');
  lg.fillStyle='#0c0d10';lg.fillRect(0,0,512,512);lg.strokeStyle='rgba(255,255,255,.12)';lg.lineWidth=4;lg.strokeRect(24,24,464,464);
  lg.beginPath();lg.arc(70,70,14,0,Math.PI*2);lg.fillStyle='rgba(255,255,255,.2)';lg.fill();
  lg.fillStyle='rgba(238,240,236,.85)';lg.font='700 64px Archivo, Arial';lg.fillText('PROCAR',60,250);
  lg.fillStyle='rgba(227,181,91,.9)';lg.font='500 34px monospace';lg.fillText('ECM-17 · 5.00V',60,310);
  lg.fillStyle='rgba(238,240,236,.35)';lg.font='400 26px monospace';lg.fillText('DIAG / CAN-BUS / PROG',60,440);
  const label=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.9),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(lc),roughness:0.4,metalness:0.2}));
  label.rotation.x=-Math.PI/2;label.position.y=top+0.321;root.add(label);
  // pins + traces
  const pinMat=new THREE.MeshStandardMaterial({color:0xc9d1d9,metalness:1,roughness:0.25});
  const traceMat=new THREE.MeshStandardMaterial({color:0x1d3a42,emissive:CYAN,emissiveIntensity:0.12,metalness:0.6,roughness:0.4});
  const paths=[];
  const N=9;
  for(let side=0;side<4;side++){
    for(let i=0;i<N;i++){
      const o=-0.84+i*(1.68/(N-1));
      const pin=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.05,0.3),pinMat);
      const a=side*Math.PI/2;
      const dir=new THREE.Vector3(Math.sin(a),0,Math.cos(a)),perp=new THREE.Vector3(Math.cos(a),0,-Math.sin(a));
      const p0=dir.clone().multiplyScalar(1.2).add(perp.clone().multiplyScalar(o));
      pin.position.copy(p0).setY(top+0.04);pin.rotation.y=a;root.add(pin);
      const ext=side%2===0?2.5:3.7;
      const bend=0.35+rand()*0.6;
      const sgn=o>=0?1:-1;
      const pts=[p0.clone().add(dir.clone().multiplyScalar(0.15))];
      pts.push(pts[0].clone().add(dir.clone().multiplyScalar(bend)));
      const diag=0.3+rand()*0.9;
      pts.push(pts[1].clone().add(dir.clone().multiplyScalar(diag)).add(perp.clone().multiplyScalar(diag*sgn)));
      const last=pts[2].clone();const along=dir.clone().multiplyScalar(ext-last.dot(dir));
      pts.push(last.add(along));
      for(let k=0;k<pts.length-1;k++){
        const A=pts[k],B=pts[k+1],len=A.distanceTo(B);
        const seg=new THREE.Mesh(new THREE.BoxGeometry(0.035,0.012,len),traceMat);
        seg.position.copy(A).add(B).multiplyScalar(0.5).setY(top+0.006);seg.lookAt(B.x,top+0.006,B.z);root.add(seg);
      }
      const lens=[];let tot=0;for(let k=0;k<pts.length-1;k++){const l=pts[k].distanceTo(pts[k+1]);lens.push(l);tot+=l;}
      paths.push({pts,lens,tot});
      const via=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.02,12),pinMat);via.position.copy(pts[pts.length-1]).setY(top+0.01);root.add(via);
    }
  }
  // components
  const capMat=new THREE.MeshStandardMaterial({color:0x1a1d22,metalness:0.7,roughness:0.35});
  const capTop=new THREE.MeshStandardMaterial({color:0x9aa3ad,metalness:1,roughness:0.3});
  [[-3,-1.9],[-2.4,-2],[3.1,1.8],[2.5,1.95],[-3.2,1.7]].forEach(([x,z])=>{
    const c=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,0.55,24),capMat);c.position.set(x,top+0.28,z);root.add(c);
    const t=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.02,24),capTop);t.position.set(x,top+0.56,z);root.add(t);
  });
  const smdMat=new THREE.MeshStandardMaterial({color:0x222428,roughness:0.5});
  for(let i=0;i<26;i++){const x=(rand()-.5)*7.2,z=(rand()-.5)*4.8;if(Math.abs(x)<1.6&&Math.abs(z)<1.6)continue;
    const s=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.06,0.09),smdMat);s.position.set(x,top+0.03,z);s.rotation.y=rand()>.5?0:Math.PI/2;root.add(s);}
  const conn=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.5,3),new THREE.MeshStandardMaterial({color:0x121417,roughness:0.6}));conn.position.set(-3.45,top+0.25,0);root.add(conn);
  for(let i=0;i<12;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),pinMat);p.position.set(-3.1,top+0.3,-1.2+i*0.22);root.add(p);}
  const ledMat=new THREE.MeshBasicMaterial({color:CYAN});
  const led=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.06,0.1),ledMat);led.position.set(1.7,top+0.03,-1.7);root.add(led);
  // pulses
  const pulseMat=new THREE.MeshBasicMaterial({color:CYAN,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
  const pulseGeo=new THREE.SphereGeometry(0.055,10,10),pulseGlowGeo=new THREE.SphereGeometry(0.16,12,12);
  const glowMat=new THREE.MeshBasicMaterial({color:CYAN,transparent:true,opacity:0.22,blending:THREE.AdditiveBlending,depthWrite:false});
  const pulses=paths.map((p,i)=>{const m=new THREE.Mesh(pulseGeo,pulseMat);m.add(new THREE.Mesh(pulseGlowGeo,glowMat));root.add(m);return{m,path:p,t:rand(),speed:0.25+rand()*0.35};});
  function along(p,t){let d=t*p.tot;for(let k=0;k<p.lens.length;k++){if(d<=p.lens[k]){return p.pts[k].clone().lerp(p.pts[k+1],d/p.lens[k]);}d-=p.lens[k];}return p.pts[p.pts.length-1].clone();}
  const st={dragX:0,dragY:0,mx:0,my:0,volts:opts.volts??5,scroll:0,offsetX:opts.offsetX||0};
  const unDrag=dragger(canvas,st);
  const col=new THREE.Color();
  let raf,last=performance.now(),rx=0,ry=0,alive=1;
  function loop(now){
    const dt=Math.min(0.05,(now-last)/1000);last=now;
    fit(r,cam,canvas);
    if(cam.aspect!==lastAsp){lastAsp=cam.aspect;const d=Math.max(5.6/(0.287*cam.aspect),4.4/0.287)*(opts.zoom||1);const k=d/11.2;cam.position.set(0,7.2*k,8.6*k);cam.lookAt(0,0,0);}
    const v=st.volts,target=v/5;alive+=(target-alive)*Math.min(1,dt*6);
    const warn=v>0.2&&v<4.8,dead=v<=0.2;
    col.set(dead?RED:warn?AMBER:CYAN);
    pulseMat.color.copy(col);glowMat.color.copy(col);traceMat.emissive.copy(col);glow.color.copy(col);ledMat.color.copy(col);
    const flick=warn?(0.55+0.45*Math.sin(now*0.03)*Math.sin(now*0.011)):1;
    traceMat.emissiveIntensity=0.05+alive*0.35*flick;
    glow.intensity=alive*2.4*flick;haloMat.opacity=alive*0.8*flick;
    ledMat.color.multiplyScalar(dead?0.15:1);
    pulses.forEach(p=>{p.t=(p.t+dt*p.speed*alive*(warn?0.6:1))%1;p.m.position.copy(along(p.path,p.t)).setY(top+0.04);p.m.visible=!dead;p.m.scale.setScalar(0.6+alive*0.6);});
    const tyy=st.dragY+Math.sin(now*0.00025)*0.35+st.mx*0.5+st.scroll*0.8;
    const txx=0.08+st.dragX+st.my*0.25+st.scroll*0.25;
    ry+=(tyy-ry)*Math.min(1,dt*4);rx+=(txx-rx)*Math.min(1,dt*4);
    root.rotation.set(rx,ry,0);root.position.x=st.offsetX;
    r.render(scene,cam);raf=requestAnimationFrame(loop);
  }
  raf=requestAnimationFrame(loop);
  return{setVolts:v=>{st.volts=v;},setScroll:s=>{st.scroll=s;},setOffset:x=>{st.offsetX=x;},dispose:()=>{cancelAnimationFrame(raf);unDrag();r.dispose();}};
}

function network(canvas,opts={}){
  const r=mkRenderer(canvas),scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(30,1,0.1,100);cam.position.set(0,2.4,8.2);cam.lookAt(0,0.1,0);
  const root=new THREE.Group();scene.add(root);
  const rand=rng(11);
  const pos=[];
  function sup(ax,ay,az,cx,cy,cz,n,count,minY){
    for(let i=0;i<count;i++){
      let x=rand()*2-1,y=rand()*2-1,z=rand()*2-1;const l=Math.sqrt(x*x+y*y+z*z)||1;x/=l;y/=l;z/=l;
      const s=1/Math.pow(Math.pow(Math.abs(x),n)+Math.pow(Math.abs(y),n)+Math.pow(Math.abs(z),n),1/n);
      const py=cy+y*s*ay;if(minY!==undefined&&py<minY)continue;
      pos.push(cx+x*s*ax,py,cz+z*s*az);
    }
  }
  sup(2.35,0.42,0.95,0,0,0,3.2,2600);
  sup(1.25,0.42,0.82,0.25,0.62,0,2.6,1300,0.42);
  [[-1.45,0.95],[1.45,0.95],[-1.45,-0.95],[1.45,-0.95]].forEach(([x,z])=>{for(let i=0;i<120;i++){const a=i/120*Math.PI*2;pos.push(x+Math.cos(a)*0.4,-0.42+Math.sin(a)*0.4,z);pos.push(x+Math.cos(a)*0.26,-0.42+Math.sin(a)*0.26,z);}});
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  const pm=new THREE.PointsMaterial({color:0xEEF0EC,size:0.022,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending,depthWrite:false});
  root.add(new THREE.Points(pg,pm));
  const floor=new THREE.GridHelper(9,36,0xE3B55B,0x1a2a30);floor.position.y=-0.84;floor.material.transparent=true;floor.material.opacity=0.25;root.add(floor);
  const nodes=(opts.nodes||[]).map(n=>new THREE.Vector3(...n.p));
  const gw=nodes.findIndex((n,i)=>opts.nodes[i].hub);
  const lineMat=new THREE.LineBasicMaterial({color:CYAN,transparent:true,opacity:0.55});
  const curves=[];
  nodes.forEach((p,i)=>{if(i===gw)return;const a=nodes[gw],mid=a.clone().add(p).multiplyScalar(0.5);mid.y+=0.35;
    const c=new THREE.QuadraticBezierCurve3(a,mid,p);curves.push({c,i});
    const g=new THREE.BufferGeometry().setFromPoints(c.getPoints(40));root.add(new THREE.Line(g,lineMat));});
  const nodeMat=[],meshes=[];
  const hitGeo=new THREE.SphereGeometry(0.28,8,8),hitMat=new THREE.MeshBasicMaterial({visible:false});
  nodes.forEach((p,i)=>{const m=new THREE.MeshBasicMaterial({color:i===gw?0xEEF0EC:CYAN});nodeMat.push(m);
    const s=new THREE.Mesh(new THREE.SphereGeometry(i===gw?0.12:0.085,20,20),m);s.position.copy(p);root.add(s);
    const ring=new THREE.Mesh(new THREE.RingGeometry(0.16,0.19,32),new THREE.MeshBasicMaterial({color:CYAN,transparent:true,opacity:0.6,side:THREE.DoubleSide}));ring.position.copy(p);s.userData.ring=ring;root.add(ring);
    const h=new THREE.Mesh(hitGeo,hitMat);h.position.copy(p);h.userData.i=i;root.add(h);meshes.push({s,h,ring});});
  const pmat=new THREE.MeshBasicMaterial({color:CYAN,transparent:true,blending:THREE.AdditiveBlending});
  const pgeo=new THREE.SphereGeometry(0.035,8,8);
  const pulses=[];curves.forEach(cv=>{for(let k=0;k<2;k++){const m=new THREE.Mesh(pgeo,pmat);root.add(m);pulses.push({m,cv,t:rand(),dir:k?1:-1,sp:0.25+rand()*0.3});}});
  const labels=opts.labelsEl?nodes.map((_,i)=>{const d=document.createElement('div');d.textContent=opts.nodes[i].name;
    d.style.cssText="position:absolute;left:0;top:0;pointer-events:none;font:600 11px 'JetBrains Mono',monospace;letter-spacing:.1em;color:#EEF0EC;background:rgba(12,14,17,.8);border:1px solid rgba(227,181,91,.4);padding:3px 6px;white-space:nowrap;transform:translate(-50%,-190%);transition:background .2s,color .2s";
    opts.labelsEl.appendChild(d);return d;}):[];
  const st={dragX:0,dragY:0,mx:0,my:0,hover:-1};
  const unDrag=dragger(canvas,st);
  const ray=new THREE.Raycaster(),mv=new THREE.Vector2();let lastHover=-1;
  const onMove=e=>{const b=canvas.getBoundingClientRect();mv.set(((e.clientX-b.left)/b.width)*2-1,-((e.clientY-b.top)/b.height)*2+1);
    ray.setFromCamera(mv,cam);const hit=ray.intersectObjects(meshes.map(m=>m.h))[0];const i=hit?hit.object.userData.i:-1;
    if(i!==lastHover){lastHover=i;st.hover=i;opts.onHover&&opts.onHover(i);}};
  canvas.addEventListener('pointermove',onMove);
  canvas.addEventListener('pointerleave',()=>{if(lastHover!==-1){lastHover=-1;st.hover=-1;opts.onHover&&opts.onHover(-1);}});
  let raf,last=performance.now(),ry=-0.6,rx=0;const v=new THREE.Vector3();
  function loop(now){const dt=Math.min(0.05,(now-last)/1000);last=now;fit(r,cam,canvas);
    const tyy=-0.6+st.dragY+Math.sin(now*0.0002)*0.5+st.mx*0.4,txx=0.1+st.dragX+st.my*0.15;
    ry+=(tyy-ry)*Math.min(1,dt*3);rx+=(txx-rx)*Math.min(1,dt*3);root.rotation.set(rx,ry,0);
    pulses.forEach(p=>{p.t=(p.t+dt*p.sp)%1;p.m.position.copy(p.cv.c.getPoint(p.dir>0?p.t:1-p.t));});
    meshes.forEach((m,i)=>{const on=st.hover===i;const sc=on?1.9:1+0.12*Math.sin(now*0.004+i);m.s.scale.setScalar(sc);m.ring.lookAt(cam.position.clone().applyMatrix4(root.matrixWorld.clone().invert()));m.ring.scale.setScalar(on?1.8:1+0.2*Math.sin(now*0.003+i));
      nodeMat[i].color.set(on?0xFFFFFF:(i===gw?0xEEF0EC:CYAN));});
    root.updateMatrixWorld();
    const w=canvas.clientWidth,h=canvas.clientHeight;
    labels.forEach((d,i)=>{v.copy(nodes[i]).applyMatrix4(root.matrixWorld).project(cam);d.style.left=((v.x+1)/2*w)+'px';d.style.top=((1-v.y)/2*h)+'px';
      const on=st.hover===i;d.style.background=on?'#E3B55B':'rgba(12,14,17,.8)';d.style.color=on?'#0C0E11':'#EEF0EC';d.style.zIndex=on?2:1;});
    r.render(scene,cam);raf=requestAnimationFrame(loop);}
  raf=requestAnimationFrame(loop);
  return{setHover:i=>{st.hover=i;},dispose:()=>{cancelAnimationFrame(raf);unDrag();canvas.removeEventListener('pointermove',onMove);labels.forEach(l=>l.remove());r.dispose();}};
}
function envFor(r){
  const pm=new THREE.PMREMGenerator(r),es=new THREE.Scene();
  es.add(new THREE.Mesh(new THREE.BoxGeometry(20,20,20),new THREE.MeshBasicMaterial({color:0x0a0a0c,side:THREE.BackSide})));
  [[0,8,0,14,2,0xffffff,1.2],[-8,2,4,2,8,0xE3B55B,1.0],[8,1,-2,2,6,0xffffff,0.8],[0,-3,8,10,1,0xffffff,0.35]].forEach(([x,y,z,w,h,c,k])=>{
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(k),side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m);});
  return pm.fromScene(es,0.04).texture;
}
function wheel(canvas,opts={}){
  const r=mkRenderer(canvas),scene=new THREE.Scene();
  r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
  scene.environment=envFor(r);
  const cam=new THREE.PerspectiveCamera(30,1,0.1,100);cam.position.set(0,0.3,8.4);cam.lookAt(0,0,0);
  const key=new THREE.DirectionalLight(0xffffff,1.4);key.position.set(3,5,6);scene.add(key);
  const rim=new THREE.DirectionalLight(0xE3B55B,1.2);rim.position.set(-5,1,-3);scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff,0.15));
  const root=new THREE.Group();scene.add(root);
  const spin=new THREE.Group();root.add(spin);
  const Z=v=>{v.rotation.x=Math.PI/2;return v;};
  const rubber=new THREE.MeshStandardMaterial({color:0x121214,roughness:0.85,metalness:0.05});
  const silver=new THREE.MeshStandardMaterial({color:0xd6d9de,metalness:1,roughness:0.18});
  const graph=new THREE.MeshStandardMaterial({color:0x2a2c31,metalness:0.9,roughness:0.28});
  const gold=new THREE.MeshStandardMaterial({color:0xE3B55B,metalness:0.75,roughness:0.28});
  const disc=new THREE.MeshStandardMaterial({color:0x8d9097,metalness:0.95,roughness:0.42});
  const tire=new THREE.Mesh(new THREE.TorusGeometry(1.62,0.44,40,120),rubber);tire.scale.z=1.35;spin.add(tire);
  for(let i=0;i<60;i++){const a=i/60*Math.PI*2;const b=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.06,0.95),rubber);b.position.set(Math.cos(a)*2.05,Math.sin(a)*2.05,0);b.rotation.z=a+0.25;spin.add(b);}
  const barrel=Z(new THREE.Mesh(new THREE.CylinderGeometry(1.24,1.24,0.95,72,1,true),graph));spin.add(barrel);
  const lip=new THREE.Mesh(new THREE.TorusGeometry(1.24,0.055,16,120),silver);lip.position.z=0.46;spin.add(lip);
  const lipIn=new THREE.Mesh(new THREE.TorusGeometry(1.14,0.025,12,120),gold);lipIn.position.z=0.44;spin.add(lipIn);
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2;
    [-0.13,0.13].forEach(o=>{const s=new THREE.Mesh(new THREE.BoxGeometry(0.11,0.86,0.12),silver);const aa=a+o;
      s.position.set(Math.cos(aa)*0.74,Math.sin(aa)*0.74,0.36-Math.abs(o)*0.2);s.rotation.z=aa-Math.PI/2+o*0.9;s.rotation.x=0.12;spin.add(s);});}
  const hub=Z(new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.44,0.22,48),graph));hub.position.z=0.34;spin.add(hub);
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2+Math.PI/5;const n=Z(new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.045,0.1,6),silver));n.position.set(Math.cos(a)*0.27,Math.sin(a)*0.27,0.47);spin.add(n);}
  const cc=document.createElement('canvas');cc.width=cc.height=256;const cg=cc.getContext('2d');cg.fillStyle='#0b0b0d';cg.beginPath();cg.arc(128,128,128,0,7);cg.fill();
  cg.strokeStyle='#E3B55B';cg.lineWidth=10;cg.beginPath();cg.arc(128,128,110,0,7);cg.stroke();cg.fillStyle='#E3B55B';cg.font='800 150px Archivo, Arial';cg.textAlign='center';cg.textBaseline='middle';cg.fillText('P',128,136);
  const cap=new THREE.Mesh(new THREE.CircleGeometry(0.18,48),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(cc),metalness:0.4,roughness:0.3}));cap.position.z=0.53;spin.add(cap);
  const capRing=new THREE.Mesh(new THREE.TorusGeometry(0.19,0.025,12,48),silver);capRing.position.z=0.52;spin.add(capRing);
  const dsk=Z(new THREE.Mesh(new THREE.CylinderGeometry(1.02,1.02,0.08,72),disc));dsk.position.z=-0.12;spin.add(dsk);
  const holeM=new THREE.MeshBasicMaterial({color:0x050505});
  for(let ring=0;ring<3;ring++)for(let i=0;i<18;i++){const a=i/18*Math.PI*2+ring*0.12;const rr=0.62+ring*0.13;const h=Z(new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.09,8),holeM));h.position.set(Math.cos(a)*rr,Math.sin(a)*rr,-0.12);spin.add(h);}
  const cal=new THREE.Mesh(new THREE.TorusGeometry(0.93,0.17,16,32,1.0),gold);cal.scale.z=1.6;cal.rotation.z=0.35;cal.position.z=-0.05;root.add(cal);
  const lc=document.createElement('canvas');lc.width=512;lc.height=96;const lg=lc.getContext('2d');lg.fillStyle='#0b0b0d';lg.font='800 64px Archivo, Arial';lg.textAlign='center';lg.fillText('PROCAR',256,72);
  const hudMat=new THREE.MeshBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const hudDim=new THREE.MeshBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.18,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const hud=new THREE.Group();hud.position.z=0.2;scene.add(hud);
  const h1=new THREE.Group(),h2=new THREE.Group(),h3=new THREE.Group();hud.add(h1,h2,h3);
  for(let i=0;i<6;i++)h1.add(new THREE.Mesh(new THREE.RingGeometry(2.55,2.58,64,1,i/6*Math.PI*2,Math.PI/5),hudMat));
  h2.add(new THREE.Mesh(new THREE.RingGeometry(2.75,2.76,128),hudDim));
  for(let i=0;i<72;i++){const a=i/72*Math.PI*2,l=i%6===0?0.14:0.06;const t=new THREE.Mesh(new THREE.PlaneGeometry(0.012,l),i%6===0?hudMat:hudDim);t.position.set(Math.cos(a)*(2.82+l/2),Math.sin(a)*(2.82+l/2),0);t.rotation.z=a-Math.PI/2;h2.add(t);}
  h3.add(new THREE.Mesh(new THREE.RingGeometry(2.3,2.42,96,1,0,Math.PI*0.5),new THREE.MeshBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.12,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})));
  h3.add(new THREE.Mesh(new THREE.RingGeometry(2.3,2.42,4,1,Math.PI*0.5-0.02,0.02),hudMat));
  const scanMat=new THREE.MeshBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.35,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const scan=new THREE.Mesh(new THREE.PlaneGeometry(5.2,0.012),scanMat);scan.position.z=0.8;scene.add(scan);
  const st={dragX:0,dragY:0,mx:0,my:0,scroll:0,lastScroll:0,boost:0};
  const unDrag=dragger(canvas,st);
  let raf,last=performance.now(),rx=0,ry=0;
  let wAsp=0;function loop(now){const dt=Math.min(0.05,(now-last)/1000);last=now;fit(r,cam,canvas);
    if(cam.aspect!==wAsp){wAsp=cam.aspect;cam.position.set(0,0.3,Math.max(8.4,2.75/(0.268*wAsp)));cam.lookAt(0,0,0);}
    st.boost*=Math.pow(0.05,dt);
    spin.rotation.z-=dt*(0.35+st.boost*6);
    h1.rotation.z+=dt*0.25;h2.rotation.z-=dt*0.08;h3.rotation.z-=dt*1.2;
    const tyy=-0.55+st.dragY+st.mx*0.5+Math.sin(now*0.0003)*0.12,txx=0.05+st.dragX+st.my*0.25;
    ry+=(tyy-ry)*Math.min(1,dt*4);rx+=(txx-rx)*Math.min(1,dt*4);root.rotation.set(rx,ry,0);hud.rotation.set(rx*0.5,ry*0.5,hud.rotation.z);
    const sy=Math.sin(now*0.0009)*2.3;scan.position.y=sy;scanMat.opacity=0.15+0.25*(1-Math.abs(sy)/2.3);
    r.render(scene,cam);raf=requestAnimationFrame(loop);}
  raf=requestAnimationFrame(loop);
  return{setScroll:s=>{st.boost+=Math.abs(s-st.lastScroll)*1.5;st.boost=Math.min(st.boost,3);st.lastScroll=s;},dispose:()=>{cancelAnimationFrame(raf);unDrag();r.dispose();}};
}
function ecu(canvas,opts={}){
  const r=mkRenderer(canvas),scene=new THREE.Scene();
  r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;scene.environment=envFor(r);
  const cam=new THREE.PerspectiveCamera(30,1,0.1,100);
  const key=new THREE.DirectionalLight(0xffffff,1.3);key.position.set(4,7,5);scene.add(key);
  const rimL=new THREE.DirectionalLight(0xE3B55B,1.1);rimL.position.set(-5,2,-4);scene.add(rimL);
  scene.add(new THREE.AmbientLight(0xffffff,0.15));
  const root=new THREE.Group();scene.add(root);
  const alu=new THREE.MeshStandardMaterial({color:0xb9bdc4,metalness:1,roughness:0.32});
  const dark=new THREE.MeshStandardMaterial({color:0x16181c,metalness:0.4,roughness:0.55});
  const gold=new THREE.MeshStandardMaterial({color:0xE3B55B,metalness:0.8,roughness:0.28});
  const pcbM=new THREE.MeshStandardMaterial({color:0x0c1512,metalness:0.3,roughness:0.6});
  const W=3.6,D=2.6;
  const base=new THREE.Group();root.add(base);
  const floor=new THREE.Mesh(new THREE.BoxGeometry(W,0.12,D),alu);base.add(floor);
  [[0,D/2-0.05,W,0.1],[0,-D/2+0.05,W,0.1]].forEach(([x,z,w,d])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,0.45,d),alu);m.position.set(x,0.22,z);base.add(m);});
  [[W/2-0.05],[-W/2+0.05]].forEach(([x])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.45,D),alu);m.position.set(x,0.22,0);base.add(m);});
  for(let i=0;i<13;i++){const f=new THREE.Mesh(new THREE.BoxGeometry(W-0.3,0.28,0.05),alu);f.position.set(0,-0.2,-D/2+0.2+i*((D-0.4)/12));base.add(f);}
  [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([a,b])=>{const t=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.12,20),alu);t.position.set(a*(W/2+0.1),0.05,b*(D/2-0.3));base.add(t);});
  const conn=new THREE.Group();base.add(conn);
  const cb=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.5,2.0),dark);cb.position.set(W/2+0.25,0.25,0);conn.add(cb);
  const cf=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.36,1.8),gold);cf.position.set(W/2+0.53,0.25,0);conn.add(cf);
  for(let i=0;i<2;i++)for(let k=0;k<14;k++){const p=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.04,0.04),new THREE.MeshBasicMaterial({color:0x080808}));p.position.set(W/2+0.56,0.16+i*0.18,-0.78+k*0.12);conn.add(p);}
  const board=new THREE.Group();root.add(board);
  const pcb=new THREE.Mesh(new THREE.BoxGeometry(W-0.3,0.06,D-0.3),pcbM);board.add(pcb);
  const bedge=new THREE.LineSegments(new THREE.EdgesGeometry(pcb.geometry),new THREE.LineBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.6}));board.add(bedge);
  const mcu=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.1,0.8),new THREE.MeshStandardMaterial({color:0x0a0a0c,metalness:0.5,roughness:0.3}));mcu.position.set(-0.3,0.08,0);board.add(mcu);
  const glowM=new THREE.MeshBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending});
  const dot=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.02,0.06),glowM);dot.position.set(-0.55,0.14,-0.25);board.add(dot);
  const traceM=new THREE.MeshBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending});
  const rnd=rng(5);
  for(let i=0;i<22;i++){const z=-0.95+i*0.09;const t=new THREE.Mesh(new THREE.BoxGeometry(1.1+rnd()*0.4,0.005,0.015),traceM);t.position.set(0.7+rnd()*0.2,0.035,z);board.add(t);}
  for(let i=0;i<10;i++){const x=-1.4+i*0.12;const t=new THREE.Mesh(new THREE.BoxGeometry(0.015,0.005,0.7),traceM);t.position.set(x,0.035,0.8);board.add(t);}
  [[0.9,-0.7,0.35,0.35],[0.9,0.6,0.5,0.3],[-1.3,-0.8,0.3,0.3],[0.2,0.75,0.25,0.25]].forEach(([x,z,w,d])=>{const c=new THREE.Mesh(new THREE.BoxGeometry(w,0.08,d),dark);c.position.set(x,0.07,z);board.add(c);});
  [[-1.4,0.5],[-1.2,0.5],[1.4,0]].forEach(([x,z])=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,0.3,20),alu);c.position.set(x,0.18,z);board.add(c);});
  const lc=document.createElement('canvas');lc.width=lc.height=256;const lg=lc.getContext('2d');lg.fillStyle='#0b0b0d';lg.fillRect(0,0,256,256);lg.fillStyle='#E3B55B';lg.font='800 58px Archivo, Arial';lg.fillText('PROCAR',22,140);lg.fillStyle='rgba(238,240,236,.5)';lg.font='500 26px monospace';lg.fillText('ECU · 5.00V',24,190);
  const lab=new THREE.Mesh(new THREE.PlaneGeometry(0.74,0.74),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(lc),roughness:0.4}));lab.rotation.x=-Math.PI/2;lab.position.set(-0.3,0.131,0);board.add(lab);
  const pulses=[];for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(0.035,8,8),glowM);board.add(m);pulses.push({m,z:-0.95+Math.floor(rnd()*22)*0.09,t:rnd(),sp:0.4+rnd()*0.5});}
  const lid=new THREE.Group();root.add(lid);
  const lidM=new THREE.Mesh(new THREE.BoxGeometry(W,0.08,D),new THREE.MeshStandardMaterial({color:0xb9bdc4,metalness:1,roughness:0.35,transparent:true,opacity:0.22}));lid.add(lidM);
  lid.add(new THREE.LineSegments(new THREE.EdgesGeometry(lidM.geometry),new THREE.LineBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.8})));
  const hudMat=new THREE.MeshBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const hudDim=new THREE.MeshBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const hud=new THREE.Group();hud.rotation.x=-Math.PI/2;hud.position.y=-0.55;root.add(hud);
  const h1=new THREE.Group(),h2=new THREE.Group();hud.add(h1,h2);
  for(let i=0;i<6;i++)h1.add(new THREE.Mesh(new THREE.RingGeometry(2.6,2.64,64,1,i/6*Math.PI*2,Math.PI/5),hudMat));
  h2.add(new THREE.Mesh(new THREE.RingGeometry(2.85,2.86,128),hudDim));
  for(let i=0;i<72;i++){const a=i/72*Math.PI*2,l=i%6===0?0.16:0.07;const t=new THREE.Mesh(new THREE.PlaneGeometry(0.014,l),i%6===0?hudMat:hudDim);t.position.set(Math.cos(a)*(2.92+l/2),Math.sin(a)*(2.92+l/2),0);t.rotation.z=a-Math.PI/2;h2.add(t);}
  const scanM=new THREE.MeshBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.3,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const scan=new THREE.Mesh(new THREE.PlaneGeometry(W+0.6,D+0.6),scanM);scan.rotation.x=-Math.PI/2;root.add(scan);
  const st={dragX:0,dragY:0,mx:0,my:0,scroll:0};
  const unDrag=dragger(canvas,st);
  let raf,last=performance.now(),rx=0,ry=0,asp=0,ex=0;
  function loop(now){const dt=Math.min(0.05,(now-last)/1000);last=now;fit(r,cam,canvas);
    if(cam.aspect!==asp){asp=cam.aspect;const d=Math.max(3.4/(0.268*asp),3.2/0.268);cam.position.set(0,d*0.55,d*0.84);cam.lookAt(0,0.5,0);}
    const target=0.55+0.25*Math.sin(now*0.0008)+Math.min(st.scroll,1)*0.8;ex+=(target-ex)*Math.min(1,dt*3);
    board.position.y=0.3+ex*0.9;lid.position.y=0.6+ex*2.0;conn.position.x=ex*0.35;
    pulses.forEach(p=>{p.t=(p.t+dt*p.sp)%1;p.m.position.set(0.55+p.t*1.4,0.05,p.z);});
    const sy=((now*0.0005)%1);scan.position.y=-0.2+sy*(0.6+ex*2.2);scanM.opacity=0.25*(1-Math.abs(sy-0.5)*1.6);
    h1.rotation.z+=dt*0.25;h2.rotation.z-=dt*0.08;dot.material.opacity=0.5+0.5*Math.sin(now*0.006);
    const tyy=-0.6+st.dragY+st.mx*0.5+Math.sin(now*0.00025)*0.25,txx=st.dragX+st.my*0.2;
    ry+=(tyy-ry)*Math.min(1,dt*4);rx+=(txx-rx)*Math.min(1,dt*4);root.rotation.set(rx,ry,0);
    r.render(scene,cam);raf=requestAnimationFrame(loop);}
  raf=requestAnimationFrame(loop);
  return{setScroll:s=>{st.scroll=s;},dispose:()=>{cancelAnimationFrame(raf);unDrag();r.dispose();}};
}
function car(canvas,opts={}){
  const r=mkRenderer(canvas),scene=new THREE.Scene();
  r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;scene.environment=envFor(r);
  const cam=new THREE.PerspectiveCamera(30,1,0.1,100);
  const key=new THREE.DirectionalLight(0xffffff,1.3);key.position.set(4,7,5);scene.add(key);
  const rimL=new THREE.DirectionalLight(0xE3B55B,1.2);rimL.position.set(-5,2,-4);scene.add(rimL);
  scene.add(new THREE.AmbientLight(0xffffff,0.15));
  const root=new THREE.Group();scene.add(root);
  const alu=new THREE.MeshStandardMaterial({color:0xb9bdc4,metalness:1,roughness:0.3});
  const dark=new THREE.MeshStandardMaterial({color:0x16181c,metalness:0.5,roughness:0.5});
  const rubber=new THREE.MeshStandardMaterial({color:0x111113,roughness:0.85,metalness:0.05});
  const gold=new THREE.MeshStandardMaterial({color:0xE3B55B,metalness:0.8,roughness:0.28});
  const glowM=()=>new THREE.MeshBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false});
  // carrocería
  const s=new THREE.Shape();
  s.moveTo(-2.2,0.3);s.lineTo(-1.92,0.3);s.absarc(-1.4,0.4,0.52,Math.PI,0,true);s.lineTo(-0.88,0.3);s.lineTo(0.88,0.3);s.absarc(1.4,0.4,0.52,Math.PI,0,true);s.lineTo(2.22,0.3);
  s.quadraticCurveTo(2.36,0.42,2.3,0.66);s.quadraticCurveTo(2.2,0.82,1.15,0.92);s.quadraticCurveTo(0.6,1.25,0.2,1.36);s.quadraticCurveTo(-0.4,1.44,-0.85,1.34);
  s.quadraticCurveTo(-1.55,1.08,-2.05,1.0);s.quadraticCurveTo(-2.3,0.95,-2.28,0.62);s.lineTo(-2.2,0.3);
  const bg=new THREE.ExtrudeGeometry(s,{depth:1.56,bevelEnabled:true,bevelThickness:0.14,bevelSize:0.08,bevelSegments:4,curveSegments:24});bg.translate(0,0,-0.78);
  const shell=new THREE.Group();root.add(shell);
  const paint=new THREE.MeshPhysicalMaterial({color:0x1a1b1f,metalness:0.9,roughness:0.22,clearcoat:1,clearcoatRoughness:0.1,transparent:true,opacity:0.32,depthWrite:false,side:THREE.DoubleSide});
  shell.add(new THREE.Mesh(bg,paint));
  const edgeM=new THREE.LineBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.75});
  shell.add(new THREE.LineSegments(new THREE.EdgesGeometry(bg,28),edgeM));
  const sliceM=new THREE.LineBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.16});
  for(let i=1;i<10;i++){const x=-2.2+i*0.44;const pts=s.getPoints(40).filter(p=>Math.abs(p.x-x)<0.06);if(!pts.length)continue;const top=Math.max(...pts.map(p=>p.y));
    const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,0.32,-0.86),new THREE.Vector3(x,top,-0.86),new THREE.Vector3(x,top,0.86),new THREE.Vector3(x,0.32,0.86)]);shell.add(new THREE.Line(g,sliceM));}
  const glass=new THREE.MeshStandardMaterial({color:0xE3B55B,transparent:true,opacity:0.08,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const gs=new THREE.Shape();gs.moveTo(1.0,0.98);gs.quadraticCurveTo(0.55,1.24,0.2,1.3);gs.quadraticCurveTo(-0.4,1.37,-0.8,1.28);gs.quadraticCurveTo(-1.3,1.1,-1.45,1.03);gs.lineTo(1.0,0.98);
  [-0.95,0.95].forEach(z=>{const m=new THREE.Mesh(new THREE.ShapeGeometry(gs),glass);m.position.z=z;shell.add(m);});
  [[2.38,0.6,0.5],[2.38,0.6,-0.5]].forEach(([x,y,z])=>{const l=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.08,0.38),glowM());l.position.set(x,y,z);shell.add(l);});
  [[-2.36,0.82,0.5],[-2.36,0.82,-0.5]].forEach(([x,y,z])=>{const l=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.06,0.42),new THREE.MeshBasicMaterial({color:0xFF4D2E}));l.position.set(x,y,z);shell.add(l);});
  // chasis
  const chassis=new THREE.Group();root.add(chassis);
  const floor=new THREE.Mesh(new THREE.BoxGeometry(4.2,0.06,1.5),dark);floor.position.y=0.3;chassis.add(floor);
  {const ls=new THREE.LineSegments(new THREE.EdgesGeometry(floor.geometry),new THREE.LineBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.35}));ls.position.copy(floor.position);chassis.add(ls);}
  const eng=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.42,0.9),alu);eng.position.set(1.55,0.55,0);chassis.add(eng);
  for(let i=0;i<4;i++){const c=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.12,16),gold);c.position.set(1.3+i*0.17,0.8,0);chassis.add(c);}
  const wheels=[];
  [[1.4,1],[1.4,-1],[-1.4,1],[-1.4,-1]].forEach(([x,sz])=>{const w=new THREE.Group();w.position.set(x,0.4,sz*0.8);chassis.add(w);
    const spin=new THREE.Group();w.add(spin);
    const t=new THREE.Mesh(new THREE.TorusGeometry(0.34,0.12,20,48),rubber);t.scale.z=1.6;spin.add(t);
    const rim=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.26,0.2,32),alu);rim.rotation.x=Math.PI/2;spin.add(rim);
    const lip=new THREE.Mesh(new THREE.TorusGeometry(0.26,0.018,10,48),gold);lip.position.z=sz*0.11;spin.add(lip);
    for(let k=0;k<5;k++){const a=k/5*Math.PI*2;const sp=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.36,0.03),dark);sp.position.set(Math.cos(a)*0.12,Math.sin(a)*0.12,sz*0.115);sp.rotation.z=a-Math.PI/2;spin.add(sp);}
    const disc=new THREE.Mesh(new THREE.TorusGeometry(0.2,0.05,8,32,1.1),gold);disc.position.z=-sz*0.02;disc.rotation.z=0.3;w.add(disc);
    wheels.push({w,spin,sz});});
  [1.4,-1.4].forEach(x=>{const a=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,1.6,8),alu);a.rotation.x=Math.PI/2;a.position.set(x,0.4,0);chassis.add(a);});
  // módulos + red CAN
  const hubP=new THREE.Vector3(0,0.55,0);
  const hub=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.1,0.28),gold);hub.position.copy(hubP);chassis.add(hub);
  const mods=[[1.05,0.6,0.45],[1.55,0.85,-0.3],[1.3,0.45,-0.6],[0.5,0.75,0],[-0.3,0.45,0.55],[-1.0,0.6,-0.4],[-1.8,0.65,0]].map(([x,y,z],i)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.08,0.18),glowM());m.position.set(x,y,z);chassis.add(m);
    const p=new THREE.Vector3(x,y,z);const c=new THREE.QuadraticBezierCurve3(hubP,new THREE.Vector3((x)/2,Math.max(y,0.55)+0.15,z/2),p);
    chassis.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(24)),new THREE.LineBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.4})));
    const pu=new THREE.Mesh(new THREE.SphereGeometry(0.03,8,8),glowM());chassis.add(pu);
    return{m,c,pu,t:i/7,sp:0.5+(i%3)*0.2,x};});
  // HUD
  const hudMat=new THREE.MeshBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const hudDim=new THREE.MeshBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const hud=new THREE.Group();hud.rotation.x=-Math.PI/2;hud.position.y=0.02;root.add(hud);
  const h1=new THREE.Group(),h2=new THREE.Group();hud.add(h1,h2);
  for(let i=0;i<6;i++)h1.add(new THREE.Mesh(new THREE.RingGeometry(2.7,2.74,64,1,i/6*Math.PI*2,Math.PI/5),hudMat));
  h2.add(new THREE.Mesh(new THREE.RingGeometry(2.95,2.96,128),hudDim));
  for(let i=0;i<72;i++){const a=i/72*Math.PI*2,l=i%6===0?0.16:0.07;const t=new THREE.Mesh(new THREE.PlaneGeometry(0.014,l),i%6===0?hudMat:hudDim);t.position.set(Math.cos(a)*(3.02+l/2),Math.sin(a)*(3.02+l/2),0);t.rotation.z=a-Math.PI/2;h2.add(t);}
  const scanM=new THREE.MeshBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.3,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const scan=new THREE.Mesh(new THREE.PlaneGeometry(2.0,2.2),scanM);scan.rotation.y=Math.PI/2;root.add(scan);
  const scanL=new THREE.LineSegments(new THREE.EdgesGeometry(scan.geometry),new THREE.LineBasicMaterial({color:0xE3B55B,transparent:true,opacity:0.7}));scan.add(scanL);
  const st={dragX:0,dragY:0,mx:0,my:0,scroll:0};
  const unDrag=dragger(canvas,st);
  let raf,last=performance.now(),rx=0,ry=0,asp=0,ex=0;
  function loop(now){const dt=Math.min(0.05,(now-last)/1000);last=now;fit(r,cam,canvas);
    if(cam.aspect!==asp){asp=cam.aspect;const d=Math.max(3.3/(0.268*asp),2.5/0.268);cam.position.set(0,d*0.42,d*0.9);cam.lookAt(0,1.0,0);}
    const target=0.15+0.12*Math.sin(now*0.0008)+Math.min(st.scroll,1)*0.85;ex+=(target-ex)*Math.min(1,dt*3);
    shell.position.y=ex*1.3;
    wheels.forEach(o=>{o.w.position.z=o.sz*(0.8+ex*0.45);o.spin.rotation.z-=dt*(1.2+ex*4);});
    const sx=Math.sin(now*0.0007)*2.4;scan.position.set(sx,1.0+ex*0.6,0);scan.scale.y=1+ex*0.6;scanM.opacity=0.06+0.08*(1-Math.abs(sx)/2.4);
    mods.forEach(o=>{o.t=(o.t+dt*o.sp)%1;o.pu.position.copy(o.c.getPoint(o.t));o.m.material.opacity=Math.abs(o.x-sx)<0.3?1:0.45+0.2*Math.sin(now*0.004+o.x*3);});
    h1.rotation.z+=dt*0.25;h2.rotation.z-=dt*0.08;
    const tyy=-0.55+st.dragY+st.mx*0.5+Math.sin(now*0.00025)*0.25,txx=st.dragX+st.my*0.15;
    ry+=(tyy-ry)*Math.min(1,dt*4);rx+=(txx-rx)*Math.min(1,dt*4);root.rotation.set(rx,ry,0);
    r.render(scene,cam);raf=requestAnimationFrame(loop);}
  raf=requestAnimationFrame(loop);
  return{setScroll:s=>{st.scroll=s;},dispose:()=>{cancelAnimationFrame(raf);unDrag();r.dispose();}};
}
window.Procar3D={chip,network,wheel,ecu,car};
})();
