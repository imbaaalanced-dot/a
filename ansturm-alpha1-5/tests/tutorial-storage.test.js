import test from 'node:test';
import assert from 'node:assert/strict';
import {tutorialSeen,rememberTutorial,TUTORIAL_KEY} from '../tutorial.js';
test('tutorial completion has its own key and never changes a game save',()=>{
 const data=new Map([['run','untouched']]);const storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 assert.equal(tutorialSeen(storage),false);rememberTutorial(storage);assert.equal(tutorialSeen(storage),true);
 assert.equal(data.get('run'),'untouched');assert.equal(data.get(TUTORIAL_KEY),'done');
});
test('missing, corrupt or blocked tutorial storage never blocks closing help',()=>{
 for(const storage of [null,{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}},{getItem:()=>'{bad',setItem(){}}]){
 assert.equal(tutorialSeen(storage),false);assert.doesNotThrow(()=>rememberTutorial(storage));
 }
});
