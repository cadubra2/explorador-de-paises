// js/app.js
const list = document.getElementById("countriesList");
const searchInput = document.getElementById("searchInput");
const continentFilter = document.getElementById("continentFilter");
const spinner = document.getElementById("spinner");
const THEME_KEY = 'site-theme';

// Theme handling (persist across pages)
function applyTheme(theme){
    if(theme === 'dark') document.documentElement.setAttribute('data-theme','dark');
    else document.documentElement.removeAttribute('data-theme');
}
(function initTheme(){
    const saved = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(saved);
    const btn = document.getElementById('themeToggle');
    if(btn) btn.addEventListener('click', () => {
        const next = localStorage.getItem(THEME_KEY) === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
    });
})();

function mostrarSpinner(el = spinner){ if(el) el.style.display = 'block'; }
function esconderSpinner(el = spinner){ if(el) el.style.display = 'none'; }

function getFavoritos(){
    return JSON.parse(localStorage.getItem('favoritos')) || [];
}
function setFavoritos(arr){
    localStorage.setItem('favoritos', JSON.stringify(arr));
}

function adicionarFavorito(code){
    const favs = getFavoritos();
    if(!favs.includes(code)){
        favs.push(code);
        setFavoritos(favs);
        // feedback simples
        alert('País adicionado aos favoritos ⭐');
    }
}

function removerFavorito(code){
    const favs = getFavoritos().filter(c=>c!==code);
    setFavoritos(favs);
}

// Busca por nome
async function buscarPorNome(nome){
    try{
        mostrarSpinner();
        const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(nome)}`);
        if(!res.ok) throw new Error('não encontrado');
        const data = await res.json();
        renderizarPaises(data);
    } catch(e){
        list.innerHTML = '<p style="text-align:center;color:var(--muted)">Nenhum país encontrado.</p>';
    } finally {
        esconderSpinner();
    }
}

// Filtro por região
continentFilter.addEventListener('change', async ()=>{
    const region = continentFilter.value;
    if(region === ''){
        list.innerHTML = '';
        return;
    }
    try{
        mostrarSpinner();
        const res = await fetch(`https://restcountries.com/v3.1/region/${encodeURIComponent(region)}`);
        const data = await res.json();
        renderizarPaises(data);
    } catch(e){
        list.innerHTML = '<p style="text-align:center;color:var(--muted)">Erro ao buscar região.</p>';
    } finally {
        esconderSpinner();
    }
});

function criarCard(p){
    const card = document.createElement('article');
    card.className = 'country-card';
    card.innerHTML = `
        <div>
            <img src="${p.flags?.png || p.flags?.svg || ''}" alt="Bandeira de ${p.name?.common || ''}" loading="lazy"/>
            <h3>${p.name?.common || '—'}</h3>
            <div class="meta">
                <span>Capital: ${p.capital ? p.capital[0] : 'N/A'}</span>
                <span>População: ${p.population ? p.population.toLocaleString('pt-BR') : 'N/A'}</span>
            </div>
        </div>
        <div class="actions">
            <button class="favBtn" aria-label="Favoritar ${p.name?.common || ''}">⭐ Favoritar</button>
        </div>
    `;

    // Favoritar
    card.querySelector('.favBtn').addEventListener('click', (ev)=>{
        ev.stopPropagation();
        adicionarFavorito(p.cca3);
    });

    // Abrir detalhes
    card.addEventListener('click', ()=> {
        window.location.href = `detalhes.html?code=${p.cca3}`;
    });

    return card;
}

function renderizarPaises(paises){
    list.innerHTML = '';
    if(!Array.isArray(paises) || paises.length === 0){
        list.innerHTML = '<p style="text-align:center;color:var(--muted)">Nenhum país encontrado.</p>';
        return;
    }
    const fragment = document.createDocumentFragment();
    paises.forEach(p => {
        const c = criarCard(p);
        fragment.appendChild(c);
    });
    list.appendChild(fragment);
}

// Input search behaviour (debounce)
let debounceTimer = null;
searchInput.addEventListener('input', (e)=>{
    const v = e.target.value.trim();
    clearTimeout(debounceTimer);
    if(v.length === 0){
        list.innerHTML = '';
        return;
    }
    debounceTimer = setTimeout(()=> buscarPorNome(v), 450);
});

// On load: if there are favorites and no content, show small hint (optional)
document.addEventListener('DOMContentLoaded', ()=>{
    // If theme saved changed on other page, reapply
    applyTheme(localStorage.getItem(THEME_KEY));
});
