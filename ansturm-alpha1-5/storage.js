export const RECORD_KEY='td2.denkmalAnsturm.alpha1.bestWave.v1';
export function readRecord(storage){try{const v=Number(storage.getItem(RECORD_KEY));return Number.isSafeInteger(v)&&v>=0?v:0;}catch{return 0;}}
export function saveRecord(storage,wave){try{if(!Number.isSafeInteger(wave)||wave<0)return false;if(wave>readRecord(storage))storage.setItem(RECORD_KEY,String(wave));return true;}catch{return false;}}

import {serializeRun,deserializeRun} from './run-state.js';
export const RUN_KEY='td2.denkmalAnsturm.run.v1';
export function saveRun(storage,state){try{storage.setItem(RUN_KEY,serializeRun(state));return true;}catch{return false;}}
export function readRun(storage,options){try{return deserializeRun(storage.getItem(RUN_KEY),options);}catch{return {ok:false,reason:'storage'};}}
export function clearRun(storage){try{storage.removeItem(RUN_KEY);return true;}catch{return false;}}
