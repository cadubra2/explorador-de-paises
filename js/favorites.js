// js/favorites.js
const listEl = document.getElementById('favoritesList');
const spinnerFav = document.getElementById('spinnerFav');
const THEME_KEY = 'site-theme';

// apply theme from storage and wire toggle
(function(){
    const saved = localStorage.getItem(THEME_KEY) || 'light';
    if(saved === 'dark') document.documentElement.setAttribute('data-theme','dark');
    const btn = document.getElementById('themeToggleFav');
    if(btn) btn.addEventListener('click', ()=>{
        const next = localStorage.getItem(THEME_KEY) === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_KEY, next);
        if(next === 'dark') document.documentElement.setAttribute('data-theme','dark'); else document.documentElement.removeAttribute('data-theme');
    });
})();

function showSpinner(){ if(spinnerFav) spinnerFav.style.display = 'block'; }
function hideSpinner(){ if(spinnerFav) spinnerFav.style.display = 'none'; }

async function carregarFavoritos(){
    listEl.innerHTML = '';
    const favs = JSON.parse(localStorage.getItem('favoritos')) || [];
    if(favs.length === 0){
        listEl.innerHTML = '<p style="text-align:center;color:var(--muted);">Você ainda não adicionou favoritos.</p>';
        return;
    }

    showSpinner();
    // fetch all by alpha codes in parallel (the API supports comma separated codes too)
    try {
        // Use the alpha endpoint that accepts codes joined by comma
        const codes = favs.join(',');
        const res = await fetch(`https://restcountries.com/v3.1/alpha?codes=${encodeURIComponent(codes)}`);
        if(!res.ok) throw new Error('Erro na API');
        const data = await res.json();

        // Render
        const frag = document.createDocumentFragment();
        data.forEach(p => {
            const card = document.createElement('article');
            card.className = 'country-card';
            card.innerHTML = `
                <div>
                    <img src="${p.flags?.png || p.flags?.svg || ''}" alt="Bandeira de ${p.name?.common || ''}" />
                    <h3>${p.name?.common || ''}</h3>
                    <div class="meta">
                        <span>Capital: ${p.capital ? p.capital[0] : 'N/A'}</span>
                        <span>População: ${p.population ? p.population.toLocaleString('pt-BR') : 'N/A'}</span>
                    </div>
                </div>
                <div class="actions">
                    <button class="removeBtn">Remover dos favoritos</button>
                </div>
            `;
            card.querySelector('.removeBtn').addEventListener('click', (ev)=>{
                ev.stopPropagation();
                removerFavorito(p.cca3);
                carregarFavoritos();
            });
            card.addEventListener('click', ()=> {
                window.location.href = `detalhes.html?code=${p.cca3}`;
            });
            frag.appendChild(card);
        });
        listEl.appendChild(frag);
    } catch (e) {
        listEl.innerHTML = '<p style="text-align:center;color:var(--muted)">Erro ao buscar favoritos.</p>';
    } finally {
        hideSpinner();
    }
}

function removerFavorito(code){
    const favs = JSON.parse(localStorage.getItem('favoritos')) || [];
    const next = favs.filter(c=>c !== code);
    localStorage.setItem('favoritos', JSON.stringify(next));
}

document.addEventListener('DOMContentLoaded', carregarFavoritos);
