/* ---------- routing ---------- */
function anchors(a, b, l){
  const acx = a.x + a.w/2, acy = a.y + a.h/2;
  const bcx = b.x + b.w/2, bcy = b.y + b.h/2;
  const dx = bcx - acx, dy = bcy - acy;
  let dir = Math.abs(dy) > Math.abs(dx) * 1.05 ? 'v' : 'h';
  let p1 = dir === 'v' ? { x:acx, y: dy > 0 ? a.y+a.h : a.y }
                       : { x: dx > 0 ? a.x+a.w : a.x, y:acy };
  let p2 = dir === 'v' ? { x:bcx, y: dy > 0 ? b.y : b.y+b.h }
                       : { x: dx > 0 ? b.x : b.x+b.w, y:bcy };
  if (l && l.fromSide){ p1 = edgePoint(a, l.fromSide, l.fromT); if (l.fromSide === 'n' || l.fromSide === 's') dir = 'v'; }
  if (l && l.toSide){ p2 = edgePoint(b, l.toSide, l.toT); if (l.toSide === 'n' || l.toSide === 's') dir = 'v'; }
  return { dir, p1, p2 };
}
const obst = () => nodes.filter(n => n.kind !== 'zone');
function vCross(x, y1, y2, a, b){
  const lo = Math.min(y1,y2), hi = Math.max(y1,y2);
  return obst().some(n => n !== a && n !== b &&
    x > n.x-5 && x < n.x+n.w+5 && hi > n.y-5 && lo < n.y+n.h+5);
}
function hCross(y, x1, x2, a, b){
  const lo = Math.min(x1,x2), hi = Math.max(x1,x2);
  return obst().some(n => n !== a && n !== b &&
    y > n.y-5 && y < n.y+n.h+5 && hi > n.x-5 && lo < n.x+n.w+5);
}
function route(a, b, way, l){
  const { dir, p1, p2 } = anchors(a, b, l);

  if (way){
    const pts = dir === 'h'
      ? [[p1.x,p1.y],[way.x,p1.y],[way.x,way.y],[p2.x,way.y],[p2.x,p2.y]]
      : [[p1.x,p1.y],[p1.x,way.y],[way.x,way.y],[way.x,p2.y],[p2.x,p2.y]];
    return pts.filter((p, i) => i === 0 ||
      Math.abs(p[0] - pts[i-1][0]) > 0.5 || Math.abs(p[1] - pts[i-1][1]) > 0.5);
  }

  if (l && (l.fromSide || l.toSide)){
    const OUT = 26;
    const sOut = l.fromSide ? sideOut(a, l.fromSide, p1, OUT) : { x:p1.x, y:p1.y };
    const eOut = l.toSide ? sideOut(b, l.toSide, p2, OUT) : { x:p2.x, y:p2.y };
    const fz = l.fromSide === 'n' || l.fromSide === 's';
    const tz = l.toSide === 'n' || l.toSide === 's';
    const pts = [[p1.x, p1.y], [sOut.x, sOut.y]];
    if (Math.abs(sOut.x - eOut.x) < 2 || Math.abs(sOut.y - eOut.y) < 2){
      pts.push([eOut.x, eOut.y]);
    } else if (tz){
      pts.push([sOut.x, eOut.y], [eOut.x, eOut.y]);
    } else if (fz){
      pts.push([eOut.x, sOut.y], [eOut.x, eOut.y]);
    } else if (!fz && !tz){
      const mx = (sOut.x + eOut.x) / 2;
      pts.push([mx, sOut.y], [mx, eOut.y], [eOut.x, eOut.y]);
    } else {
      const my = (sOut.y + eOut.y) / 2;
      pts.push([sOut.x, my], [eOut.x, my], [eOut.x, eOut.y]);
    }
    pts.push([p2.x, p2.y]);
    return pts.filter((p, i) => i === 0 ||
      Math.abs(p[0] - pts[i-1][0]) > 0.5 || Math.abs(p[1] - pts[i-1][1]) > 0.5);
  }

  if (dir === 'h'){
    if (Math.abs(p1.y - p2.y) < Math.min(a.h, b.h)/3 && !hCross(p2.y, p1.x, p2.x, a, b))
      return [[p1.x,p2.y],[p2.x,p2.y]];
    const lo = Math.min(p1.x,p2.x), hi = Math.max(p1.x,p2.x);
    if (hi - lo > 40){
      const base = p1.x + (p2.x - p1.x)*0.5;
      for (let k=0;k<=16;k++){
        for (const sign of (k ? [k,-k] : [0])){
          const mx = base + sign*20;
          if (mx <= lo+10 || mx >= hi-10) continue;
          if (vCross(mx, p1.y, p2.y, a, b)) continue;
          if (hCross(p1.y, p1.x, mx, a, b)) continue;
          if (hCross(p2.y, mx, p2.x, a, b)) continue;
          return [[p1.x,p1.y],[mx,p1.y],[mx,p2.y],[p2.x,p2.y]];
        }
      }
    }
    let side = Math.max(a.y+a.h, b.y+b.h) + 26;
    while (hCross(side, p1.x, p2.x, a, b)) side += 24;
    const out = p2.x > p1.x ? 26 : -26;
    return [[p1.x,p1.y],[p1.x+out,p1.y],[p1.x+out,side],[p2.x-out,side],[p2.x-out,p2.y],[p2.x,p2.y]];
  }

  if (Math.abs(p1.x - p2.x) < Math.min(a.w, b.w)/3 && !vCross(p2.x, p1.y, p2.y, a, b))
    return [[p2.x,p1.y],[p2.x,p2.y]];
  const lo = Math.min(p1.y,p2.y), hi = Math.max(p1.y,p2.y);
  if (hi - lo > 40){
    const base = p1.y + (p2.y - p1.y)*0.5;
    for (let k=0;k<=16;k++){
      for (const sign of (k ? [k,-k] : [0])){
        const my = base + sign*20;
        if (my <= lo+10 || my >= hi-10) continue;
        if (hCross(my, p1.x, p2.x, a, b)) continue;
        if (vCross(p1.x, p1.y, my, a, b)) continue;
        if (vCross(p2.x, my, p2.y, a, b)) continue;
        return [[p1.x,p1.y],[p1.x,my],[p2.x,my],[p2.x,p2.y]];
      }
    }
  }
  let side = Math.max(a.x+a.w, b.x+b.w) + 30;
  while (vCross(side, p1.y, p2.y, a, b)) side += 26;
  const out = p2.y > p1.y ? 26 : -26;
  return [[p1.x,p1.y],[p1.x,p1.y+out],[side,p1.y+out],[side,p2.y-out],[p2.x,p2.y-out],[p2.x,p2.y]];
}
function rounded(pts, r){
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i=1;i<pts.length-1;i++){
    const [x0,y0] = pts[i-1], [x1,y1] = pts[i], [x2,y2] = pts[i+1];
    const d1 = Math.hypot(x1-x0,y1-y0) || 1, d2 = Math.hypot(x2-x1,y2-y1) || 1;
    const rr = Math.min(r, d1/2, d2/2);
    d += ` L${x1+(x0-x1)/d1*rr} ${y1+(y0-y1)/d1*rr} Q${x1} ${y1} ${x1+(x2-x1)/d2*rr} ${y1+(y2-y1)/d2*rr}`;
  }
  const l = pts[pts.length-1];
  return d + ` L${l[0]} ${l[1]}`;
}
function midPoint(pts){
  let total = 0;
  for (let i=1;i<pts.length;i++) total += Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]);
  let acc = 0;
  for (let i=1;i<pts.length;i++){
    const seg = Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]);
    if (acc + seg >= total/2){
      const t = (total/2 - acc) / (seg || 1);
      return { x: pts[i-1][0] + (pts[i][0]-pts[i-1][0])*t,
               y: pts[i-1][1] + (pts[i][1]-pts[i-1][1])*t };
    }
    acc += seg;
  }
  return { x:pts[0][0], y:pts[0][1] };
}

