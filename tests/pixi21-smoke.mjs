// Statische Prüfung für den neuen PixiJS-Prototyp.
// Der eigentliche WebGL- und Touchtest erfolgt auf dem Android-Gerät.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const game=readFileSync(new URL('../www/game.html',import.meta.url),'utf8');
const engine=readFileSync(new URL('../src/pixi21.js',import.meta.url),'utf8');
const publisher=readFileSync(new URL('../scripts/publish_update.py',import.meta.url),'utf8');
const bundled=new URL('../www/pixi21.bundle.js',import.meta.url);
const js=game.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(js,'Spielskript vorhanden');
new Script(js,{filename:'game.html'});
for(const marker of [
 'id="pixi21Switch"','async function togglePixi21()',
 "el.src='pixi21.bundle.js'",
 "const assets={atlases:romanAtlas,monuments:buildingSprites,paving:cityArt.paving}",
 'if(pixi21)return;',
 'if(pixi21){pixi21.resize();return}',
 'if(pixi21)togglePixi21();'
])assert.ok(game.includes(marker),'Integration fehlt: '+marker);
for(const marker of [
 "from 'pixi.js'","export class ColoniaPixi21","preference:'webgl'",
 'this.app.ticker.add','this.app.destroy(true','window.ColoniaPixi21=ColoniaPixi21'
])assert.ok(engine.includes(marker),'Pixi-Code fehlt: '+marker);
assert.ok(publisher.includes('CX_PIXI21_BUNDLE'),'OTA-Bundle-Injektion fehlt');
const bundle=readFileSync(bundled,'utf8');
assert.ok(bundle.length>50000,'PixiJS-Bundle unvollständig');
new Script(bundle,{filename:'pixi21.bundle.js'});
console.log('COLONIA XANTEN PixiJS static checks bestanden, Bundle Bytes:',bundle.length);
