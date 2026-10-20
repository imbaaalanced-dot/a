/* Touch-first inventory presentation. Every write is guarded by the model too. */
(() => {
  'use strict';
  const L=globalThis.DenkmalLoot;
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  function icon(slot,large=false,power){const n=el('span','loot-icon'+(large?' loot-icon-large':''));n.dataset.slot=slot;if(['bark','roots','splinter','wardlight','grove'].includes(power)){n.dataset.power=power;n.style.backgroundImage=`url(assets/kirchende/item-${power}.webp?v=v400a1)`;n.style.backgroundSize='contain';n.style.backgroundRepeat='no-repeat';n.style.backgroundPosition='center';}n.setAttribute('aria-hidden','true');return n;}
  const fmt=(key,value)=>L.statInfo[key].percent?`${Math.round(value*1000)/10} %`:`${Math.round(value*10)/10}`;
  function create(model,{editable,onClose,onImport,getHero=()=>'marcel'}){
    let selected=null,filter='all',sort='rarity',pending=null,notice='',generation=0,ringTarget='ring1',activeTab='bag',lastHero=null,visibleLimit=60;
    const $=id=>document.getElementById(id),root=$('inventoryScreen');
    const can=()=>editable()&&!model.readOnly;
    function button(text,fn,disabled=false,cls='loot-action'){const b=el('button',cls,text);b.type='button';b.disabled=disabled;b.onclick=fn;return b;}
    function act(fn){if(fn()){notice=model.status||'Gespeichert.';}else notice='Aktion nicht möglich. Prüfe den Speicherstatus und die Ausrüstung.';render();}
    function choose(id){selected=id;pending=null;render();if(isMobile())$('lootDetailClose').focus({preventScroll:true});}
    const isMobile=()=>matchMedia('(max-width: 760px)').matches;
    function syncPanels(){
      const mobile=isMobile(),detailOpen=!!selected;
      root.dataset.tab=activeTab;root.dataset.detailOpen=String(detailOpen);
      $('lootEquipmentPanel').hidden=mobile&&activeTab!=='equipment';
      $('lootBagPanel').hidden=mobile&&activeTab!=='bag';
      $('lootEquipmentTab').setAttribute('aria-selected',String(activeTab==='equipment'));
      $('lootBagTab').setAttribute('aria-selected',String(activeTab==='bag'));
      $('lootEquipmentTab').tabIndex=activeTab==='equipment'?0:-1;
      $('lootBagTab').tabIndex=activeTab==='bag'?0:-1;
      $('lootDetailBackdrop').hidden=!mobile||!detailOpen;
      for(const id of ['lootEquipmentPanel','lootBagPanel','lootEquipmentTab','lootBagTab','inventoryClose','lootExportBtn','lootImportBtn','lootRecoveryBtn','lootPreMigrationBtn'])$(id).inert=mobile&&detailOpen;
    }
    function closeDetail(){
      if(!selected)return false;
      const previous=selected;selected=null;pending=null;render();
      const card=[...root.querySelectorAll('button')].find(n=>n.dataset.itemId===previous&&n.getClientRects().length);
      (card||$(activeTab==='equipment'?'lootEquipmentTab':'lootBagTab')).focus({preventScroll:true});
      return true;
    }
    function showTab(tab){activeTab=tab;closeDetail();syncPanels();}
    $('lootEquipmentTab').onclick=()=>showTab('equipment');$('lootBagTab').onclick=()=>showTab('bag');
    for(const id of ['lootEquipmentTab','lootBagTab'])$(id).onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tab=e.key==='Home'?'equipment':e.key==='End'?'bag':activeTab==='bag'?'equipment':'bag';showTab(tab);$(tab==='bag'?'lootBagTab':'lootEquipmentTab').focus();}};
    $('lootDetailBackdrop').onclick=closeDetail;
    globalThis.addEventListener?.('resize',syncPanels);
    function activePowers(items){
      const powers={...L.totals(items).powers};
      for(const [winner,loser]of [['echo','ember'],['ash','oath'],['bell','lantern']])if(powers[winner])delete powers[loser];
      return powers;
    }
    function lostPowers(item,slot,view){
      const oldId=view.equipped[slot],before=activePowers(view.items),after=activePowers([...view.items.filter(i=>i.id!==oldId&&i.id!==item.id),item]);
      return Object.keys(before).filter(power=>!after[power]);
    }
    // A new power may suppress an effect in another slot, even if this slot is empty.
    function isStrictUpgrade(item,targetSlot){
      const slot=targetSlot||item.slot;
      const view=model.view(getHero()),worn=view.items.find(x=>x.id===view.equipped[slot]);
      if(view.items.some(i=>i.id===item.id)||lostPowers(item,slot,view).length)return false;
      if(!worn)return Object.values(item.stats).some(v=>Number(v)>0)||!!item.power;
      if(item.id===worn.id)return false;
      if(worn.power&&worn.power!==item.power)return false;
      const keys=Object.keys(L.statInfo);
      return keys.every(k=>(Number(item.stats[k])||0)>=(Number(worn.stats[k])||0)) &&
        (keys.some(k=>(Number(item.stats[k])||0)>(Number(worn.stats[k])||0))|| (!!item.power&&!worn.power));
    }
    function card(item,equipped=false,slot){
      const b=button('',()=>{ringTarget=slot||item.slot;choose(item.id);},false,'loot-item'+(selected===item.id?' selected':'')+(equipped?' worn':''));
      b.dataset.itemId=item.id;b.style.setProperty('--rarity',L.rarities[item.rarity].color);b.setAttribute('aria-pressed',String(selected===item.id));
      b.setAttribute('aria-label',`${item.name}, ${L.rarities[item.rarity].label}, ${L.slots[slot||item.slot]}, Stufe ${item.level}${item.favorite?', Favorit':''}${equipped?', angelegt':''}`);
      b.append(icon(slot||item.slot,false,item.power),el('strong','',item.name),el('small','',equipped?L.slots[slot]:`ST. ${item.level} · ${L.rarities[item.rarity].label}`));
      const target=slot||(selected===item.id&&item.slot.startsWith('ring')?ringTarget:item.slot);
      if(!equipped&&isStrictUpgrade(item,target)){const up=el('span','loot-upgrade','↑');up.setAttribute('aria-label','Garantierte Verbesserung gegenüber angelegter Ausrüstung');up.title='Bessere Werte ohne Nachteile gegenüber der angelegten Ausrüstung';b.append(up);}
      const users=Object.entries(model.profile.loadouts).filter(([,slots])=>Object.values(slots).includes(item.id)).map(([hero])=>hero==='kim'?'Kim':'Marcel');if(users.length)b.append(el('small','loot-used-by','Angelegt bei '+users.join(' und ')));
      if(item.favorite)b.append(el('span','loot-star','★'));return b;
    }
    function render(){
      const previousFocus=document.activeElement,hadFocus=root.contains(previousFocus),focusId=previousFocus?.id,focusItem=previousFocus?.dataset?.itemId,focusLabel=previousFocus?.textContent;
      if(lastHero!==getHero()){lastHero=getHero();generation++;selected=null;pending=null;}
      if(pending&&pending.revision&&pending.revision!==model.exportJSON())pending=null;
      const kim=getHero()==='kim';
      $('lootHeroTitle').textContent=(kim?'KIM':'MARCEL')+' · DEINE AUSRÜSTUNG';
      $('lootHeroRole').textContent=kim?'DIE BEWAHRERIN':'DER BESCHÜTZER';
      $('lootHeroPortrait').src=kim?'assets/hero/kim-inventory-portrait-v1.webp':'assets/hero/marcel-portrait-alpha9.webp?v=alpha9a1';
      $('lootHeroPortrait').alt=kim?'Kim die Bewahrerin':'Marcel der Beschützer';
      const p={...model.profile,...model.view(getHero())},all=p.all,item=all.find(i=>i.id===selected);
      if(selected&&!item)selected=null;
      $('inventoryMode').textContent=editable()?'RÜSTKAMMER · BEREIT FÜR DIE NÄCHSTE WACHT':'BEUTE GESICHERT · AUSRÜSTUNG IM HAUPTMENÜ WECHSELN';
      $('inventoryClose').textContent=editable()?'ZURÜCK':'ZUR WACHT';
      $('lootSaveState').textContent=model.status||'Automatisch gespeichert · auf diesem Gerät';$('lootSaveState').classList.toggle('warning',!!model.status);
      $('lootNotice').textContent=notice;$('forgeEssence').textContent=`${p.essence} SCHMIEDESSENZ`;
      const equipment=$('loadoutSlots');equipment.replaceChildren();
      for(const slot of Object.keys(L.slots)){const i=p.items.find(i=>i.id===p.equipped[slot]);if(i)equipment.append(card(i,true,slot));else{const empty=el('div','loot-empty-slot');empty.append(icon(slot),el('span','',L.slots[slot]));equipment.append(empty);}}
      const stats=L.totals(p.items),summary=$('loadoutStats');summary.replaceChildren();
      for(const [k,v] of Object.entries(stats)){if(k==='powers'||!v)continue;summary.append(el('span','',`+${fmt(k,v)} ${L.statInfo[k].label}`));}
      for(const power of Object.keys(stats.powers))summary.append(el('span','loot-power-summary',L.powers[power].desc));
      $('backpackCount').textContent=`SAMMLUNG ${all.length} · RUCKSACK ${p.bag.length} / 30`;
      for(const [winner,loser,label]of [['echo','ember','Nachhall hat Vorrang vor Abendrot.'],['ash','oath','Aschenläufer hat Vorrang vor Steinwacht.'],['bell','lantern','Letzte Glocke hat Vorrang vor Erinnerungslicht.']])if(stats.powers[winner]&&stats.powers[loser])summary.append(el('span','loot-note',label));
      const bulk=model.salvagePreview(),bulkBtn=$('lootSalvageAllBtn');
      bulkBtn.disabled=!can()||bulk.count===0;
      bulkBtn.textContent=`ALLES RECYCELN · ${bulk.count} · +${bulk.essence} ESSENZ`;
      const grid=$('inventoryGrid');grid.replaceChildren();
      const visible=all.filter(i=>filter==='all'||i.rarity===filter||filter==='favorites'&&i.favorite).sort((a,b)=>sort==='level'?b.level-a.level:sort==='type'?a.slot.localeCompare(b.slot):L.rarities[b.rarity].rank-L.rarities[a.rarity].rank||b.level-a.level);
      for(const i of visible.slice(0,visibleLimit))grid.append(card(i));
      if(visible.length>visibleLimit)grid.append(button('WEITERE GEGENSTÄNDE',()=>{visibleLimit+=60;render();}));
      for(let n=visible.length;n<30;n++){const cell=el('div','loot-cell-empty');cell.setAttribute('aria-hidden','true');grid.append(cell);}
      $('lootEmptyHint').textContent=visible.length?'':all.length?'Keine Gegenstände für diesen Filter.':'Besiege Bosse, um neue Ausrüstung zu finden.';
      const overflow=$('lootOverflow');overflow.replaceChildren();overflow.hidden=!p.overflow.length;
      if(p.overflow.length){overflow.append(el('h3','',`ÜBERLAUF · ${p.overflow.length} GESICHERT`),el('p','','Kein Fund geht verloren. Freie Rucksackplätze werden automatisch aufgefüllt.'));const list=el('div','loot-overflow-grid');for(const i of p.overflow.slice(0,60))list.append(card(i));overflow.append(list);if(p.overflow.length>60)overflow.append(el('p','','Die nächsten Funde erscheinen, sobald Plätze frei werden.'))}
      const detail=$('lootDetail');detail.replaceChildren();
      if(item)renderDetail(detail,item,p);else detail.append(el('p','eyebrow','GEGENSTANDSDETAILS'),el('div','loot-detail-empty','◈'),el('h3','','Wähle einen Fund'),el('p','','Vergleiche seine Werte mit deiner Ausrüstung. Neue Beute wirkt erst, wenn du sie im Hauptmenü anlegst.'));
      syncPanels();
      $('lootImportBtn').disabled=!editable();$('lootRecoveryBtn').hidden=!model.recoveryAvailable;$('lootPreMigrationBtn').hidden=!model.exportPreMigration();
      const confirmation=$('lootConfirm');confirmation.replaceChildren();confirmation.hidden=!pending;
      if(pending){if(!pending.revision){pending.revision=model.exportJSON();pending.hero=getHero();}confirmation.append(el('p','',pending.message),button('BESTÄTIGEN',()=>{if(!pending||pending.hero!==getHero()||pending.revision!==model.exportJSON()){pending=null;notice='Auswahl geändert. Bitte erneut prüfen.';render();return;}const f=pending.run;pending=null;act(f);},!editable()),button('ABBRECHEN',()=>{pending=null;render();}));}
      if(hadFocus&&!root.contains(previousFocus)){
        const controls=[...root.querySelectorAll('button,select,input')].filter(n=>!n.disabled&&!n.hidden&&!n.closest?.('[inert]')&&n.getClientRects().length);
        const next=controls.find(n=>focusId&&n.id===focusId)||controls.find(n=>focusItem&&n.dataset.itemId===focusItem)||controls.find(n=>focusLabel&&n.textContent===focusLabel)||controls.find(n=>n.dataset.itemId===selected)||$('inventoryClose');
        next.focus({preventScroll:true});
      }
    }
    function renderDetail(detail,i,p){
      const worn=Object.values(p.equipped).includes(i.id),slot=worn?Object.keys(p.equipped).find(k=>p.equipped[k]===i.id):i.slot.startsWith('ring')?ringTarget:i.slot;
      const usedBy=Object.entries(p.loadouts).filter(([,slots])=>Object.values(slots).includes(i.id)).map(([hero])=>hero==='kim'?'Kim':'Marcel');
      const old=p.items.find(x=>x.id===p.equipped[slot]);detail.style.setProperty('--rarity',L.rarities[i.rarity].color);
      const header=el('header','loot-detail-header');header.append(el('p','eyebrow','GEGENSTAND VERGLEICHEN'));
      const close=button('SCHLIESSEN',closeDetail,false,'loot-action loot-detail-close');close.id='lootDetailClose';header.append(close);detail.append(header);
      detail.append(el('p','loot-rarity',`${L.rarities[i.rarity].label} · ${L.slots[slot]} · STUFE ${i.level}`));
      const comparison=el('div','loot-comparison');
      for(const [label,item] of [['Angelegt',old],['Auswahl',i]]){
        const panel=el('section','loot-compare-card');panel.append(el('p','loot-compare-label',label));
        if(item){panel.style.setProperty('--rarity',L.rarities[item.rarity].color);panel.append(icon(item.slot,true,item.power),el('h3','loot-item-title',item.name),el('small','',L.rarities[item.rarity].label+' · Stufe '+item.level));}
        else panel.append(icon(slot,true),el('h3','', 'Freier Platz'));
        comparison.append(panel);
      }
      detail.append(comparison);
      detail.append(el('p','loot-origin',i.source?`Bossbeute · Karte ${i.source.mapId} · Welle ${i.source.wave}`:'Vorhandene Ausrüstung'),el('p','loot-rank',`Schmiedestufe ${i.upgradeRank} / 3`));
      if(usedBy.length)detail.append(el('p','loot-used-by','Angelegt bei '+usedBy.join(' und ')));
      if(worn)detail.append(el('p','loot-tag','ANGELEGT'));
      if(i.slot.startsWith('ring')&&!worn){const group=el('div','loot-ring-choice');for(const target of ['ring1','ring2']){const b=button(L.slots[target],()=>{ringTarget=target;render();},false);b.setAttribute('aria-pressed',String(slot===target));group.append(b);}detail.append(group);}
      const table=el('table','loot-comparison-table');table.append(el('caption','', 'Werte im Vergleich'));
      const head=el('thead',''),labels=el('tr','');for(const text of ['Wert','Angelegt','Auswahl','Änderung']){const th=el('th','',text);th.setAttribute('scope','col');labels.append(th);}head.append(labels);table.append(head);
      const body=el('tbody','');
      for(const k of Object.keys(L.statInfo)){
        const value=i.stats[k]||0,previous=old?.stats[k]||0;if(!value&&!previous)continue;
        const diff=Math.round((value-previous)*1000)/1000,row=el('tr',''),label=el('th','',L.statInfo[k].label);label.setAttribute('scope','row');
        row.append(label,el('td','',fmt(k,previous)),el('td','',fmt(k,value)),el('td',diff>0?'positive':diff<0?'negative':'neutral',`${diff>0?'↑ +':diff<0?'↓ ':''}${fmt(k,diff)}`));body.append(row);
      }
      table.append(body);detail.append(table);
      if(i.power)detail.append(el('p','loot-special',`${L.powers[i.power].name}: ${L.powers[i.power].desc}`));
      if(!worn&&old?.power&&old.power!==i.power)detail.append(el('p','negative',`Entfällt: ${L.powers[old.power].desc}`));
      if(!worn)for(const power of lostPowers(i,slot,p))if(power!==old?.power)detail.append(el('p','negative',`Entfällt durch Vorrang: ${L.powers[power].name} · ${L.powers[power].desc}`));
      const actions=el('div','loot-detail-actions'),core=el('div','loot-core-actions');
      core.append(button(worn?'ABLEGEN':'ANLEGEN',()=>act(()=>worn?model.unequip(Object.keys(p.equipped).find(k=>p.equipped[k]===i.id),getHero()):model.equip(i.id,slot,getHero())),!can(),'loot-action loot-primary'));
      core.append(button(i.favorite?'★ FAVORIT ENTFERNEN':'☆ FAVORISIEREN',()=>act(()=>model.favorite(i.id)),!can()));
      const locked=!can()||usedBy.length>0||i.favorite;
      core.append(button(`RECYCELN · +${model.salvageValue(i)}`,()=>{pending={message:`${i.name} unwiderruflich für ${model.salvageValue(i)} Schmiedessenz recyceln?`,run:()=>model.salvage(i.id)};render();$('lootConfirm').scrollIntoView({block:'nearest'});},locked));
      ['lootEquipAction','lootFavoriteAction','lootRecycleAction'].forEach((id,index)=>core.children[index].id=id);
      actions.append(core);detail.append(actions);
      const preview=model.upgradePreview(i.id),forge=el('details','loot-forge');
      const improve=button(`VERBESSERN · ${preview.cost} ESSENZ`,()=>{pending={message:`${i.name} auf Schmiedestufe ${preview.nextRank} für ${preview.cost} Essenz verbessern?`,run:()=>model.upgrade(i.id)};render();$('lootConfirm').scrollIntoView({block:'nearest'});},locked||!preview.allowed);improve.id='lootUpgradeAction';
      forge.append(el('summary','','Gezielt verbessern'),el('p','',preview.reason||`Nächste Schmiedestufe: ${preview.nextRank} / 3`));
      for(const key of Object.keys(i.stats))forge.append(el('p','loot-forge-value',`${L.statInfo[key].label}: ${fmt(key,i.stats[key])} → ${fmt(key,preview.stats[key])}`));
      forge.append(improve);detail.append(forge,el('p','loot-note',!editable()?'Während der Wacht bleibt deine Ausrüstung fest. Wechsle im Hauptmenü.':usedBy.length?'Zum Verbessern oder Recyceln bei beiden Helden ablegen.':i.favorite?'Favoriten sind vor Recycling und Verbessern geschützt.':'Schmiedessenz bleibt dauerhaft und ist getrennt von der Kampfessenz.'));
    }
    function download(text,name){if(!text)return;const blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a','');if(blob.size>15000000){notice='Export überschreitet die Importgrenze von 15 MB. Vor erneutem Import Sammlung verkleinern.';render();}a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
    $('lootFilter').onchange=e=>{filter=e.target.value;visibleLimit=60;render();};$('lootSort').onchange=e=>{sort=e.target.value;render();};
    $('lootSalvageAllBtn').onclick=()=>{
      if(!can())return;
      const preview=model.salvagePreview();if(!preview.count)return;
      pending={message:`${preview.count} nicht favorisierte Gegenstände aus Rucksack und Überlauf unwiderruflich für insgesamt ${preview.essence} Schmiedessenz recyceln? Angelegte Gegenstände und Favoriten bleiben erhalten.`,run:()=>model.salvageAll()};
      render();$('lootConfirm').scrollIntoView({block:'nearest'});
    };
    $('lootExportBtn').onclick=()=>download(model.exportJSON(),'Denkmal-TD-Spielstand.json');
    $('lootPreMigrationBtn').onclick=()=>download(model.exportPreMigration(),'Denkmal-TD-vor-Ausrustungswechsel.json');
    $('lootRecoveryBtn').onclick=()=>download(model.exportRecovery(),'Denkmal-TD-Rohsicherung.json');
    $('lootImportBtn').onclick=()=>{if(editable())$('lootImportFile').click();};
    $('lootImportFile').onchange=async e=>{const file=e.target.files?.[0],token=generation;e.target.value='';if(!file||!editable())return;try{if(file.size>15000000)throw Error('Datei ist zu groß.');const text=await file.text();if(token!==generation||!editable())return;const p=model.validateImport(text);pending={message:`Sicherung mit ${p.owned.length} Gegenständen übernehmen? Sie ersetzt deine aktuelle Sammlung. Exportiere diese bei Bedarf zuerst.`,run:()=>{const ok=model.importJSON(text);if(ok)onImport();return ok;}};notice='';}catch{notice='Import abgelehnt: beschädigte Datei oder falsches Spielstandformat.';}render();$('lootConfirm').scrollIntoView({block:'nearest'});};
    $('inventoryClose').onclick=onClose;
    return {render,closeDetail,close(){generation++;selected=null;pending=null;notice='';syncPanels();}};
  }
  globalThis.DenkmalLootUI={create};
})();
