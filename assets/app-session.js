(() => {
 const link=document.querySelector('[data-sign-out]');let leaving=false;
 link.addEventListener('click',async event=>{event.preventDefault();if(leaving)return;leaving=true;try{flushCapture();await saveChain;if(lastSaveFailed)throw Error('Não foi possível salvar. Faça um backup antes de sair.');if(vaultSessions.size)await lockVaults('manual');if(lastSaveFailed)throw Error('Não foi possível salvar. Faça um backup antes de sair.');closePinManager();LunaAuth.signOut()}catch(error){toast(error.message);leaving=false}});
 window.addEventListener('pageshow',()=>{if(!sessionStorage.getItem('luna-session-v1')){document.querySelector('#app').inert=true;LunaAuth.requireSession()}});
 const label=document.querySelector('.luna-account-label strong');if(LunaAuth.profile)label.textContent=LunaAuth.profile.name;
})();
