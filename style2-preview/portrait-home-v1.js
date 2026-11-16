/* TD2 Style 2 portrait home v2: professional menu shell for portrait phones.
 * Delegates to the original game menu buttons.
 * No new save keys, no game logic duplication.
 */
(function(){
 'use strict';
 const nav=document.getElementById('menuHomeActions');
 if(!nav||nav.querySelector('.td2-portrait-home'))return;
 const svg={
  campaign:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 21V3.5M6.5 4.5h11.5l-3 4.2 3 4.3H6.5"/></svg>',
  rush:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 2.8v5.4c0 4.4-2.9 7.6-7 9.8-4.1-2.2-7-5.4-7-9.8V5.8z"/><path d="M12 8.2v5.6"/></svg>',
  endless:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 12c-1.8-2.8-3.6-3.6-5.4-3.6C4.2 8.4 2.8 10 2.8 12s1.4 3.6 3.8 3.6c1.8 0 3.6-.8 5.4-3.6zm0 0c1.8 2.8 3.6 3.6 5.4 3.6 2.4 0 3.8-1.6 3.8-3.6s-1.4-3.6-3.8-3.6c-1.8 0-3.6.8-5.4 3.6z"/></svg>',
  equipment:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.2 3.6S6.4 5 5.5 7l2.6 2 .5 11.4h6.8l.5-11.4 2.6-2c-.9-2-2.7-3.4-2.7-3.4-.9 1-2 1.6-3.8 1.6s-2.9-.6-3.8-1.6z"/><path d="M12 8v6"/></svg>',
  inventory:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 8.6V7a4.5 4.5 0 0 1 9 0v1.6"/><rect x="5" y="8.6" width="14" height="11.4" rx="2.6"/><path d="M12 13v3.4"/></svg>',
  heroes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="7.8" r="3.5"/><path d="M5.2 20.4a6.8 6.8 0 0 1 13.6 0"/></svg>',
  research:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.6 3.4h4.8M11 3.4v5.4l-5 8.4A2.6 2.6 0 0 0 8.2 21h7.6a2.6 2.6 0 0 0 2.2-3.8l-5-8.4V3.4M8.6 15h6.8"/></svg>',
  options:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.1"/><path d="M12 2.9v2.3M12 18.8v2.3M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M2.9 12h2.3M18.8 12h2.3M5.2 18.8l1.6-1.6M17.2 6.8l1.6-1.6"/></svg>'
 };
 const section=document.createElement('div');
 section.className='td2-portrait-home';
 section.innerHTML='<div class="td2-portrait-logo" aria-hidden="true"><img src="assets/menu/crest-style2.webp" width="96" height="96" alt=""><strong>DENKMAL TD2</strong><small>DIE ERINNERUNG BRAUCHT EINEN HÜTER</small></div>'+
 '<div class="td2-mode-stack">'+
 '<button class="td2-mode-button td2-mode-primary" data-td2-target="campaign" type="button"><span class="td2-mode-icon" aria-hidden="true">'+svg.campaign+'</span><span class="td2-mode-copy"><strong>Kampagne</strong><small>Sieben Schauplätze · 20 Wellen je Kapitel</small></span><span class="td2-mode-arrow" aria-hidden="true">›</span></button>'+
 '<button class="td2-mode-button td2-mode-assault" data-td2-target="rush" type="button"><span class="td2-mode-icon" aria-hidden="true">'+svg.rush+'</span><span class="td2-mode-copy"><strong>Denkmal-Ansturm</strong><small>Endloser Überlebenskampf ohne Helden</small></span><span class="td2-mode-arrow" aria-hidden="true">›</span></button>'+
 '<button class="td2-mode-button" data-td2-target="endless" type="button"><span class="td2-mode-icon" aria-hidden="true">'+svg.endless+'</span><span class="td2-mode-copy"><strong>Endlosmodus</strong><small>Freigeschaltete Karten · Steigende Herausforderung</small></span><span class="td2-mode-arrow" aria-hidden="true">›</span></button>'+
 '<button class="td2-mode-button" data-td2-target="equipment" type="button"><span class="td2-mode-icon" aria-hidden="true">'+svg.equipment+'</span><span class="td2-mode-copy"><strong>Ausrüstung</strong><small>Marcel oder Kim wählen und Beute verwalten</small></span><span class="td2-mode-arrow" aria-hidden="true">›</span></button>'+
 '</div><div class="td2-portrait-dock">'+
 '<button class="td2-dock-button" data-td2-target="inventory" type="button"><b aria-hidden="true">'+svg.inventory+'</b>Inventar</button>'+
 '<button class="td2-dock-button" data-td2-target="heroes" type="button"><b aria-hidden="true">'+svg.heroes+'</b>Helden</button>'+
 '<button class="td2-dock-button" type="button" disabled title="Forschung wird mit dem Forschungssystem ergänzt"><b aria-hidden="true">'+svg.research+'</b>Forschung</button>'+
 '<button class="td2-dock-button" data-td2-target="options" type="button"><b aria-hidden="true">'+svg.options+'</b>Optionen</button>'+
 '</div>';
 nav.append(section);
 const click=id=>{const el=document.getElementById(id);if(!el)return false;el.click();return true};
 section.addEventListener('click',event=>{
   const button=event.target.closest('[data-td2-target]');if(!button||button.disabled)return;
   switch(button.dataset.td2Target){
    case 'campaign':click('menuCampaignBtn');break;
    case 'rush':{const a=document.getElementById('menuAnsturmBtn');if(a)a.click();break;}
    case 'endless':click('menuArcadeBtn');break;
    case 'equipment':click('menuCharacterBtn');break;
    case 'inventory':click('collectionBtn');break;
    case 'heroes':click('menuCharacterBtn');break;
    case 'options':click('menuOptionsBtn');break;
   }
 });
})();
