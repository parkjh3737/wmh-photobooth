// 설정값(S)과 프레임별 사진 칸 위치(LAYOUTS). 종이는 4×6인치 한 장 = 1200×1800px.

/* ───────── 설정 ───────── */
export const DEF = { countdown: 5, extra: 2, frame: 'story', filter: 'none', mirror: true, deviceId: '',
  caption: 'BUAM-DONG · SEOUL',
  greetTitle: '당신의 추억을 담아드릴게요!', greetSub: '웰컴미스테익스하우스에서의 오늘을 사진으로 남겨보세요.', greetEn: 'We will keep your memories for you', logoLine: false, showDate: true, sound: true, idleSec: 120, safe: 2, logo: null, logoTint: false, uiFont: 'gaegu' };   // uiFont: 화면 글꼴 gaegu·gamja·dongle·singleday·serif
const KEY = 'wmh-4cut-v1';
export const S = (() => { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return Object.assign({}, DEF); } })();
/** 설정을 태블릿에 저장. 실패하면 false (용량 초과 등) */
export function persist() { try { localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { return false; } }

/* ───────── 사진 칸 위치 (300dpi, 4×6인치 = 1200×1800) ───────── */
export const LAYOUTS = {
  /* 이야기 프레임: 세 컷이 가로로 나란히, 종이 양끝까지 닿는다 */
  row3: { cells: [0, 1, 2].map(i => ({ x: i * 404, y: 426, w: 392, h: 540 })) },
  /* 추억 프레임: 세 컷이 왼쪽에 세로로 쌓인다 */
  col3: { cells: [0, 1, 2].map(i => ({ x: 60, y: 140 + i * 506, w: 660, h: 480 })) },
  /* 낙서 프레임: 네 컷을 엇갈려 놓는다. 사이사이에 낙서가 들어간다 */
  quad: { cells: [{ x: 150, y: 100, w: 380, h: 570 }, { x: 740, y: 140, w: 380, h: 570 }, { x: 70, y: 1100, w: 380, h: 570 }, { x: 630, y: 1050, w: 380, h: 570 }] },
  /* 필름 프레임: 2×2, 칸 사이에 필름 가장자리 글자가 들어갈 띠를 둔다 */
  film: { cells: [{ x: 52, y: 140, w: 526, h: 690 }, { x: 622, y: 140, w: 526, h: 690 }, { x: 52, y: 960, w: 526, h: 690 }, { x: 622, y: 960, w: 526, h: 690 }] },
  /* 우표 프레임: 사진 한 장 */
  single: { cells: [{ x: 330, y: 530, w: 540, h: 660 }] }
};
/* 첫 화면 사진(app/photos/1.jpg, 2.jpg …)에서 화면이 잘릴 때 남길 중심점. 순서대로 1번 사진부터, 없으면 가운데 */
export const HERO_FOCUS = ['52% 45%', '80% 38%', '50% 45%', '50% 68%', '68% 72%', '62% 50%'];
/* 로고 파일. 더 큰 원본이 있으면 같은 이름으로 app/logo/ 에 덮어쓰면 된다 */
export const LOGO_FILE = 'logo/logo.png';
