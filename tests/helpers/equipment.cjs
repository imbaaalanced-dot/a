'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const json=x=>JSON.parse(JSON.stringify(x));
function load(){const box={console};vm.createContext(box);for(const file of ['equipment-catalog.js','loot.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../../dist',file),'utf8'),box);return box;}
function memory(initial){const data=new Map(Object.entries(initial||{}));return {data,getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};}
const fixture=v=>fs.readFileSync(path.join(__dirname,`../fixtures/loot-v${v}.json`),'utf8');
module.exports={load,memory,json,fixture};
