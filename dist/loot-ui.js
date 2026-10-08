/* Touch-first inventory presentation. Every write is guarded by the model too. */
(() => {
  'use strict';
  const L=globalThis.DenkmalLoot;
  const glyph={weapon:'╱',head:'♜',armor:'⬟',gloves:'✥',boots:'♟',amulet:'◈',ring1:'◉',ring2:'◉'};
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const fmt=(key,value)=>L.statInfo[key].percent?`${Math.round(value*1000)/10} %`:`${Math.round(value*10)/10}`;
  function create(model,{editable,onClose,onImport}){
    let selected=null,filter='all',sort='rarity',pending=null,notice='',generation=0,ringTarget='ring1';
    const $=id=>document.getElementById(id),root=$('inventoryScreen');
    const can=()=>editable()&&!model.readOnly;
    function button(text,fn,disabled=false,cls='loot-action'){const b=el('button',cls,text);b.type='button';b.disabled=disabled;b.onclick=fn;return b;}
    function act(fn){if(fn()){notice='Gespeichert.';}else notice='Aktion nicht möglich. Prüfe den Speicherstatus und die Ausrüstung.';render();}
    function choose(id){selected=id;pending=null;render();if(matchMedia('(max-width: 760px)').matches)$('lootDetail').scrollIntoView({block:'nearest',behavior:'auto'});}
    function card(item,equipped=false,slot){
      const b=button('',()=>{ringTarget=slot||item.slot;choose(item.id);},false,'loot-item'+(selected===item.id?' selected':'')+(equipped?' worn':''));
      b.dataset.itemId=item.id;b.style.setProperty('--rarity',L.rarities[item.rarity].color);b.setAttribute('aria-pressed',String(selected===item.id));
      b.setAttribute('aria-label',`${item.name}, ${L.rarities[item.rarity].label}, ${L.slots[slot||item.slot]}, Stufe ${item.level}${item.favorite?', Favorit':''}${equipped?', angelegt':''}`);
      b.append(el('span','loot-glyph',glyph[item.slot]),el('strong','',item.name),el('small','',equipped?L.slots[slot]:`ST. ${item.level} · ${L.rarities[item.rarity].label}`));
      if(item.favorite)b.append(el('span','loot-star','★'));return b;
    }
    function render(){
      const previousFocus=document.activeElement,hadFocus=root.contains(previousFocus),focusId=previousFocus?.id,focusItem=previousFocus?.dataset?.itemId,focusLabel=previousFocus?.textContent;
      const p=model.profile,all=[...p.items,...p.bag,...p.overflow],item=all.find(i=>i.id===selected);
      $('inventoryMode').textContent=editable()?'RÜSTKAMMER · BEREIT FÜR DIE NÄCHSTE WACHT':'BEUTE GESICHERT · AUSRÜSTUNG IM HAUPTMENÜ WECHSELN';
      $('inventoryClose').textContent=editable()?'ZURÜCK ZUM HAUPTMENÜ':'ZURÜCK ZUR WACHT';
      $('lootSaveState').textContent=model.status||'Automatisch gespeichert · auf diesem Gerät';$('lootSaveState').classList.toggle('warning',!!model.status);
      $('lootNotice').textContent=notice;$('forgeEssence').textContent=`${p.essence} SCHMIEDESSENZ`;
      const equipment=$('loadoutSlots');equipment.replaceChildren();
      for(const slot of Object.keys(L.slots)){const i=p.items.find(i=>i.id===p.equipped[slot]);if(i)equipment.append(card(i,true,slot));else{const empty=el('div','loot-empty-slot');empty.append(el('span','loot-glyph',glyph[slot]),el('span','',L.slots[slot]));equipment.append(empty);}}
      const stats=L.totals(p.items),summary=$('loadoutStats');summary.replaceChildren();
      for(const [k,v] of Object.entries(stats)){if(k==='powers'||!v)continue;summary.append(el('span','',`+${fmt(k,v)} ${L.statInfo[k].label}`));}
      for(const power of Object.keys(stats.powers))summary.append(el('span','loot-power-summary',L.powers[power].desc));
      $('backpackCount').textContent=`RUCKSACK ${p.bag.length} / 30`;
      const grid=$('inventoryGrid');grid.replaceChildren();
      const visible=p.bag.filter(i=>filter==='all'||i.rarity===filter||filter==='favorites'&&i.favorite).sort((a,b)=>sort==='level'?b.level-a.level:sort==='type'?a.slot.localeCompare(b.slot):L.rarities[b.rarity].rank-L.rarities[a.rarity].rank||b.level-a.level);
      for(const i of visible)grid.append(card(i));
      for(let n=visible.length;n<30;n++){const cell=el('div','loot-cell-empty');cell.setAttribute('aria-hidden','true');grid.append(cell);}
      $('lootEmptyHint').textContent=p.bag.length?(visible.length?'':'Keine Gegenstände für diesen Filter.'):'Deine Sammlung beginnt hier. Nach jeder Welle erhältst du Beute; Bosse lassen mindestens epische Ausrüstung fallen.';
      const overflow=$('lootOverflow');overflow.replaceChildren();overflow.hidden=!p.overflow.length;
      if(p.overflow.length){overflow.append(el('h3','',`ÜBERLAUF · ${p.overflow.length} GESICHERT`),el('p','','Kein Fund geht verloren. Freie Rucksackplätze werden automatisch aufgefüllt.'));const list=el('div','loot-overflow-grid');for(const i of p.overflow.slice(0,60))list.append(card(i));overflow.append(list);if(p.overflow.length>60)overflow.append(el('p','','Die nächsten Funde erscheinen, sobald Plätze frei werden.'))}
      const detail=$('lootDetail');detail.replaceChildren();
      if(item)renderDetail(detail,item,p);else detail.append(el('p','eyebrow','GEGENSTANDSDETAILS'),el('div','loot-detail-empty','◈'),el('h3','','Wähle einen Fund'),el('p','','Vergleiche seine Werte mit deiner Ausrüstung. Neue Beute wirkt erst, wenn du sie im Hauptmenü anlegst.'));
      $('lootImportBtn').disabled=!editable();$('lootRecoveryBtn').hidden=!model.readOnly;
      const confirmation=$('lootConfirm');confirmation.replaceChildren();confirmation.hidden=!pending;
      if(pending){confirmation.append(el('p','',pending.message),button('BESTÄTIGEN',()=>{const f=pending.run;pending=null;act(f);},!editable()),button('ABBRECHEN',()=>{pending=null;render();}));}
      if(hadFocus&&!root.contains(previousFocus)){
        const controls=[...root.querySelectorAll('button,select,input')].filter(n=>!n.disabled&&!n.hidden&&n.getClientRects().length);
        const next=controls.find(n=>focusId&&n.id===focusId)||controls.find(n=>focusItem&&n.dataset.itemId===focusItem)||controls.find(n=>focusLabel&&n.textContent===focusLabel)||controls.find(n=>n.dataset.itemId===selected)||$('inventoryClose');
        next.focus({preventScroll:true});
      }
    }
    function renderDetail(detail,i,p){
      const worn=Object.values(p.equipped).includes(i.id),slot=i.slot.startsWith('ring')?ringTarget:i.slot;
      const old=p.items.find(x=>x.id===p.equipped[slot]);detail.style.setProperty('--rarity',L.rarities[i.rarity].color);
      detail.append(el('p','loot-rarity',`${L.rarities[i.rarity].label} · ${L.slots[i.slot]} · STUFE ${i.level}`),el('span','loot-detail-glyph',glyph[i.slot]),el('h3','loot-item-title',i.name));
      if(worn)detail.append(el('p','loot-tag','ANGELEGT'));
      if(i.slot.startsWith('ring')&&!worn){const group=el('div','loot-ring-choice');for(const target of ['ring1','ring2']){const b=button(L.slots[target],()=>{ringTarget=target;render();},false);b.setAttribute('aria-pressed',String(slot===target));group.append(b);}detail.append(group);}
      const lines=el('dl','loot-stat-list');for(const k of Object.keys(L.statInfo)){const value=i.stats[k]||0,previous=old?.stats[k]||0;if(!value&&!previous)continue;const row=el('div','');row.append(el('dt','',L.statInfo[k].label),el('dd','',fmt(k,value)));if(!worn){const diff=Math.round((value-previous)*1000)/1000;row.append(el('span',diff>0?'positive':diff<0?'negative':'neutral',`${diff>0?'+':''}${fmt(k,diff)}`));}lines.append(row);}detail.append(lines);
      if(i.power)detail.append(el('p','loot-special',`${L.powers[i.power].name}: ${L.powers[i.power].desc}`));
      if(!worn&&old){detail.append(el('p','loot-compare',`Vergleich mit ${old.name}`));if(old.power&&old.power!==i.power)detail.append(el('p','negative',`Entfällt: ${L.powers[old.power].desc}`));}
      const actions=el('div','loot-detail-actions');
      actions.append(button(worn?'ABLEGEN':'ANLEGEN',()=>act(()=>worn?model.unequip(Object.keys(p.equipped).find(k=>p.equipped[k]===i.id)):model.equip(i.id,slot)),!can(),'loot-action loot-primary'));
      actions.append(button(i.favorite?'★ FAVORIT ENTFERNEN':'☆ ALS FAVORIT SCHÜTZEN',()=>act(()=>model.favorite(i.id)),!can()));
      const locked=!can()||worn||i.favorite;
      actions.append(button(`ZERLEGEN · +${model.salvageValue(i)} ESSENZ`,()=>{pending={message:`${i.name} unwiderruflich für ${model.salvageValue(i)} Schmiedessenz zerlegen?`,run:()=>model.salvage(i.id)};render();$('lootConfirm').scrollIntoView({block:'nearest'});},locked));
      actions.append(button('NEU SCHMIEDEN · 50 ESSENZ',()=>{pending={message:'Werte neu würfeln? Sie können besser oder schlechter werden. Seltenheit und Spezialeffekt bleiben erhalten.',run:()=>model.reforge(i.id)};render();$('lootConfirm').scrollIntoView({block:'nearest'});},locked||p.essence<50));
      detail.append(actions,el('p','loot-note',!editable()?'Während der Wacht bleibt deine Ausrüstung fest. Wechsle im Hauptmenü.':i.favorite?'Favoriten sind vor Zerlegen und Neuschmieden geschützt.':'Schmiedessenz bleibt dauerhaft. Sie ist getrennt von der Turmbau-Essenz im Kampf.'));
    }
    function download(text,name){const blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a','');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
    $('lootFilter').onchange=e=>{filter=e.target.value;render();};$('lootSort').onchange=e=>{sort=e.target.value;render();};
    $('lootExportBtn').onclick=()=>download(model.exportJSON(),'Denkmal-TD-Spielstand.json');
    $('lootRecoveryBtn').onclick=()=>download(model.exportRecovery(),'Denkmal-TD-Rohsicherung.json');
    $('lootImportBtn').onclick=()=>{if(editable())$('lootImportFile').click();};
    $('lootImportFile').onchange=async e=>{const file=e.target.files?.[0],token=generation;e.target.value='';if(!file||!editable())return;try{if(file.size>15000000)throw Error('Datei ist zu groß.');const text=await file.text();if(token!==generation||!editable())return;const p=model.validateImport(text);pending={message:`Sicherung mit ${p.items.length+p.bag.length+p.overflow.length} Gegenständen übernehmen? Sie ersetzt deine aktuelle Sammlung. Exportiere diese bei Bedarf zuerst.`,run:()=>{const ok=model.importJSON(text);if(ok)onImport();return ok;}};notice='';}catch{notice='Import abgelehnt: beschädigte Datei oder falsches Spielstandformat.';}render();$('lootConfirm').scrollIntoView({block:'nearest'});};
    $('inventoryClose').onclick=onClose;
    return {render,close(){generation++;pending=null;notice='';}};
  }
  globalThis.DenkmalLootUI={create};
})();
