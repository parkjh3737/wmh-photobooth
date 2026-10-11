// 프레임 5종(이야기·추억·낙서·필름·우표)과 합성. 새 프레임은 FRAMES 에 항목을 더하고, 사진 칸 위치는 config.js 의 LAYOUTS 에 둔다.
import { LAYOUTS } from './config.js';
import { mk, rng, drawCover, drawLogo, spaced, spacedLeft, grain, fibers, FONT_EN, FONT_HAND, FONT_MARKER, FONT_SCRIPT, FONT_BRUSH, FONT_SANS, FONT_BUBBLE } from './draw.js';

/* ───────── 프레임 5종 ───────── */
export const FRAMES = {
  /* 이야기: 붉은 종이, 세 컷이 가로로 나란히, 사진 아래로 흘려 쓴 제목 */
  story: { ko: '이야기', en: 'Story', layout: 'row3', need: 3, bg: '#b23c27', cream: '#f7ecdc',
    back(ctx, W, H) { ctx.fillStyle = this.bg; ctx.fillRect(0, 0, W, H); grain(ctx, W, H, 21, '255,232,208', 70, .4, 1.5); grain(ctx, W, H, 22, '60,10,4', 60, .3, 1.5); },
    cell() {},
    foot(ctx, f, L, o) {
      const c = L.cells[0], ls = 6, x = 560, y = 1508, lh = 60, lines = ['ONE NIGHT OF', 'HANOK, STORIES AND', 'UNFORGETTABLE', 'MISTAKES'];
      ctx.save(); ctx.fillStyle = this.cream; ctx.textBaseline = 'alphabetic';
      ctx.font = `400 40px ${FONT_EN}`; spacedLeft(ctx, 'WELCOME MISTAKES', 96, 152, 7);
      ctx.font = `400 250px ${FONT_SCRIPT}`; ctx.textAlign = 'left'; ctx.fillText('Our Story', 78, c.y + c.h + 204);   // 글자 위 끝이 사진 아래 약 20px
      // 오른쪽 아래 글: 첫 줄은 둘째 줄 너비에 맞춰 낱말 사이를 벌린다
      ctx.font = `400 41px ${FONT_EN}`;
      const wOf = t => [...t].reduce((a, ch) => a + ctx.measureText(ch).width + ls, -ls), words = lines[0].split(' ');
      const gap = (wOf(lines[1]) - words.reduce((a, w) => a + wOf(w), 0)) / (words.length - 1); let wx = x;
      words.forEach(w => { spacedLeft(ctx, w, wx, y, ls); wx += wOf(w) + gap; });
      lines.slice(1).forEach((t, i) => spacedLeft(ctx, t, x, y + (i + 1) * lh, ls));
      // 왼쪽 아래: 날짜와 장소
      ctx.font = `400 26px ${FONT_EN}`; ctx.globalAlpha = .92;
      if (o.date) spacedLeft(ctx, o.date, 96, y + 2 * lh, 4);
      if (o.caption) spacedLeft(ctx, o.caption.toUpperCase(), 96, y + 3 * lh, 4);
      ctx.restore();
    } },
  /* 추억: 흰 지면, 왼쪽에 세 컷이 세로로, 오른쪽에 세로로 선 붉은 붓글씨와 여행 추억 글 */
  memory: { ko: '추억', en: 'Memory', layout: 'col3', need: 3, bg: '#f4f3f0', ink: '#161616', red: '#d2372f',
    text: ['— 우리의 추억을 간직하자. 부암동 골목 끝 한옥에서 보낸 하루를 세 컷에 담았습니다. 웃다가 흔들린 사진도, 눈을 감은 사진도 그대로 오늘의 기록입니다.',
      '여행은 끝나도 사진은 남습니다. 망설임까지 환영하던 집, 웰컴미스테익스하우스에서.'],
    back(ctx, W, H) { ctx.fillStyle = this.bg; ctx.fillRect(0, 0, W, H); grain(ctx, W, H, 31, '0,0,0', 16, .5); },
    cell() {},
    foot(ctx, f, L, o) {
      const last = L.cells[2], ink = this.ink, colX = 752, colW = 388, lh = 36;
      ctx.save(); ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.textBaseline = 'alphabetic';
      // 머리글과 바닥글
      ctx.font = `400 27px ${FONT_SANS}`; ctx.textAlign = 'left'; ctx.fillText(o.date || '', 60, 98); ctx.fillText((o.caption || 'buam-dong, seoul').toLowerCase(), 60, 1724);
      ctx.textAlign = 'right'; ctx.fillText('welcome mistakes house', 1140, 98);
      ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(1078, 1715); ctx.lineTo(1138, 1715); ctx.moveTo(1128, 1707); ctx.lineTo(1139, 1715); ctx.lineTo(1128, 1723); ctx.stroke();
      // 본문: 한글은 글자 단위로 줄을 나누고, 남는 폭을 글자 사이에 고르게 나눠 양쪽을 맞춘다. 마지막 사진의 아랫변에 맞춰 끝난다
      ctx.font = `400 25px ${FONT_SANS}`; ctx.textAlign = 'left';
      const wrap = t => { const out = ['']; for (const ch of t) { const cur = out[out.length - 1]; if (cur && ctx.measureText(cur + ch).width > colW && !'.,!?)…'.includes(ch)) out.push(ch === ' ' ? '' : ch); else if (cur || ch !== ' ') out[out.length - 1] = cur + ch; } return out.map(l => l.trimEnd()); };
      const paras = this.text.map(wrap);
      let y = last.y + last.h - 6 - (paras.reduce((a, p) => a + p.length, 0) - 1) * lh - (paras.length - 1) * lh;
      paras.forEach(p => { p.forEach((line, i) => { const ch = [...line], ws = ch.map(c => ctx.measureText(c).width), gap = (i < p.length - 1 && ch.length > 1) ? (colW - ws.reduce((a, b) => a + b, 0)) / (ch.length - 1) : 0; let x = colX; ch.forEach((c, j) => { ctx.fillText(c, x, y); x += ws[j] + gap; }); y += lh; }); y += lh; });
      // 세로로 선 붓글씨: 따로 그린 뒤 마른 붓 자국처럼 군데군데 긁어내고, 왼쪽으로 돌려 사진 위에 걸쳐 세운다
      const m = mk(1300, 640), mx = m.getContext('2d'), r = rng(77);
      mx.font = `400 300px ${FONT_BRUSH}`; mx.fillStyle = this.red; mx.textBaseline = 'alphabetic'; mx.fillText('memories', 40, 410);
      mx.globalCompositeOperation = 'destination-out'; mx.strokeStyle = '#000'; mx.fillStyle = '#000';
      for (let i = 0; i < 2600; i++) { const x = r() * 1300, yy = r() * 640, l = 8 + r() * 54; mx.globalAlpha = .25 + r() * .6; mx.lineWidth = .7 + r() * 1.8; mx.beginPath(); mx.moveTo(x, yy); mx.lineTo(x + l, yy - l * .32); mx.stroke(); }
      for (let i = 0; i < 10000; i++) { mx.globalAlpha = .3 + r() * .6; mx.fillRect(r() * 1300, r() * 640, 1 + r() * 2.2, 1 + r() * 2.2); }
      ctx.translate(404, 1290); ctx.rotate(-Math.PI / 2 + .05); ctx.drawImage(m, 0, 0);   // 위 끝은 머리글 아래, 아래 끝은 본문 위
      ctx.restore();
    } },
  /* 낙서: 흰 종이에 네 컷을 엇갈려 놓고, 남색 펜으로 끄적인 그림과 글씨를 얹는다 */
  doodle: { ko: '낙서', en: 'Doodle', layout: 'quad', need: 4, bg: '#fdfdfb', ink: '#221c9e',
    back(ctx, W, H) { ctx.fillStyle = this.bg; ctx.fillRect(0, 0, W, H); },
    cell() {},
    foot(ctx, f, L, o) {
      const [p1, p2, p3, p4] = L.cells, r = rng(5), ink = this.ink;
      ctx.save(); ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      // 손으로 그은 것처럼 조금씩 흔들리는 선·동그라미·칠한 점·웃는 얼굴·화살표·마커 자국
      const line = (pts, w = 5) => { const q = pts.map(([x, y]) => [x + (r() - .5) * 6, y + (r() - .5) * 6]); ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); for (let i = 1; i < q.length - 1; i++) ctx.quadraticCurveTo(q[i][0], q[i][1], (q[i][0] + q[i + 1][0]) / 2, (q[i][1] + q[i + 1][1]) / 2); ctx.lineTo(q[q.length - 1][0], q[q.length - 1][1]); ctx.stroke(); };
      const ring = (cx, cy, rx, ry = rx, w = 5, rot = 0, turns = 1.1) => { const pts = []; for (let a = 0; a <= Math.PI * 2 * turns; a += .35) { const k = 1 + (r() - .5) * .07, x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k; pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); } line(pts, w); };
      const blob = (cx, cy, R) => { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip(); const pts = []; for (let y = -R; y <= R; y += 8) { pts.push([cx - R - 6, cy + y]); pts.push([cx + R + 6, cy + y + 4]); } line(pts, 11); ctx.restore(); ring(cx, cy, R, R, 5, 0, 1.7); };
      const smile = (cx, cy, R) => { ring(cx, cy, R, R * .92, 5, 0, 1.3); line([[cx - R * .3, cy - R * .38], [cx - R * .3, cy - R * .08]], 6); line([[cx + R * .3, cy - R * .38], [cx + R * .3, cy - R * .08]], 6); line([[cx - R * .5, cy + R * .15], [cx - R * .22, cy + R * .5], [cx + R * .22, cy + R * .5], [cx + R * .5, cy + R * .15]], 5); };
      const arrow = pts => { line(pts, 5); const [x2, y2] = pts[pts.length - 1], [x1, y1] = pts[pts.length - 2], a = Math.atan2(y2 - y1, x2 - x1); line([[x2 - 26 * Math.cos(a - .55), y2 - 26 * Math.sin(a - .55)], [x2, y2], [x2 - 26 * Math.cos(a + .55), y2 - 26 * Math.sin(a + .55)]], 5); };
      const tape = (x, y, len, rot, n = 3) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); for (let i = 0; i < n; i++) line([[(r() - .5) * 14, i * 17], [len * (.8 + r() * .3), i * 17]], 19); ctx.restore(); };
      const txt = (t, x, y, size, rot = 0, font = FONT_MARKER, align = 'left') => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.font = `400 ${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(t, 0, 0); ctx.restore(); };

      // 첫째 컷: 테두리 글씨, 마커 자국, 사람을 두른 큰 동그라미, 아래로 가리키는 화살표
      tape(p1.x + 190, p1.y - 20, 150, -.03, 2);
      txt('WELCOME', 22, 134, 116, -.07, FONT_BUBBLE);
      ring(p1.x + 185, p1.y + 300, 232, 188, 3.5, -.2, 1.06);
      line([[30, 300], [30, 322]], 6); line([[70, 296], [70, 318]], 6); line([[18, 344], [34, 372], [50, 350], [66, 374], [84, 346]], 5);
      arrow([[82, 530], [58, 560], [86, 584], [64, 610], [70, 660]]);
      // 둘째 컷: 길게 흐르는 선과 꾹꾹 칠한 동그라미들, 옆으로 세운 장소·날짜
      line([[1150, 60], [960, 70], [720, 150], [640, 300], [690, 440], [620, 560], [700, 700], [900, 770]], 3.5);
      [[12, -64, 46], [342, -8, 46], [0, 122, 40], [338, 426, 26], [-72, 554, 56], [304, 566, 50]].forEach(([dx, dy, R]) => blob(p2.x + dx, p2.y + dy, R));
      ctx.save(); ctx.translate(p2.x + p2.w + 28, p2.y + 76); ctx.rotate(Math.PI / 2); ctx.font = `400 42px ${FONT_MARKER}`; spacedLeft(ctx, [(o.caption || 'BUAM-DONG · SEOUL').toUpperCase(), o.date].filter(Boolean).join('   '), 0, 0, 5); ctx.restore();
      // 두 줄 사이: 끄적인 글씨들
      txt('TAKE', 40, 790, 84); line([[38, 806], [62, 800], [84, 810], [108, 800], [132, 808], [150, 800]], 5);
      txt('A', 196, 792, 76); txt('SHOT', 240, 812, 104, -.1, FONT_BUBBLE);
      line([[196, 836], [212, 844]], 5); line([[204, 856], [222, 862]], 5); line([[430, 760], [452, 752]], 5); line([[436, 782], [460, 778]], 5);
      line([[488, 700], [520, 716], [498, 740], [540, 752], [520, 776], [566, 770]], 5); line([[556, 690], [566, 708]], 5); line([[582, 696], [588, 712]], 5);
      ctx.save(); ctx.beginPath(); ctx.rect(380, 780, 160, 88); ctx.clip(); blob(456, 868, 62); ctx.restore(); line([[388, 868], [530, 868]], 5);
      txt("DON'T BE SHY!", 624, 858, 68, -.04);
      // 읽는 순서대로: 첫 줄 "I don't wanna go ...", 둘째 줄 "just wanna stay" 에 이어 "all the time"
      [["I don't wanna go ...", 24, 968], ['just wanna stay', 138, 1054], ['all the time', 380, 982]].forEach(([t, x, y]) => txt(t, x, y, 44, -.34));
      line([[566, 918], [568, 936]], 5); line([[586, 914], [588, 932]], 5); line([[554, 948], [578, 958], [598, 944]], 5);
      txt('MISTAKES', 626, 1014, 126, .02, FONT_BUBBLE);
      // 셋째 컷: 모서리의 마커 자국, 번호, 사진 위를 지나는 가는 선, 한마디
      tape(p3.x - 50, p3.y + 36, 110, -.75, 3); tape(p3.x + p3.w - 70, p3.y + p3.h + 44, 96, -.9, 3);
      ring(516, 1178, 36, 34, 5, 0, 1.35); txt('1', 505, 1192, 54); line([[494, 1206], [506, 1200], [518, 1208], [532, 1200]], 4);
      line([[58, 1340], [44, 1500], [70, 1640], [200, 1590], [250, 1520], [330, 1470], [470, 1400], [560, 1370]], 3.5);
      txt('SO', 468, 1468, 54, -.22); txt('GOOD!', 472, 1526, 56, -.22);   // 넷째 컷 점선 앞에서 끝난다
      // 넷째 컷: 점선 테두리, 화살표, 번호 붙인 목록, 웃는 얼굴
      ctx.save(); ctx.lineWidth = 6; ctx.setLineDash([24, 18]); ctx.beginPath(); ctx.moveTo(p4.x - 22, p4.y + 10); ctx.lineTo(p4.x - 24, p4.y + p4.h + 26); ctx.lineTo(p4.x + p4.w + 12, p4.y + p4.h + 24); ctx.stroke(); ctx.restore();
      arrow([[1076, 1064], [1108, 1100], [1084, 1140], [1070, 1112], [1096, 1150], [1098, 1196]]);
      txt('1. CUTE', 1034, 1262, 48, .5); line([[1022, 1292], [1150, 1370]], 6);
      txt('2. BRAVE', 1026, 1440, 48, .46); line([[1018, 1474], [1042, 1486], [1062, 1480], [1156, 1550]], 6);   // 글씨 끝이 오른쪽 가장자리에서 25px 안쪽
      smile(1100, 1634, 48); ring(1100, 1634, 54, 50, 3, .4, 1.1);
      txt('3.', 650, 1764, 62); txt('SMILE', 726, 1760, 84, -.02, FONT_BUBBLE); line([[726, 1774], [756, 1768], [796, 1778], [856, 1768], [916, 1776]], 4);
      [[956, 1740], [1002, 1736]].forEach(([x, y]) => line([[x, y + 16], [x - 16, y - 2], [x - 6, y - 14], [x, y - 4], [x + 6, y - 14], [x + 16, y - 2], [x, y + 16]], 4));
      // 왼쪽 아래: 로고와 웃는 얼굴
      drawLogo(ctx, p3.x + 78, 1742, 156, ink, ink); smile(540, 1716, 42);
      ctx.restore();
    } },
  /* 필름: 검은 필름 밀착 인화지, 네 컷. 가장자리 글자는 필름 상표 대신 집 이름·날짜·컷 번호 */
  film: { ko: '필름', en: 'Film', layout: 'film', need: 4, bg: '#060606',
    back(ctx, W, H) { ctx.fillStyle = this.bg; ctx.fillRect(0, 0, W, H); },
    cell() {},
    foot(ctx, f, L, o) {
      const C = L.cells, white = '#f4f2ee', brand = 'WELCOME MISTAKES HOUSE', spec = 'HANOK STAY     ×     ' + (o.caption || 'BUAM-DONG · SEOUL').toUpperCase();
      const T = (t, x, y, size, weight, align = 'left') => { ctx.font = `${weight} ${size}px ${FONT_EN}`; ctx.fillStyle = white; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(t, x, y); };
      const arrow = (x, y) => { ctx.fillStyle = white; ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x + 27, y); ctx.lineTo(x, y + 9); ctx.closePath(); ctx.fill(); };
      ctx.save();
      // 윗띠: 집 이름과 규격 글자, 오른쪽 끝에 컷 번호
      [[C[0].x + 8, 162, C[0].x + C[0].w], [C[1].x + 8, C[1].x + 150, 1172]].forEach(([bx, sx, nx], i) => { T(brand, bx, 92, 27, 700); T(spec, sx, 122, 19, 400); T(String(i + 1), nx, 122, 27, 700, 'right'); });
      // 가운데띠: 아랫줄 컷의 규격 글자와 번호
      [C[2], C[3]].forEach((c, i) => { T(spec, c.x + (i ? 44 : 12), c.y - 22, 19, 400); T(String(i + 3), i ? 1172 : c.x + c.w, c.y - 20, 27, 700, 'right'); });
      // 컷 아래 진행 방향 화살표
      [C[0], C[2]].forEach(c => { arrow(c.x + 58, c.y + c.h + 34); arrow(c.x + 466, c.y + c.h + 34); });
      [C[1], C[3]].forEach(c => arrow(c.x + 293, c.y + c.h + 34));
      // 아랫띠: 로고, 집 이름, 날짜
      drawLogo(ctx, 52 + 80, 1741, 160, white, 'rgba(244,242,238,.6)');
      T(brand, 258, 1751, 27, 700); const bw = ctx.measureText(brand).width; T('×     HANOK STAY', 258 + bw + 22, 1751, 19, 400);
      if (o.date) { ctx.font = `600 23px ${FONT_EN}`; ctx.fillStyle = white; const d = o.date.replace(/\./g, ' . '), ws = [...d].map(ch => ctx.measureText(ch).width), tw = ws.reduce((x, y) => x + y, 0) + 7 * (d.length - 1); spaced(ctx, d, 1148 - tw / 2, 1751, 7); }
      ctx.restore();
    } },
  /* 우표: 회색 종이 위에 우표 모양 사진 한 장, 붉은 손글씨와 동그라미 친 날짜 */
  stamp: { ko: '우표', en: 'Stamp', layout: 'single', need: 1, bg: '#d8d8d6', ink: '#c9151b',
    back(ctx, W, H, L) {
      ctx.fillStyle = this.bg; ctx.fillRect(0, 0, W, H);
      // 종이 결: 고운 알갱이 + 섬유 + 드문드문 티
      const n = mk(256, 256), nx = n.getContext('2d'), d = nx.createImageData(256, 256), r = rng(99);
      for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 26; }
      nx.putImageData(d, 0, 0); ctx.fillStyle = ctx.createPattern(n, 'repeat'); ctx.fillRect(0, 0, W, H);
      fibers(ctx, W, H, 55, 700, ['#ffffff', '#9a9a98', '#b8b8b6']);
      ctx.fillStyle = '#55554f'; for (let i = 0; i < 46; i++) { ctx.globalAlpha = .1 + r() * .25; ctx.beginPath(); ctx.arc(r() * W, r() * H, .8 + r() * 2.2, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
      // 우표: 가장자리에 구멍 자국
      const c = L.cells[0], m = 50, sw = c.w + m * 2, sh = c.h + m * 2, hole = 13, pad = 30, st = mk(sw + pad * 2, sh + pad * 2), sx = st.getContext('2d');
      sx.fillStyle = '#ebe8e1'; sx.fillRect(pad, pad, sw, sh); sx.globalCompositeOperation = 'destination-out';
      const nxs = Math.round(sw / 38), nys = Math.round(sh / 38);
      for (let i = 0; i <= nxs; i++) [pad, pad + sh].forEach(y => { sx.beginPath(); sx.arc(pad + sw * i / nxs, y, hole, 0, 7); sx.fill(); });
      for (let i = 0; i <= nys; i++) [pad, pad + sw].forEach(x => { sx.beginPath(); sx.arc(x, pad + sh * i / nys, hole, 0, 7); sx.fill(); });
      ctx.save(); ctx.shadowColor = 'rgba(40,38,34,.3)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 7; ctx.drawImage(st, c.x - m - pad, c.y - m - pad); ctx.restore();
    },
    cell() {},
    foot(ctx, f, L, o) {
      const c = L.cells[0], ink = this.ink;
      const hand = (t, x, y, size, rot = 0, font = FONT_HAND, align = 'left') => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.font = `400 ${size}px ${font}`; ctx.fillStyle = ink; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(t, 0, 0); ctx.restore(); };
      const pen = (w) => { ctx.strokeStyle = ink; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; };
      hand('hello,', 64, 196, 104, -.05); hand("you're welcome!", 1140, 206, 100, -.03, FONT_HAND, 'right');
      hand('Welcome Mistakes', 600, c.y - 62, 92, -.055, FONT_HAND, 'center');
      // 소인처럼 우표 모서리에 겹친 로고
      ctx.save(); ctx.translate(c.x + c.w + 44, c.y + c.h + 26); ctx.rotate(.13); drawLogo(ctx, 0, 0, 176, ink, ink); ctx.restore();
      hand('.at Buam-dong', 600, 1348, 88, -.02, FONT_HAND, 'center');
      // 동그라미 친 날짜 (일 / 월 / 년)
      const [yy, mm, dd] = (o.date || o.today || '').split('.'), dt = [dd, mm, (yy || '').slice(2)].join(' / ');
      hand(dt, 600, 1490, 108, -.012, FONT_MARKER, 'center');
      ctx.save(); pen(4.2); ctx.translate(600, 1456); ctx.rotate(-.02);
      ctx.beginPath(); for (let a = .2, i = 0; a < Math.PI * 2 + .42; a += .05, i++) { const k = 1 + .03 * Math.sin(a * 2.3) + .012 * a, x = Math.cos(a) * 300 * k, y = Math.sin(a) * 70 * k; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      ctx.beginPath(); ctx.moveTo(118, 50); ctx.quadraticCurveTo(160, 57, 214, 47); ctx.stroke(); ctx.restore();
      hand('stay by: you & the house', 110, 1628, 70, -.03, FONT_MARKER); hand('(mistakes welcome)', 1110, 1604, 50, -.045, FONT_MARKER, 'right');
      // 큰 글씨와 손으로 그은 화살표
      hand('MISTAKES', 96, 1756, 116, -.015, FONT_MARKER); hand('MEMORIES', 1112, 1750, 116, -.015, FONT_MARKER, 'right');
      ctx.font = `400 116px ${FONT_MARKER}`; const a0 = 96 + ctx.measureText('MISTAKES').width + 26, a1 = 1112 - ctx.measureText('MEMORIES').width - 26;   // 화살표는 두 낱말 사이에만
      ctx.save(); pen(8); ctx.beginPath(); ctx.moveTo(a0, 1722); ctx.quadraticCurveTo((a0 + a1) / 2, 1710, a1 - 8, 1714); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(a1 - 36, 1692); ctx.lineTo(a1, 1714); ctx.lineTo(a1 - 38, 1736); ctx.stroke(); ctx.restore();
    } }
};
export const FILTERS = { none: { ko: '그대로', en: 'Original' }, bw: { ko: '흑백', en: 'Mono' }, warm: { ko: '필름', en: 'Film' } };

export function applyFilter(src, type) {
  if (type === 'none') return src;
  src._f = src._f || {}; if (src._f[type]) return src._f[type];
  const s = Math.min(1, 1500 / Math.max(src.width, src.height)), c = mk(Math.round(src.width * s), Math.round(src.height * s)), x = c.getContext('2d');
  x.drawImage(src, 0, 0, c.width, c.height);
  const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
  if (type === 'bw') for (let i = 0; i < p.length; i += 4) { let g = p[i] * .299 + p[i + 1] * .587 + p[i + 2] * .114; g = (g - 128) * 1.1 + 130; p[i] = p[i + 1] = p[i + 2] = g; }
  else for (let i = 0; i < p.length; i += 4) { p[i] = (p[i] * 1.05 + 8) * .95 + 10; p[i + 1] = (p[i + 1] * 1.0 + 3) * .95 + 9; p[i + 2] = (p[i + 2] * .9) * .95 + 12; }
  x.putImageData(d, 0, 0); return (src._f[type] = c);
}

export function compose(cv, o) {
  cv.width = 1200; cv.height = 1800;
  const ctx = cv.getContext('2d'), F = FRAMES[o.frame], L = LAYOUTS[F.layout], s = 1 - 2 * ((o.safe || 0) / 100);
  ctx.fillStyle = F.bg; ctx.fillRect(0, 0, 1200, 1800);
  ctx.save(); ctx.translate(600, 900); ctx.scale(s, s); ctx.translate(-600, -900);
  F.back(ctx, 1200, 1800, L);
  L.cells.forEach((c, i) => { if (o.shots[i]) drawCover(ctx, applyFilter(o.shots[i], o.filter || 'none'), c); else { ctx.fillStyle = 'rgba(128,128,128,.25)'; ctx.fillRect(c.x, c.y, c.w, c.h); } F.cell(ctx, c, i); });
  F.foot(ctx, null, L, o);
  ctx.restore();
}

/* 자리표시용 견본 컷 (프레임 미리보기·시연용) */
export function demoShot(i) {
  const cv = mk(1200, 900), c = cv.getContext('2d');
  const T = [['#d9cbb4', '#a8957a', '#6f5f4c'], ['#c3ccc6', '#93a39b', '#5f6e67'], ['#e0cdb9', '#b79878', '#7a5f48'], ['#cbc7ba', '#9d9887', '#66614f'], ['#d6c6ae', '#a58e70', '#6d5a44'], ['#c2c9cc', '#8f9aa0', '#5c666c'], ['#dccfbb', '#ad9a7f', '#73634f'], ['#c9cfc4', '#98a391', '#636d5c']][i % 8];
  const g = c.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, T[0]); g.addColorStop(1, T[1]); c.fillStyle = g; c.fillRect(0, 0, 1200, 900);
  c.fillStyle = 'rgba(255,255,255,.14)'; for (let x = 120; x < 1200; x += 180) c.fillRect(x, 0, 10, 900);
  const fig = (x, y, k) => { c.fillStyle = T[2]; c.beginPath(); c.arc(x, y, 92 * k, 0, 7); c.fill(); c.beginPath(); c.ellipse(x, y + 420 * k, 185 * k, 300 * k, 0, 0, 7); c.fill(); };
  const o = [[-128, 0, 128, 14], [-118, 26, 122, -6], [-130, -10, 126, 20], [-112, 12, 134, 0]][i % 4];
  fig(600 + o[0], 370 + o[1], 1); fig(600 + o[2], 392 + o[3], .94);
  return cv;
}
export const demoShots = n => Array.from({ length: n }, (_, i) => demoShot(i));


/* 첫 화면에 넣을 사진이 아직 없을 때 보이는 밤의 처마 그림 */
export function drawHeroFallback(cv) {
  const W = cv.width, H = cv.height, c = cv.getContext('2d'), col = '#dfe3e2';
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#10161d'); g.addColorStop(.6, '#1b2531'); g.addColorStop(1, '#0d0c0b'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const u = Math.max(W, H) / 1000, base = H * .42, rise = H * .07, cx = W * .5, half = W * .62;
  c.fillStyle = 'rgba(241,236,225,.9)'; c.beginPath(); c.arc(W * .76, H * .17, 46 * u, 0, 7); c.fill();
  const yAt = x => base - rise * Math.pow((x - cx) / half, 2), step = 30 * u;
  c.strokeStyle = col; c.fillStyle = col;
  for (let x = step / 2; x < W; x += step) {
    const y = yAt(x), gr = c.createLinearGradient(0, y - 20 * u, 0, y - 190 * u); gr.addColorStop(0, 'rgba(223,227,226,.7)'); gr.addColorStop(1, 'rgba(223,227,226,0)');
    c.strokeStyle = gr; c.lineWidth = 2.2 * u; c.beginPath(); c.moveTo(x, y - 20 * u); c.lineTo(x, y - 190 * u); c.stroke();
    c.strokeStyle = col; c.lineWidth = 2 * u; c.beginPath(); c.arc(x, y - 10 * u, 8.5 * u, 0, 7); c.stroke();
    c.globalAlpha = .5; c.beginPath(); c.arc(x, y + 20 * u, 2.8 * u, 0, 7); c.fill(); c.globalAlpha = 1;
  }
  [[0, 3.4, 1], [9, 1.3, .6]].forEach(([dy, lw, a]) => { c.globalAlpha = a; c.lineWidth = lw * u; c.beginPath(); for (let x = 0; x <= W; x += 6) c[x ? 'lineTo' : 'moveTo'](x, yAt(x) + dy * u); c.stroke(); c.globalAlpha = 1; });
}


/** 프레임에 들어가는 사진 수 (이야기·추억 3, 낙서·필름 4, 우표 1) */
export const needOf = frame => FRAMES[frame].need;
/** 프레임의 사진 칸 가로세로 비 (촬영 화면의 틀 모양) */
export const aspectFor = frame => { const c = LAYOUTS[FRAMES[frame].layout].cells[0]; return c.w / c.h; };
