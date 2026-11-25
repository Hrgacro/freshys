// Ikone i uvodni zaslon za Android i iPhone: zelena podloga Freshy'sa (#2F5D3A) i rukom pisano F (#FBF7EF), kao ikona stranice.
// F je vektorski crtež (ikona-f.svg, iscrtan iz slova na stranici), pa je oštar u svakoj veličini.
// Pokretanje: `node aplikacija/ikone.cjs` (Playwright i Chromium su instalirani).
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const A = path.join(__dirname, 'android/app/src/main/res'), I = path.join(__dirname, 'ios/App/App/Assets.xcassets');
const GREEN = '#2F5D3A', CREAM = '#FBF7EF';
const F = fs.readFileSync(path.join(__dirname, 'ikona-f.svg'), 'utf8').replace('<svg ', '<svg fill="' + CREAM + '" ');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 2800, height: 2800 }, deviceScaleFactor: 1 });
  // w×h slika: podloga (boja ili prozirno), F visine k·min(w,h) u sredini, po želji krug
  async function shot(file, w, h, k, bg, round, ink) {
    const s = Math.round(Math.min(w, h) * k);
    await p.setContent('<body style="margin:0;background:transparent"><div id="x" style="width:' + w + 'px;height:' + h + 'px;display:grid;place-items:center;background:' + bg +
      (round ? ';border-radius:50%' : '') + '">' + (ink ? F.replace('fill="' + CREAM + '"', 'fill="' + ink + '"') : F).replace('<svg ', '<svg style="height:' + s + 'px;width:auto;display:block" ') + '</div>');
    // viewBox točno oko slova, da je F u sredini i zadane visine
    await p.evaluate(() => { const sv = document.querySelector('#x svg'), bb = sv.querySelector('path').getBBox(); sv.setAttribute('viewBox', [bb.x, bb.y, bb.width, bb.height].join(' ')); });
    fs.mkdirSync(path.dirname(file), { recursive: true });
    await p.locator('#x').screenshot({ path: file, omitBackground: true });
  }
  const dpi = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [d, k] of Object.entries(dpi)) {
    await shot(path.join(A, 'mipmap-' + d, 'ic_launcher.png'), 48 * k, 48 * k, 0.46, GREEN);
    await shot(path.join(A, 'mipmap-' + d, 'ic_launcher_round.png'), 48 * k, 48 * k, 0.46, GREEN, true);
    await shot(path.join(A, 'mipmap-' + d, 'ic_launcher_foreground.png'), 108 * k, 108 * k, 0.3, 'transparent');
  }
  // mala ikona obavijesti (Android traži bijeli oblik na prozirnom, 24 dp); bez nje Android pokaže opću ikonu
  for (const [d, k] of Object.entries(dpi)) await shot(path.join(A, 'drawable-' + d, 'ic_stat_freshys.png'), 24 * k, 24 * k, 0.8, 'transparent', false, '#FFFFFF');
  const sp = { 'drawable': [480, 320], 'drawable-land-mdpi': [480, 320], 'drawable-land-hdpi': [800, 480], 'drawable-land-xhdpi': [1280, 720], 'drawable-land-xxhdpi': [1600, 960], 'drawable-land-xxxhdpi': [1920, 1280],
    'drawable-port-mdpi': [320, 480], 'drawable-port-hdpi': [480, 800], 'drawable-port-xhdpi': [720, 1280], 'drawable-port-xxhdpi': [960, 1600], 'drawable-port-xxxhdpi': [1280, 1920] };
  for (const [d, [w, h]] of Object.entries(sp)) await shot(path.join(A, d, 'splash.png'), w, h, 0.28, GREEN);
  await shot(path.join(I, 'AppIcon.appiconset/AppIcon-512@2x.png'), 1024, 1024, 0.46, GREEN);
  for (const n of ['', '-1', '-2']) await shot(path.join(I, 'Splash.imageset/splash-2732x2732' + n + '.png'), 2732, 2732, 0.12, GREEN);
  fs.mkdirSync(path.join(__dirname, 'trgovine'), { recursive: true });
  await shot(path.join(__dirname, 'trgovine/ikona-512.png'), 512, 512, 0.46, GREEN);
  await b.close();
})();
