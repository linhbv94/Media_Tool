// Regression exercises the real App/Player with native browser media playback.
// Only the desktop file/dialog bridge is replaced with local fixtures.
import assert from 'node:assert/strict';
import { createServer } from 'vite';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const bridge = '\0playback_test_bridge';
const wave = Buffer.alloc(44 + 8000 * 2 * 30);
wave.write('RIFF'); wave.writeUInt32LE(wave.length - 8, 4); wave.write('WAVEfmt ', 8);
wave.writeUInt32LE(16, 16); wave.writeUInt16LE(1, 20); wave.writeUInt16LE(1, 22);
wave.writeUInt32LE(8000, 24); wave.writeUInt32LE(16000, 28);
wave.writeUInt16LE(2, 32); wave.writeUInt16LE(16, 34); wave.write('data', 36);
wave.writeUInt32LE(wave.length - 44, 40);
const server = await createServer({ server: { host: '127.0.0.1', port: 1436, strictPort: true }, plugins: [{
  name: 'playback_regression_fixtures', enforce: 'pre',
  resolveId(id, importer) {
    if ((/\/services\/tauri(?:\.ts)?$/).test(id) || (id === './tauri' && importer?.includes('/services/'))) return bridge;
  },
  load(id) {
    if (id !== bridge) return;
    return `
      const image = (path) => ({path, name:path.split('/').pop(), media_type:'image', extension:'png', size_bytes:10});
      const audio = (path) => ({path, name:path.split('/').pop(), media_type:'audio', extension:'wav', size_bytes:10});
      const folders = {
        '/music': [audio('/music/one.wav'), image('/music/cover.png'), audio('/music/two.wav'), audio('/music/three.wav')],
        '/other': [audio('/other/other.wav')],
        '/images': [image('/images/first.png'), image('/images/second.png')],
      };
      export const getDirectoryMedia = async(path) => {
        const parent = path.substring(0, path.lastIndexOf('/'));
        const items = folders[parent];
        return {parent_dir:parent,items,total_count:items.length,current_index:items.findIndex(item=>item.path===path)};
      };
      export const getSafeMediaSrc = async(path) => {
        if(window.__delaySource === path) await new Promise(resolve=>window.__resolveSource=resolve);
        if (!path.endsWith('.png')) {const blob=await fetch('/fixture.wav').then(res=>res.blob());return URL.createObjectURL(blob)+'#'+encodeURIComponent(path);}
        return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="teal"/></svg>';
      };
      export const readAudioMetadata = async(path)=>({title:path.split('/').pop(),artist:'Playback fixture'});
      export const listenOpenMediaFile = async(callback)=>{window.__openMedia=callback;return ()=>{if(window.__openMedia===callback) delete window.__openMedia;};};
      export const listenMenuOpenEvents = async()=>()=>{};
      export const getInitialMediaFile = async()=>null;
      export const openFileDialog = async()=>null;
      export const openFolderDialog = async()=>null;
      export const isTauriEnvironment = ()=>false;
      export const setAlwaysOnTop = async(value)=>value;
      export const clipboardFiles = async()=>true;
      export const createMediaWindow = async()=>true;
      export const logFrontend = async()=>{};
      export const startDragging = async()=>{};
      export const setWindowDecorations = async()=>{};
      export const setTrafficLightsVisible = async()=>{};
      export const minimizeWindow = async()=>{};
      export const toggleMaximizeWindow = async()=>{};
      export const closeWindow = async()=>{};
      export const readFileBinary = async()=>new ArrayBuffer(0);
      export const printFile = async()=>true;
    `;
  },
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url.startsWith('/fixture.wav')) { res.setHeader('Content-Type','audio/wav'); res.end(wave); } else next();
    });
  },
}] });
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE_PATH,
    headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport:{width:900,height:600}, userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/145.0.0.0 Safari/537.36' });
  const errors=[]; page.on('pageerror',error=>{errors.push(error.message);console.error(error.message);});
  page.on('console',message=>{if(message.type()==='error') console.error(message.text());});
  await page.addInitScript(() => {
    localStorage.setItem('media_tool_settings', JSON.stringify({language:'vi', theme:'dark', hud_hide_delay_ms:0, seek_short_sec:1,seek_long_sec:5,ab_loop_crossfade_ms:45,default_loop_file:'all',volume:0.8}));
    Object.defineProperty(navigator,'platform',{value:'Win32'});
    const load=HTMLMediaElement.prototype.load;
    HTMLMediaElement.prototype.load=function(){this.__loads=(this.__loads||0)+1;return load.call(this);};
  });
  await page.goto('http://127.0.0.1:1436');
  await page.waitForFunction(()=>Boolean(window.__openMedia));
  const open = async(path) => {await page.evaluate(path=>window.__openMedia(path),path);};
  const playing = async(path)=>{try{await page.waitForFunction(path=>{const el=document.querySelector('audio');return el.dataset.currentPath===path && !el.paused && el.readyState>=4;},path,{timeout:10000});}catch(error){console.error(await page.locator('audio').evaluate(el=>({src:el.src,dataset:{...el.dataset},paused:el.paused,ready:el.readyState,error:el.error?.message,body:document.body.innerText.slice(0,500)})));throw error;}};
  const snapshot = ()=>page.locator('audio').evaluate(el=>({path:el.dataset.currentPath,src:el.src,time:el.currentTime,paused:el.paused,loads:el.__loads,origin:el.dataset.originSessionId}));
  await open('/music/one.wav'); await playing('/music/one.wav');
  await page.locator('audio').evaluate(el=>{el.currentTime=7;});
  const before=await snapshot();
  await open('/images/first.png');
  await page.waitForSelector('img[alt="first.png"]');
  await page.waitForTimeout(300);
  let after=await snapshot();
  assert.equal(after.loads,before.loads,'opening image tab must not reload audio');
  assert.equal(after.paused,false); assert.ok(after.time>=7,'background audio retains progress');
  await page.locator('[title="/music"]').click();
  after=await snapshot(); assert.equal(after.loads,before.loads); assert.ok(after.time>=7);
  // Keep A/B state while the music viewport is hidden.
  await page.keyboard.press('[');
  await page.locator('audio').evaluate(el=>{el.currentTime=10;el.dispatchEvent(new Event('timeupdate'));});
  await page.keyboard.press(']');
  await page.locator('[title="/images"]').click();
  await page.locator('audio').evaluate(el=>{el.currentTime=11;el.dispatchEvent(new Event('timeupdate'));});
  await page.waitForTimeout(150);
  assert.ok((await snapshot()).time<9,'A/B loop survives changing tabs');
  await page.locator('[title="/music"]').click(); await page.keyboard.press('Backslash');
  // Deferred URL conversion cannot label an old source with the new path.
  await page.evaluate(()=>window.__delaySource='/music/two.wav');
  await open('/music/two.wav'); await page.waitForFunction(()=>Boolean(window.__resolveSource));
  after=await snapshot(); assert.equal(after.path,'/music/one.wav'); assert.equal(after.loads,before.loads);
  await page.evaluate(()=>{window.__resolveSource();window.__delaySource=null;}); await playing('/music/two.wav');
  assert.ok((await snapshot()).src.includes('two.wav'));
  // Ended advances the music owner exactly once; it skips cover art and leaves image selection alone.
  await open('/music/one.wav'); await playing('/music/one.wav');
  await page.locator('[title="/images"]').click();
  await page.locator('audio').evaluate(el=>el.dispatchEvent(new Event('ended')));
  await playing('/music/two.wav');
  assert.equal(await page.locator('img[alt="first.png"]').count(),1);
  const sourceLoads=(await snapshot()).loads;
  await open('/other/other.wav'); await playing('/other/other.wav');
  await page.keyboard.press('Space'); assert.equal((await snapshot()).paused,true,'one keypress pauses once');
  await page.keyboard.press('Space'); await playing('/other/other.wav');
  await page.locator('[title="/images"]').click();
  await page.keyboard.press('Space'); assert.equal((await snapshot()).paused,true);
  await page.keyboard.press('Space'); await playing('/other/other.wav');
  await page.waitForTimeout(200); assert.equal((await snapshot()).loads,sourceLoads+1,'inactive music folders cannot replace the source');
  // Closing other tabs also clears their audio owner.
  await page.locator('[title="/images"]').click({button:'right'});
  await page.getByRole('button',{name:'Đóng các tab khác',exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('audio').hasAttribute('src'));
  assert.equal((await snapshot()).paused,true);
  // Single-track playlist restarts without loading another source.
  await open('/other/other.wav'); await playing('/other/other.wav');
  const singleLoads=(await snapshot()).loads;
  await page.locator('audio').evaluate(el=>{el.currentTime=20;el.dispatchEvent(new Event('ended'));});
  await page.waitForTimeout(150); after=await snapshot(); assert.ok(after.time<2); assert.equal(after.loads,singleLoads);
  await page.locator('[title="/other"]').getByTitle('Đóng tab',{exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('audio').hasAttribute('src'));
  assert.deepEqual(errors,[],'React/runtime must not throw');
  console.log('PASS: native browser audio: image tabs/return, A-B persistence, deferred source, ended owner/once, multiple music folders, Space pause/resume, close/close others, single-track loop');
} finally { await browser?.close(); await server.close(); }
