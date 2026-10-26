const p=await fetch('profile.json').then(r=>{if(!r.ok)throw Error('Profil okunamadı');return r.json()});
window.keplerProfile=p;document.body.dataset.theme=p.theme;
const owner=document.querySelector('.rail-owner div');if(owner)owner.textContent=p.displayName;
document.addEventListener('kepler:profile-ready',()=>{});
