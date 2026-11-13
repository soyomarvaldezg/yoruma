/* ---------- text format (yaml subset in, document out) ---------- */
const TEXT_KINDS = {
  card:'box', box:'box', ellipse:'ellipse', zone:'zone',
  db:'store', database:'store', store:'store',
  queue:'queue', cloud:'cloud', file:'file', api:'api',
  shield:'shield', people:'people', agent:'agent', contract:'contract',
  dashboard:'dashboard', cube:'cube', table:'table', text:'text', heading:'heading',
  tile:'tile'
};
const SHAPE_PROPS = new Set(['sub','brand','icon','anim','speed','tint','band','solid','dash','stroke','sharp','size','fillmode','color','fill','align','x','y','w','h']);
const TEXT_DIRS = new Set(['right','down']);
const TEXT_GAPX = 76, TEXT_GAPY = 44, TEXT_ZGAP = 36, TEXT_ZPAD = 24, TEXT_ZTOP = 44, TEXT_ZBOT = 26,
      TEXT_TITLEW = 12.5, TEXT_ORIGIN = 32;

const textErr = (no, msg) => new Error('line ' + no + ': ' + msg);
const textSlug = name => {
  const s = String(name || '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64);
  return s || null;
};
const textBool = (v, no, key) => {
  if (v === 'true') return true;
  if (v === 'false') return false;
  throw textErr(no, key + ' is true or false');
};
const textNum = (v, no, key) => {
  if (!/^-?\d+(\.\d+)?$/.test(v)) throw textErr(no, key + ' needs a number');
  return Number(v);
};
const textStr = v => {
  const s = String(v == null ? '' : v).trim();
  return s.length > 1 &&
    ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))
    ? s.slice(1, -1) : s;
};

function parseText(src){
  const lines = String(src || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  const root = { scope:'root', line:0, props:{}, children:[] };
  const stack = [{ indent:-1, node:root }];
  const shapes = [], links = [];
  const nameAt = new Map();

  const pushShape = (kindWord, name, no, kidsAt) => {
    if (!name) throw textErr(no, 'shape needs a name after “' + kindWord + '”');
    if (name.includes(':')) throw textErr(no, 'names cannot contain “:”');
    const kind = TEXT_KINDS[kindWord];
    const s = { scope: kind === 'zone' ? 'zone' : 'shape', line:no,
                kind, name, props:{}, children:[], parent: stack[stack.length-1].node };
    if (s.parent.scope === 'shape' || s.parent.scope === 'arrow')
      throw textErr(no, s.parent.scope === 'arrow'
        ? 'shapes cannot nest under arrows — put them at the top level or in a zone'
        : 'a shape cannot contain anything — indent it less or use a zone');
    if (nameAt.has(s.name))
      throw textErr(no, 'two shapes named “' + name + '” (first at line ' +
        nameAt.get(name).line + ')');
    nameAt.set(s.name, s);
    s.parent.children.push(s);
    shapes.push(s);
    stack.push({ indent: kidsAt, node: s });
  };

  lines.forEach((raw, i) => {
    const no = i + 1;
    if (!raw.trim() || /^\s*#/.test(raw)) return;
    if (/^[ \t]*\t/.test(raw)) throw textErr(no, 'use spaces, not tabs');
    const lead = raw.match(/^ */)[0].length;
    if (lead % 2) throw textErr(no, 'indentation must be two spaces per level');
    while (stack.length > 1 && stack[stack.length-1].indent !== null &&
           stack[stack.length-1].indent >= lead) stack.pop();
    const parent = stack[stack.length-1].node;
    const body = raw.slice(lead);
    const colonAt = body.indexOf(':');
    const head = (colonAt === -1 ? body : body.slice(0, colonAt)).trim();
    const propForm = colonAt !== -1 && head && !/\s/.test(head);

    if (propForm && !(head in TEXT_KINDS)){
      applyProp(parent, head, textStr(body.slice(colonAt + 1)), no);
      return;
    }

    const kw = head.split(/\s+/)[0];
    if (!(kw in TEXT_KINDS) && body.indexOf(':') === -1 &&
        (SHAPE_PROPS.has(kw) || kw === 'dir') &&
        (parent.scope === 'shape' || kw === 'dir')){
      applyProp(parent, kw, textStr(body.slice(kw.length)), no);
      return;
    }
    if (kw in TEXT_KINDS){
      let rest = body.slice(kw.length).trim();
      let kidsAt = Infinity;
      if (rest.endsWith(':')){ kidsAt = lead; rest = rest.slice(0, -1).trim(); }
      if (rest.includes(':')) throw textErr(no, 'names cannot contain “:”');
      pushShape(kw, rest, no, kidsAt);
      return;
    }

    if (/->|--/.test(body)){
      if (parent.scope !== 'root')
        throw textErr(no, 'arrows belong at the top level');
      const lineLinks = [];
      const seps = body.split(/(<->|->|--)/);
      if (seps.length < 3) throw textErr(no, 'cannot read that arrow');
      const mkArrow = (fromName, toName, label, headOn) => {
        const from = fromName.trim(), to = toName.trim();
        if (!from || !to) throw textErr(no, 'arrow needs two shapes');
        if (from.includes(':') || to.includes(':'))
          throw textErr(no, 'names cannot contain “:”');
        const l = { line:no, from, to, label: label || '', head: headOn };
        links.push(l);
        lineLinks.push(l);
      };
      for (let p = 1; p < seps.length; p += 2){
        let target = seps[p + 1] == null ? '' : seps[p + 1];
        let label = '';
        const lc = target.indexOf(':');
        if (lc !== -1){
          if (p + 2 < seps.length) throw textErr(no, 'only the last arrow takes a label');
          label = textStr(target.slice(lc + 1));
          target = target.slice(0, lc);
        }
        if (sep(seps, p) === '<->'){
          mkArrow(seps[p - 1], target, label, true);
          mkArrow(target, seps[p - 1], label, true);
        } else mkArrow(seps[p - 1], target, label, sep(seps, p) !== '--');
      }
      stack.push({ indent: lead, node: { scope:'arrow', links: lineLinks } });
      return;
    }

    throw textErr(no, 'expected “kind name”, got “' + body.slice(0, 40) + '”');
  });

  function sep(seps, p){ return seps[p]; }

  function applyProp(parent, key, value, no){
    if (parent.scope === 'arrow'){
      if (!['color','dash','motion','bend'].includes(key))
        throw textErr(no, 'unknown arrow property “' + key +
          '” (arrows take color, dash, motion, bend)');
      if (key === 'bend'){
        const nums = String(value).trim().split(/\s+/).map(Number);
        if (nums.length !== 2 || nums.some(v => !Number.isFinite(v)))
          throw textErr(no, 'bend needs two numbers: x y');
        parent.links.forEach(l => {
          const list = l.bends || (l.bends = []);
          if (list.length >= MAX_BENDS)
            throw textErr(no, 'an arrow takes at most ' + MAX_BENDS + ' bends');
          list.push({ x:nums[0], y:nums[1] });
        });
        return;
      }
      if (key === 'color'){
        if (!/^#[0-9a-fA-F]{6}$/.test(value)) throw textErr(no, 'color must be #RRGGBB');
      } else if (key === 'dash') value = textBool(value, no, key);
      else {
        if (!MODES.includes(value))
          throw textErr(no, 'motion is ' + MODES.join(', '));
      }
      parent.links.forEach(l => { l[key] = value; });
      return;
    }
    if (parent.scope !== 'shape'){
      if (parent.scope === 'root' && (key === 'title' || key === 'subtitle')){
        if (!value) throw textErr(no, key + ' needs a value');
        parent.props[key] = value.slice(0, 300);
        return;
      }
      if (parent.scope === 'root' && key === 'theme'){
        if (value !== 'data') throw textErr(no, 'theme is data');
        parent.props.theme = value;
        return;
      }
      if (!['dir','color','fill','band','solid','dash'].includes(key))
        throw textErr(no, parent.scope === 'zone'
          ? 'unknown property “' + key + '” (zones take dir, color, fill, band, solid, dash)'
          : 'unknown setting “' + key + '”');
      if (key === 'dir'){
        if (!TEXT_DIRS.has(value)) throw textErr(no, 'dir is right or down');
      } else if (key === 'band' || key === 'solid' || key === 'dash'){
        parent.props[key] = textBool(value, no, key);
        return;
      } else {
        if (!/^#[0-9a-fA-F]{6}$/.test(value)) throw textErr(no, key + ' must be #RRGGBB');
      }
      parent.props[key] = value;
      return;
    }
    if (!SHAPE_PROPS.has(key)) throw textErr(no, 'unknown property “' + key + '”');
    if (!value) throw textErr(no, key + ' needs a value');
    if (key === 'sub' || key === 'brand' || key === 'icon')
      parent.props[key] = value.slice(0, 2000);
    else if (key === 'anim'){
      if (parent.kind !== 'tile')
        throw textErr(no, 'anim is for tiles — write “tile Name” and put anim under it');
      if (!ANIMS.includes(value))
        throw textErr(no, 'anim is ' + ANIMS.join(', '));
      parent.props.anim = value;
    }
    else if (key === 'speed'){
      if (parent.kind !== 'tile')
        throw textErr(no, 'speed is for tiles — write “tile Name” and put speed under it');
      const s = Number(value);
      if (!Number.isFinite(s) || s < 0.25 || s > 4)
        throw textErr(no, 'speed is a number from 0.25 to 4 (1 is the loop’s own tempo)');
      parent.props.speed = s;
    }
    else if (key === 'tint' || key === 'band' || key === 'solid' || key === 'dash' ||
             key === 'sharp')
      parent.props[key] = textBool(value, no, key);
    else if (key === 'fillmode'){
      if (!['soft','solid'].includes(value))
        throw textErr(no, 'fillmode is soft or solid');
      parent.props.fillmode = value;
    }
    else if (key === 'stroke'){
      if (!['solid','dashed','dotted'].includes(value))
        throw textErr(no, 'stroke is solid, dashed or dotted');
      parent.props.stroke = value;
    }
    else if (key === 'size'){
      if (!['s','m','l','xl'].includes(value))
        throw textErr(no, 'size is s, m, l or xl');
      parent.props.size = value;
    }
    else if (key === 'color' || key === 'fill'){
      if (!/^#[0-9a-fA-F]{6}$/.test(value)) throw textErr(no, key + ' must be #RRGGBB');
      parent.props[key] = value;
    }
    else if (key === 'align'){
      if (!['left','center','right'].includes(value))
        throw textErr(no, 'align is left, center or right');
      parent.props.align = value;
    }
    else parent.props[key] = textNum(value, no, key);
  }

  if (!shapes.length) throw new Error('the text has no shapes');
  shapes.forEach(s => {
    s.id = textSlug(s.name);
    if (!s.id) throw textErr(s.line, '“' + s.name + '” needs a name made of letters');
  });
  const byId = new Map(shapes.map(s => [s.id, s]));
  if (byId.size !== shapes.length){
    const dup = shapes.find(s => shapes.filter(x => x.id === s.id).length > 1);
    throw textErr(dup.line, '“' + dup.name + '” and another shape share the id ' + dup.id);
  }
  links.forEach(l => {
    const a = nameAt.get(l.from), b = nameAt.get(l.to);
    if (!a) throw textErr(l.line, 'no shape named “' + l.from + '”');
    if (!b) throw textErr(l.line, 'no shape named “' + l.to + '”');
    l.fromId = a.id; l.toId = b.id;
  });
  return { shapes, links, dir: root.props.dir || 'right', root, byId };
}

const TEXT_TONES = {
  store:'#099268', cube:'#099268', table:'#099268',
  queue:'#F76707', file:'#4DABF7', dashboard:'#4263EB', api:'#4263EB',
  agent:'#AE3EC9', cloud:'#657486', people:'#657486', shield:'#657486',
  contract:'#657486'
};
const TEXT_HEADER_GAP = 20, TEXT_TITLE_W = 13.4, TEXT_SUB_W = 10,
      TEXT_TITLE_FS = 1.5, TEXT_SUB_FS = 0.78, TEXT_TITLE_H = 42, TEXT_SUB_H = 24;

function textPack(members, links, dir, byId){
  const inSet = new Map(members.map(m => [m.id, m]));
  const ownerWithin = id => {
    let s = byId.get(id);
    while (s && s.scope !== 'root'){
      if (inSet.has(s.id)) return inSet.get(s.id);
      s = s.parent;
    }
    return null;
  };
  const edges = [], seen = new Set();
  for (const l of links){
    const a = ownerWithin(l.fromId), b = ownerWithin(l.toId);
    if (!a || !b || a === b) continue;
    const key = a.id + '>' + b.id;
    if (!seen.has(key)){ seen.add(key); edges.push([a, b]); }
  }
  const rank = new Map(members.map(m => [m.id, 0]));
  const adj = new Map(members.map(m => [m.id, []]));
  const indeg = new Map(members.map(m => [m.id, 0]));
  edges.forEach(([a, b]) => { adj.get(a.id).push(b.id); indeg.set(b.id, indeg.get(b.id) + 1); });
  const queue = members.filter(m => !indeg.get(m.id)).map(m => m.id);
  while (queue.length){
    const u = queue.shift();
    for (const v of adj.get(u)){
      rank.set(v, Math.max(rank.get(v), rank.get(u) + 1));
      indeg.set(v, indeg.get(v) - 1);
      if (!indeg.get(v)) queue.push(v);
    }
  }
  const byRank = new Map();
  members.forEach(m => {
    if (!byRank.has(rank.get(m.id))) byRank.set(rank.get(m.id), []);
    byRank.get(rank.get(m.id)).push(m);
  });
  const down = dir === 'down';
  const ranks = [...byRank.keys()].sort((a, b) => a - b);
  const order = new Map();
  ranks.forEach(r => byRank.get(r).forEach((m, i) => order.set(m.id, i)));
  const nbrs = new Map(members.map(m => [m.id, []]));
  edges.forEach(([a, b]) => { nbrs.get(a.id).push(b.id); nbrs.get(b.id).push(a.id); });
  for (let sweep = 0; sweep < 4; sweep++){
    const seq = sweep % 2 ? [...ranks].reverse() : ranks;
    for (const r of seq){
      const row = byRank.get(r);
      const score = new Map(row.map(m => {
        const ns = nbrs.get(m.id);
        return [m.id, ns.length
          ? ns.reduce((sum, id) => sum + order.get(id), 0) / ns.length
          : order.get(m.id)];
      }));
      row.sort((a, b) =>
        (score.get(a.id) - score.get(b.id)) || (order.get(a.id) - order.get(b.id)));
      row.forEach((m, i) => order.set(m.id, i));
    }
  }
  let cursorAlong = 0, spanMax = 0;
  const gapAlong = down ? TEXT_GAPY : TEXT_GAPX;
  const gapCross = down ? TEXT_GAPX : TEXT_GAPY;
  const cursor = {}, cellAt = {};
  ranks.forEach(r => {
    const row = byRank.get(r);
    const cell = Math.max(...row.map(m => down ? m._h : m._w));
    const lane = row.every(m => m.kind === 'zone') ? TEXT_ZGAP : gapAlong;
    cellAt[r] = cell;
    cursor[r] = cursorAlong;
    cursorAlong += cell + lane;
  });
  cursorAlong = Math.max(0, cursorAlong -
    (ranks.length && byRank.get(ranks[ranks.length - 1]).every(m => m.kind === 'zone')
      ? TEXT_ZGAP : gapAlong));
  const crossAt = new Map();
  ranks.forEach(r => {
    let c = 0;
    byRank.get(r).forEach(m => {
      crossAt.set(m.id, c);
      c += (down ? m._w : m._h) + gapCross;
    });
  });
  const sizeCross = m => down ? m._w : m._h;
  const crossCenter = id => crossAt.get(id) + sizeCross(byId.get(id)) / 2;
  for (let sweep = 0; sweep < 4; sweep++){
    const seq = sweep % 2 ? [...ranks].reverse() : ranks;
    for (const r of seq){
      const row = byRank.get(r);
      const want = new Map(row.map(m => {
        const ns = nbrs.get(m.id);
        return [m.id, ns.length
          ? ns.reduce((sum, id) => sum + crossCenter(id), 0) / ns.length
          : crossCenter(m.id)];
      }));
      let c = 0;
      row.forEach(m => {
        const s = sizeCross(m);
        const x = Math.max(c, want.get(m.id) - s / 2);
        crossAt.set(m.id, x);
        c = x + s + gapCross;
      });
      for (let i = row.length - 1; i >= 0; i--){
        const m = row[i], s = sizeCross(m);
        const hi = i + 1 < row.length
          ? crossAt.get(row[i + 1].id) - s - gapCross : Infinity;
        crossAt.set(m.id,
          Math.max(crossAt.get(m.id), Math.min(want.get(m.id) - s / 2, hi)));
      }
    }
  }
  ranks.forEach(r => {
    byRank.get(r).forEach(m => {
      const p = crossAt.get(m.id);
      const along = cursor[r] + (cellAt[r] - (down ? m._h : m._w)) / 2;
      m.rel = down ? { x:p, y:along } : { x:along, y:p };
      spanMax = Math.max(spanMax, p + sizeCross(m));
    });
  });
  return down ? { w: spanMax, h: cursorAlong } : { w: cursorAlong, h: spanMax };
}

function textSize(s, rootDir, byId, links){
  if (s.kind !== 'zone'){
    s._w = s.props.w != null ? s.props.w : SIZE[s.kind][0];
    s._h = s.props.h != null ? s.props.h : SIZE[s.kind][1];
    return;
  }
  s.children.forEach(c => textSize(c, rootDir, byId, links));
  const kids = s.children.filter(c => !(c.props.x != null && c.props.y != null));
  const bb = textPack(kids, links, s.props.dir || 'down', byId);
  kids.forEach(c => { c.rel.x += TEXT_ZPAD; c.rel.y += TEXT_ZTOP; });
  if (!kids.length){ s._w = SIZE.zone[0]; s._h = SIZE.zone[1]; return; }
  s._w = Math.max(bb.w + TEXT_ZPAD * 2, s.name.length * TEXT_TITLEW + 24);
  s._h = bb.h + TEXT_ZTOP + TEXT_ZBOT;
}

function buildTextDoc(model){
  const rootDir = model.dir;
  model.shapes.forEach(s => textSize(s, rootDir, model.byId, model.links));
  const top = model.root.children.filter(c => !(c.props.x != null && c.props.y != null));
  textPack(top, model.links, rootDir, model.byId);
  const place = (s, ox, oy) => {
    if (s.props.x != null && s.props.y != null){ s._x = s.props.x; s._y = s.props.y; }
    else { s._x = ox + s.rel.x; s._y = oy + s.rel.y; }
    if (s.kind === 'zone') s.children.forEach(c => place(c, s._x, s._y));
  };
  model.root.children.forEach(c => place(c, TEXT_ORIGIN, TEXT_ORIGIN));

  const theme = model.root.props.theme === 'data' ? TEXT_TONES : null;
  const nodes = [], brands = [];
  const emit = s => {
    const p = s.props;
    const tone = theme && s.kind !== 'zone' ? theme[s.kind] : null;
    const n = {
      id: s.id, kind: s.kind, title: s.name, sub: p.sub || '',
      color: p.color || tone || null, tcolor: null, scolor: null, fill: null, fs: 1,
      x: Math.round(s._x), y: Math.round(s._y), w: Math.round(s._w), h: Math.round(s._h)
    };
    if (p.tint) n.tint = true;
    if (p.anim) n.anim = p.anim;
    if (p.speed != null && p.speed !== 1) n.speed = p.speed;
    if (p.band) n.band = true;
    if (p.solid) n.solid = true;
    if (p.dash) n.dash = true;
    if (p.sharp) n.sharp = true;
    if (p.stroke) n.stroke = p.stroke;
    if (p.fillmode === 'solid') n.fillmode = 'solid';
    if (p.size) n.sw = { s:0.6, m:1.2, l:2.2, xl:3.4 }[p.size];
    if (p.fill) n.fill = p.fill;
    if (p.align) n.align = p.align;
    if (p.brand) brands.push({ id: s.id, brand: p.brand });
    nodes.push(n);
    if (s.kind === 'zone') s.children.forEach(emit);
  };
  model.root.children.forEach(emit);

  const links = model.links.map((l, i) => {
    const out = { id: 'e' + (i + 1), from: l.fromId, to: l.toId, label: l.label,
      color: l.color || null, motion: l.motion || null, bends: l.bends || [] };
    if (!l.head) out.head = false;
    if (l.dash) out.dash = true;
    return out;
  });

  const rp = model.root.props;
  if (rp.title || rp.subtitle){
    const left = Math.min(...nodes.map(n => n.x));
    const w = Math.max(
      Math.max(...nodes.map(n => n.x + n.w)) - left,
      rp.title ? Math.round(rp.title.length * TEXT_TITLE_W * TEXT_TITLE_FS) + 24 : 0,
      rp.subtitle ? Math.round(rp.subtitle.length * TEXT_SUB_W * TEXT_SUB_FS) + 24 : 0,
      270);
    const block = (rp.title ? TEXT_TITLE_H : 0) + (rp.subtitle ? TEXT_SUB_H : 0) +
      (rp.title && rp.subtitle ? 6 : 0);
    const dy = block + TEXT_HEADER_GAP;
    nodes.forEach(n => { n.y += dy; });
    const uid = base => {
      let id = base, i = 2;
      while (model.byId.has(id)) id = base + '-' + i++;
      return id;
    };
    const header = [];
    if (rp.title) header.push({
      id: uid('doc-title'), kind: 'heading', title: rp.title, sub: '',
      color: null, tcolor: null, scolor: null, fill: null, fs: TEXT_TITLE_FS,
      x: left, y: TEXT_ORIGIN, w, h: TEXT_TITLE_H, align: 'center'
    });
    if (rp.subtitle) header.push({
      id: uid('doc-subtitle'), kind: 'text', title: rp.subtitle, sub: '',
      color: null, tcolor: LINE, scolor: null, fill: null, fs: TEXT_SUB_FS,
      x: left, y: TEXT_ORIGIN + (rp.title ? TEXT_TITLE_H + 6 : 0), w, h: TEXT_SUB_H,
      align: 'center'
    });
    nodes.unshift(...header);
  }
  return { format:'yoruma', version:1, motion:'off', view:null, nodes, links };
}

function textDoc(text){ return buildTextDoc(parseText(text)); }

const textInput = document.createElement('input');
textInput.type = 'file';
textInput.accept = '.yoruma,.yaml,.yml,.txt,.text,text/plain';
textInput.style.display = 'none';
document.body.appendChild(textInput);
function openTextFile(){ textInput.click(); }
textInput.addEventListener('change', async () => {
  const file = textInput.files[0];
  textInput.value = '';
  if (!file) return;
  if (file.size > DOC_MAX_CHARS){ toast('that file is too large to open', 4200); return; }
  let text;
  try { text = await file.text(); }
  catch (e){ toast('open failed: could not read file'); return; }
  openTextDoc(text, file.name);
});
async function openTextDoc(text, name, quiet){
  let model;
  try { model = parseText(text); }
  catch (e){ toast('open failed: ' + e.message, 6000); return; }
  let doc;
  try { doc = buildTextDoc(model); }
  catch (e){ toast('open failed: ' + e.message, 6000); return; }
  if (!importText(JSON.stringify(doc), name, 'text', quiet)) return;
  const wanted = model.shapes.filter(s => s.props.brand);
  for (const s of wanted){
    const n = byId(s.id);
    if (n) await fetchLogoByName(s.props.brand, n);
  }
  for (const s of model.shapes.filter(x => x.props.icon)){
    const n = byId(s.id);
    if (!n) continue;
    const local = iconByName(s.props.icon);
    if (local){
      n.logo = iconDataUri(local);
      n.mono = true;
    } else {
      await fetchLogoByName(s.props.icon, n);
    }
  }
  render();
}
