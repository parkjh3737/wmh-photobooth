// 손님 화면 문구 6개 언어. 첫 화면 오른쪽 위에서 고른다. 호스트 설정 창과 프레임 안 글씨는 바꾸지 않는다.
// 한국어 첫 화면 인사말은 호스트 설정(S.greetTitle 등)을 따르고, 다른 언어는 아래 번역을 쓴다.

export const LANGS = { ko: '한국어', en: 'English', ja: '日本語', zh: '中文', fr: 'Français', es: 'Español' };
export const DEF_LANG = 'ko';

const T = {
  /* 첫 화면 */
  eyebrow:    { en: 'Welcome Mistakes House', ja: 'Welcome Mistakes House', zh: 'Welcome Mistakes House', fr: 'Welcome Mistakes House', es: 'Welcome Mistakes House' },
  greetTitle: { en: "We'll capture your memories!", ja: 'あなたの思い出を\n写真に残します！', zh: '为你留住\n美好的回忆！', fr: 'Nous gardons\nvos souvenirs !', es: '¡Guardamos\ntus recuerdos!' },
  greetSub:   { en: 'Keep today at Welcome Mistakes House in a photo.', ja: 'ウェルカムミステイクスハウスでの今日を写真に残しましょう。', zh: '用照片记录在 Welcome Mistakes House 的今天。',
                fr: 'Gardez en photo votre journée à la Welcome Mistakes House.', es: 'Guarda en una foto tu día en Welcome Mistakes House.' },
  start:      { ko: '시작하기', en: 'Start', ja: 'はじめる', zh: '开始', fr: 'Commencer', es: 'Empezar' },
  fine:       { ko: '사진은 이 기기 안에서만 만들어지고, 첫 화면으로 돌아오면 지워집니다.', en: 'Your photos stay on this device and are erased when you return to the start screen.',
                ja: '写真はこの端末の中だけで作られ、最初の画面に戻ると消去されます。', zh: '照片只在本设备内生成，返回首页后即会删除。',
                fr: "Vos photos restent sur cet appareil et sont effacées au retour à l'écran d'accueil.", es: 'Tus fotos se quedan en este dispositivo y se borran al volver a la pantalla de inicio.' },
  langLabel:  { ko: '언어', en: 'Language', ja: '言語', zh: '语言', fr: 'Langue', es: 'Idioma' },
  /* 단계 표시와 공통 버튼 */
  stepFrame:  { ko: '프레임', en: 'Frame', ja: 'フレーム', zh: '相框', fr: 'Cadre', es: 'Marco' },
  stepShoot:  { ko: '촬영', en: 'Shoot', ja: '撮影', zh: '拍摄', fr: 'Photos', es: 'Fotos' },
  stepPick:   { ko: '고르기', en: 'Pick', ja: '選ぶ', zh: '挑选', fr: 'Choix', es: 'Elegir' },
  stepPrint:  { ko: '인쇄', en: 'Print', ja: '印刷', zh: '打印', fr: 'Imprimer', es: 'Imprimir' },
  home:       { ko: '처음으로', en: 'Start over', ja: '最初へ', zh: '返回首页', fr: 'Accueil', es: 'Inicio' },
  /* 프레임 고르기 */
  pickFrame:  { ko: '어떤 프레임에 담을까요?', en: 'Which frame would you like?', ja: 'どのフレームにしますか？', zh: '选择一个相框吧', fr: 'Quel cadre choisissez-vous ?', es: '¿Qué marco prefieres?' },
  toShoot:    { ko: '촬영하러 가기', en: 'Next', ja: '撮影へ進む', zh: '去拍照', fr: 'Passer aux photos', es: 'Ir a la cámara' },
  /* 촬영 */
  cancel:     { ko: '그만두기', en: 'Stop', ja: 'やめる', zh: '停止', fr: 'Arrêter', es: 'Parar' },
  ready:      { ko: '준비되면 눌러주세요', en: "Press when you're ready", ja: '準備ができたら押してください', zh: '准备好了就按下吧', fr: 'Appuyez quand vous êtes prêts', es: 'Pulsa cuando estés listo' },
  shootTip:   { ko: '눈을 감아도, 웃음이 터져도 괜찮아요. 여기는 실수를 환영하는 집이니까요.', en: "Closed eyes or a burst of laughter — it's all fine. This is a house that welcomes mistakes.",
                ja: '目をつぶっても、笑い出しても大丈夫。ここは失敗を歓迎する家ですから。', zh: '闭眼了、笑场了都没关系。这里是欢迎“失误”的家。',
                fr: 'Yeux fermés ou fou rire, tout va bien : ici, les erreurs sont les bienvenues.', es: '¿Ojos cerrados o un ataque de risa? No pasa nada: aquí los errores son bienvenidos.' },
  shootGo:    { ko: '촬영 시작', en: 'Start', ja: '撮影スタート', zh: '开始拍摄', fr: 'Lancer', es: 'Empezar' },
  shotN:      { ko: n => `${n}번째 컷, 카메라를 봐주세요`, en: n => `Shot ${n} — look at the camera`, ja: n => `${n}枚目、カメラを見てください`, zh: n => `第 ${n} 张，请看镜头`,
                fr: n => `Photo ${n} : regardez l'objectif`, es: n => `Foto ${n}: mira a la cámara` },
  camDenied:  { ko: '카메라 사용이 허용되지 않았습니다. 브라우저 주소창의 자물쇠에서 카메라를 허용해 주세요.', en: 'Camera access was not allowed. Tap the lock icon in the address bar and allow the camera.',
                ja: 'カメラの使用が許可されていません。アドレスバーの鍵マークからカメラを許可してください。', zh: '未允许使用相机。请点击地址栏中的锁形图标并允许使用相机。',
                fr: "L'accès à la caméra n'est pas autorisé. Touchez le cadenas dans la barre d'adresse et autorisez la caméra.", es: 'No se ha permitido el acceso a la cámara. Toca el candado de la barra de direcciones y permite la cámara.' },
  camInsecure:{ ko: '이 주소에서는 카메라를 쓸 수 없습니다. https:// 로 시작하는 주소로 열어 주세요.', en: "The camera can't be used at this address. Open it from an address starting with https://.",
                ja: 'このアドレスではカメラを使えません。https:// で始まるアドレスで開いてください。', zh: '此地址无法使用相机。请使用以 https:// 开头的地址打开。',
                fr: "La caméra n'est pas disponible à cette adresse. Ouvrez une adresse commençant par https://.", es: 'La cámara no funciona en esta dirección. Ábrela desde una dirección que empiece por https://.' },
  camNone:    { ko: '카메라를 찾지 못했습니다.', en: 'No camera was found.', ja: 'カメラが見つかりません。', zh: '未找到相机。', fr: 'Aucune caméra trouvée.', es: 'No se ha encontrado ninguna cámara.' },
  camFail:    { ko: '카메라를 켜지 못했습니다. 다른 앱이 카메라를 쓰고 있는지 확인해 주세요.', en: "Couldn't start the camera. Check whether another app is using it.",
                ja: 'カメラを起動できませんでした。ほかのアプリがカメラを使っていないか確認してください。', zh: '无法启动相机。请检查是否有其他应用正在使用相机。',
                fr: "Impossible d'allumer la caméra. Vérifiez qu'aucune autre application ne l'utilise.", es: 'No se ha podido encender la cámara. Comprueba que ninguna otra app la esté usando.' },
  retry:      { ko: '다시 시도', en: 'Retry', ja: '再試行', zh: '重试', fr: 'Réessayer', es: 'Reintentar' },
  demoFlow:   { ko: '견본 사진으로 흐름만 보기', en: 'Try it with sample photos', ja: '見本の写真で流れだけ見る', zh: '用示例照片体验流程', fr: 'Essayer avec des photos exemples', es: 'Probar con fotos de ejemplo' },
  /* 고르기 */
  pick1:      { ko: '가장 마음에 드는 한 장을 골라주세요', en: 'Pick your favorite one', ja: 'いちばん気に入った1枚を選んでください', zh: '请选出最喜欢的一张', fr: 'Choisissez votre photo préférée', es: 'Elige tu foto favorita' },
  pickN:      { ko: n => `마음에 드는 ${{ 2: '두', 3: '세', 4: '네' }[n] || n} 장을 순서대로 골라주세요`, en: n => `Pick ${n} favorites, in order`, ja: n => `気に入った${n}枚を順番に選んでください`,
                zh: n => `请按顺序选出喜欢的 ${n} 张`, fr: n => `Choisissez ${n} photos, dans l'ordre`, es: n => `Elige ${n} fotos, en orden` },
  tip1:       { ko: '다른 사진을 누르면 바뀝니다.', en: 'Tap another photo to switch.', ja: '別の写真を押すと入れ替わります。', zh: '点击其他照片即可更换。', fr: 'Touchez une autre photo pour changer.', es: 'Toca otra foto para cambiarla.' },
  tipN:       { ko: '고른 순서대로 들어갑니다. 다시 누르면 빠집니다.', en: 'They go in the order you pick. Tap again to remove.', ja: '選んだ順に入ります。もう一度押すと外れます。',
                zh: '按选择顺序放入，再点一次即可取消。', fr: "Elles sont placées dans l'ordre choisi. Touchez à nouveau pour retirer.", es: 'Se colocan en el orden elegido. Vuelve a tocar para quitarla.' },
  pickFull:   { ko: '다 골랐어요. 바꾸려면 고른 사진을 다시 눌러 빼주세요.', en: 'All picked. To change, first tap a chosen photo to remove it.',
                ja: '選び終わりました。変えるには選んだ写真をもう一度押して外してください。', zh: '已经选好了。如需更换，请先再次点击已选照片将其取消。',
                fr: "C'est complet. Pour changer, touchez d'abord une photo choisie pour la retirer.", es: 'Ya has elegido todas. Para cambiar, toca primero una foto elegida para quitarla.' },
  done:       { ko: '완성하기', en: 'Done', ja: '完成', zh: '完成', fr: 'Terminer', es: 'Listo' },
  reshoot:    { ko: '다시 찍기', en: 'Retake', ja: '撮り直す', zh: '重拍', fr: 'Reprendre', es: 'Repetir' },
  /* 인쇄 */
  labFrame:   { ko: 'Frame · 프레임', en: 'Frame', ja: 'Frame · フレーム', zh: 'Frame · 相框', fr: 'Frame · Cadre', es: 'Frame · Marco' },
  labTone:    { ko: 'Tone · 색감', en: 'Tone', ja: 'Tone · 色味', zh: 'Tone · 色调', fr: 'Tone · Teinte', es: 'Tone · Tono' },
  print:      { ko: '인쇄하기', en: 'Print', ja: '印刷する', zh: '打印', fr: 'Imprimer', es: 'Imprimir' },
  save:       { ko: '내 폰으로 저장', en: 'Save to my phone', ja: 'スマホに保存', zh: '保存到手机', fr: 'Enregistrer sur mon téléphone', es: 'Guardar en mi móvil' },
  cutTip:     { ko: '엽서 크기(4×6) 한 장으로 인쇄됩니다.', en: 'Prints on one postcard-size (4×6) sheet.', ja: 'はがきサイズ(4×6)1枚で印刷されます。', zh: '将打印为一张明信片大小（4×6）的照片。',
                fr: 'Imprimé sur une feuille format carte postale (4×6).', es: 'Se imprime en una hoja tamaño postal (4×6).' },
  saved:      { ko: '사진을 이 기기에 저장했습니다.', en: 'Saved the photo to this device.', ja: '写真をこの端末に保存しました。', zh: '照片已保存到本设备。', fr: 'Photo enregistrée sur cet appareil.', es: 'Foto guardada en este dispositivo.' },
  noPrint:    { ko: s => `이 화면에서는 인쇄 창을 열 수 없습니다. "${s}"을 눌러 프린트를 선택해 주세요.`, en: s => `Printing isn't available here. Tap "${s}" and choose Print.`,
                ja: s => `この画面では印刷できません。「${s}」を押して印刷を選んでください。`, zh: s => `此页面无法打开打印窗口。请点击“${s}”并选择打印。`,
                fr: s => `Impossible d'imprimer ici. Touchez « ${s} » puis choisissez Imprimer.`, es: s => `Aquí no se puede imprimir. Toca «${s}» y elige Imprimir.` },
  /* 프레임·색감 이름 */
  'frame.story':  { ko: '이야기', en: 'Story', ja: 'ストーリー', zh: '故事', fr: 'Histoire', es: 'Historia' },
  'frame.memory': { ko: '추억', en: 'Memory', ja: '思い出', zh: '回忆', fr: 'Souvenirs', es: 'Recuerdos' },
  'frame.doodle': { ko: '낙서', en: 'Doodle', ja: '落書き', zh: '涂鸦', fr: 'Gribouillis', es: 'Garabatos' },
  'frame.film':   { ko: '필름', en: 'Film', ja: 'フィルム', zh: '胶片', fr: 'Pellicule', es: 'Película' },
  'frame.stamp':  { ko: '우표', en: 'Stamp', ja: '切手', zh: '邮票', fr: 'Timbre', es: 'Sello' },
  'filter.none':  { ko: '그대로', en: 'Original', ja: 'そのまま', zh: '原色', fr: 'Original', es: 'Original' },
  'filter.bw':    { ko: '흑백', en: 'Mono', ja: 'モノクロ', zh: '黑白', fr: 'Noir et blanc', es: 'Blanco y negro' },
  'filter.warm':  { ko: '필름', en: 'Film', ja: 'フィルム', zh: '胶片', fr: 'Argentique', es: 'Analógico' }
};

export let lang = DEF_LANG;
/** 지금 언어의 문구. 함수로 된 문구는 args 를 넘긴다. 없으면 한국어 */
export function t(key, ...args) { const e = T[key] || {}, v = e[lang] ?? e.ko ?? key; return typeof v === 'function' ? v(...args) : v; }
/** 언어를 바꾸고 data-i18n 이 붙은 글자를 모두 다시 쓴다 */
export function setLang(l) {
  lang = LANGS[l] ? l : DEF_LANG; document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
}
