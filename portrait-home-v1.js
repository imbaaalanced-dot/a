/* TD2 Style 2 portrait home: delegates to original game menu buttons.
 * No new save keys, no game logic duplication.
 */
(function(){
 'use strict';
 const nav=document.getElementById('menuHomeActions');
 if(!nav||nav.querySelector('.td2-portrait-home'))return;
 const section=document.createElement('div');
 section.className='td2-portrait-home';
 section.innerHTML='<div class="td2-portrait-logo" aria-hidden="true"><img src="assets/menu/crest-v3.webp" width="96" height="96" alt=""><strong>DENKMAL TD2</strong><small>DIE ERINNERUNG BRAUCHT EINEN HÜTER</small></div>'+
 '<div class="td2-mode-stack">'+
 '<button class="td2-mode-button" data-icon="⚔" data-td2-target="campaign" type="button">Kampagne</button>'+
 '<button class="td2-mode-button" data-icon="♜" data-td2-target="rush" type="button">Denkmal-Ansturm</button>'+
 '<button class="td2-mode-button" data-icon="∞" data-td2-target="endless" type="button">Endlosmodus</button>'+
 '<button class="td2-mode-button" data-icon="⛨" data-td2-target="equipment" type="button">Ausrüstung</button>'+
 '</div><div class="td2-portrait-dock">'+
 '<button class="td2-dock-button" data-td2-target="inventory" type="button"><b>▣</b>Inventar</button>'+
 '<button class="td2-dock-button" data-td2-target="heroes" type="button"><b>♙</b>Helden</button>'+
 '<button class="td2-dock-button" type="button" disabled title="Forschung wird mit dem Forschungssystem ergänzt"><b>✧</b>Forschung</button>'+
 '<button class="td2-dock-button" data-td2-target="options" type="button"><b>⚙</b>Optionen</button>'+
 '</div>';
 nav.append(section);
 const click=id=>{const el=document.getElementById(id);if(!el)return false;el.click();return true};
 section.addEventListener('click',event=>{
   const button=event.target.closest('[data-td2-target]');if(!button||button.disabled)return;
   switch(button.dataset.td2Target){
    case 'campaign':click('menuPlayBtn');click('menuCampaignBtn');break;
    case 'rush':{const a=document.getElementById('menuAnsturmBtn');if(a)a.click();break;}
    case 'endless':click('menuArcadeBtn');break;
    case 'equipment':click('menuCharacterBtn');break;
    case 'inventory':click('collectionBtn');break;
    case 'heroes':click('menuCharacterBtn');break;
    case 'options':click('menuOptionsBtn');break;
   }
 });
})();
