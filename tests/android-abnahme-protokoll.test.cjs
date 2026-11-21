'use strict';
/* Abnahme-Begleiter: erzeugt aus Fuellhilfe ein vollstaendiges 9-Szenarien-Protokoll. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.join(__dirname,'..');
const script=path.join(root,'tools/android-abnahme-protokoll.sh');

assert.ok(fs.existsSync(script),'tools/android-abnahme-protokoll.sh existiert');
{
  const mode=fs.statSync(script);
  assert.ok(mode.mode & 0o111,'Skript ist ausfuehrbar');
}
{
  const out=execFileSync('sh',[script,'--rehearsiert'],{input:'\n'.repeat(120),encoding:'utf8',cwd:root});
  for(const id of ['A','B','C','D','E','F','G','H','I']){
    assert.match(out,new RegExp('^\\| '+id+' \\|','m'),'Szenario '+id+' mit protokollierter Zeile');
  }
  assert.match(out,/Katalog: docs\/android-4gb-abnahme-2026-11-20/,'Protokoll verweist auf den Abnahmekatalog');
  assert.match(out,/Median >= 50 fps/,'Bewertungsrahmen aus dem Katalog uebernommen');
  assert.match(out,/JS-Heap Start->End \(MiB\)/,'Heap-Verlauf lt. Katalog-Aufzeichnungstabelle');
  assert.match(out,/\| Urteil \|/,'Urteil-Spalte je Szenario');
}
console.log('Abnahme-Begleiter: Reha-Modus erzeugt vollstaendiges 9-Szenarien-Protokoll');
