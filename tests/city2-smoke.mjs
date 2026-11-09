// Lightweight static smoke tests for the opt-in City 2.0 branch.
// Run with: node tests/city2-smoke.mjs
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../www/game.html', import.meta.url), 'utf8');
const body = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(body, 'inline game script exists');
new Script(body, { filename: 'game.js' });

const required = [
  'id="city2Switch"',
  'function city2Switch()',
  'function city2Draw()',
  'function city2PaintGround()',
  'function city2PaintScene()',
  'function city2Pick(',
  'function city2Actors()',
  'function city2SetZoom(',
  "if(city2Mode){city2Draw();return}",
  'function drawBuildingSprite(',
  'function updateBuildingTargets()',
  'function showBuilding(id)',
  'function save()',
  'function city2FromPointer('
];
for (const marker of required) assert.ok(html.includes(marker), `Missing: ${marker}`);
for (const id of ['forum','thermen','amphitheater','hafen','lager','tor',
                  'herberge','werkstatt','tempel','insula','wasser']) {
  assert.match(body, new RegExp("\\{id:'" + id + "'"), `City 2.0 missing ${id}`);
}
assert.ok(html.includes("if(city2Mode)return city2Pick(clientX,clientY)"),
  'City 2.0 touch selection must use own coordinates');
assert.ok(html.includes("if(editorMode)stopMapEditor()"),
  'Editor must not run with the experimental map');
console.log('Stadt 2.0 static smoke tests passed.');