// Verify oblique camera invariants without browser/WebGL.
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../src/pixi21.js',import.meta.url),'utf8');
const code=source.replace(/^import .*?;\s*/m,'').replace('export class ColoniaPixi21','class ColoniaPixi21');
new Script(code,{filename:'pixi21-perspective.js'});
const PIVOT=430,TILT=.73,SHEAR=-.13;
const project=(x,y,h=0)=>({x:x+SHEAR*(y-PIVOT),y:PIVOT+(y-PIVOT)*TILT-h});
const top=project(600,100),bottom=project(600,800);
assert.ok(bottom.y>top.y,'south is visually closer than north');
assert.ok(bottom.x<top.x,'ground shear is visible');
assert.equal(project(600,430).y,430,'projection pivot stable');
assert.equal(project(600,430,16).y,414,'height raises the scene point');
for(const marker of ['setFromMatrix(terrainTransform())','function prismEdge(',
  'perspectiveScale(', 'entity.zIndex=pos.y', 'this.hitBuildings',
  'this.paintElevation()', 'if(wasTap)', 'this.openBuilding(item.item.id)'])
  assert.ok(source.includes(marker),'Missing projection feature: '+marker);
assert.ok(!source.includes('group.position.set(o.x,o.y)'),
  'Buildings must not use unprojected top-left coordinates');
console.log('Oblique PixiJS projection static checks passed');
