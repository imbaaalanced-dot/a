const DIRECTIONS=['e','n','w','s'];
const FAMILIES=new Set(['normal','runner','armored','cultist','shieldbearer','bomber','gargoyle','siege','stonebreaker','stormlord','shieldwarden','colossus']);

// Canvas y grows downward, so invert y before assigning compass directions.
export function walkDirection(x,y){
  const angle=Math.atan2(-y,x);
  const index=((Math.floor((angle+Math.PI/4)/(Math.PI/2))%4)+4)%4;
  return DIRECTIONS[index];
}

// Boss simulation type is generic; spriteKey carries the actual art family.
export function walkSheetKey(enemy,direction){
  const family=enemy?.type==='boss'?String(enemy.spriteKey||'').replace(/^boss_/,''):enemy?.type;
  if(!FAMILIES.has(family)||!DIRECTIONS.includes(direction))return null;
  return `walk_${family}_${direction}`;
}
