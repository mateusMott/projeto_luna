(() => {
  'use strict';
  const ACCOUNTS='luna-profiles-v1', SESSION='luna-session-v1';
  const encoder=new TextEncoder(),decoder=new TextDecoder();
  const base=new URL('../',document.currentScript.src);
  const encode=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes)));
  const decode=value=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
  const profiles=()=>{const items=JSON.parse(localStorage.getItem(ACCOUNTS)||'[]');if(!Array.isArray(items))throw Error('Lista de perfis inválida.');return items};
  const normalized=name=>name.trim().normalize('NFKC').toLocaleLowerCase('pt-BR');
  let profile=null,keyPromise=null;
  try {
    const session=JSON.parse(sessionStorage.getItem(SESSION)||'null');
    if(session){profile=profiles().find(p=>p.id===session.id)||null;if(profile)keyPromise=crypto.subtle.importKey('raw',decode(session.key),{name:'AES-GCM'},false,['encrypt','decrypt']);}
  }catch{sessionStorage.removeItem(SESSION)}
  async function seal(value,key,id){const iv=crypto.getRandomValues(new Uint8Array(12));const data=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(id)},key,encoder.encode(JSON.stringify(value)));return {v:1,iv:encode(iv),data:encode(data)}}
  async function unseal(value,key,id){if(value?.v!==1)throw Error('Dados de perfil inválidos.');return JSON.parse(decoder.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(value.iv),additionalData:encoder.encode(id)},key,decode(value.data))))}
  async function derive(password,salt){const material=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt:decode(salt),iterations:600000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},true,['encrypt','decrypt'])}
  async function start(p,key){sessionStorage.setItem(SESSION,JSON.stringify({id:p.id,key:encode(await crypto.subtle.exportKey('raw',key))}));profile=p;keyPromise=Promise.resolve(key);location.assign(new URL('app/',base))}
  async function signIn(name,password){const p=profiles().find(p=>p.nameKey===normalized(name));if(!p)throw Error('Perfil ou senha incorretos neste navegador.');try{const key=await derive(password,p.salt);const check=await unseal(p.check,key,p.id);if(check!=='luna-profile-v1')throw Error();await start(p,key)}catch{throw Error('Perfil ou senha incorretos neste navegador.')}}
  async function register(name,password){name=name.trim();if(name.length<2||name.length>60)throw Error('Use um nome de perfil com 2 a 60 caracteres.');if([...password].length<10||password.length>256)throw Error('Use uma senha de 10 a 256 caracteres.');if(profiles().some(p=>p.nameKey===normalized(name)))throw Error('Já existe um perfil com esse nome neste navegador.');const p={id:crypto.randomUUID(),name,nameKey:normalized(name),salt:encode(crypto.getRandomValues(new Uint8Array(16)))};const key=await derive(password,p.salt);p.check=await seal('luna-profile-v1',key,p.id);const all=profiles();if(all.some(item=>item.nameKey===p.nameKey))throw Error('Já existe um perfil com esse nome.');all.push(p);localStorage.setItem(ACCOUNTS,JSON.stringify(all));await start(p,key)}
  async function requireSession(){try{if(!profile||!keyPromise)throw Error();if(!sessionStorage.getItem(SESSION))throw Error();const check=await unseal(profile.check,await keyPromise,profile.id);if(check!=='luna-profile-v1')throw Error();return true}catch{sessionStorage.removeItem(SESSION);location.replace(base);return false}}
  window.LunaAuth={get profile(){return profile},signIn,register,requireSession,async pack(data){if(!profile||!keyPromise)throw Error('Sessão encerrada.');return {__lunaProfile:1,...await seal(data,await keyPromise,profile.id)}},async unpack(data){if(data?.__lunaProfile!==1)throw Error('Dados não pertencem a um perfil criptografado.');return unseal(data,await keyPromise,profile.id)},signOut(){sessionStorage.removeItem(SESSION);profile=null;keyPromise=null;location.replace(base)}};
})();
