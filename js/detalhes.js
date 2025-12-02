// js/detalhes.js
const container = document.getElementById('details');
const params = new URLSearchParams(window.location.search);
const code = params.get('code');
const THEME_KEY = 'site-theme';

// apply theme from storage
(function(){ const t = localStorage.getItem(THEME_KEY); if(t==='dark') document.documentElement.setAttribute('data-theme','dark'); })();

// also add toggle if present (synchronizes pages)
(function initToggle(){
    const btn = document.getElementById('themeToggle') || document.getElementById('themeToggleFav') || document.getElementById('themeToggleSobre');
    if(!btn) return;
    btn.addEventListener('click', ()=>{
        const next = localStorage.getItem(THEME_KEY) === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_KEY, next);
        if(next==='dark') document.documentElement.setAttribute('data-theme','dark'); else document.documentElement.removeAttribute('data-theme');
    });
})();

async function carregarDetalhes(){
    try{
        container.innerHTML = '';
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        spinner.textContent = 'Carregando...';
        container.appendChild(spinner);

        const res = await fetch(`https://restcountries.com/v3.1/alpha/${encodeURIComponent(code)}`);
        if(!res.ok) throw new Error('Não encontrado');
        const d = (await res.json())[0];

        const latlng = d.latlng || [];
        const lat = latlng[0] || 0;
        const lng = latlng[1] || 0;

        container.innerHTML = `
            <h2>${d.name?.common || ''}</h2>
            <img src="${d.flags?.png || d.flags?.svg || ''}" alt="Bandeira de ${d.name?.common || ''}" />
            <p><strong>Nome Oficial:</strong> ${d.name?.official || 'N/A'}</p>
            <p><strong>Capital:</strong> ${d.capital ? d.capital[0] : 'N/A'}</p>
            <p><strong>Área:</strong> ${d.area ? d.area.toLocaleString('pt-BR') + ' km²' : 'N/A'}</p>
            <p><strong>Idiomas:</strong> ${d.languages ? Object.values(d.languages).join(', ') : 'N/A'}</p>
            <p><strong>Moedas:</strong> ${d.currencies ? Object.values(d.currencies).map(c=>c.name).join(', ') : 'N/A'}</p>
            <p><strong>Domínios:</strong> ${d.tld ? d.tld.join(', ') : 'N/A'}</p>
            <p><strong>Fronteiras:</strong> ${d.borders ? d.borders.join(', ') : 'Nenhuma'}</p>
            <h3>Mapa</h3>
            <iframe width="100%" height="350" src="https://www.google.com/maps?q=${lat},${lng}&z=5&output=embed"></iframe>
            <div style="margin-top:12px">
                <button id="favDetailBtn" style="padding:10px;border-radius:10px;border:none;background:linear-gradient(90deg,var(--gold),#ffcf40);font-weight:700;cursor:pointer">
                    ⭐ Favoritar
                </button>
            </div>
        `;

        document.getElementById('favDetailBtn').addEventListener('click', ()=>{
            const favs = JSON.parse(localStorage.getItem('favoritos')) || [];
            if(!favs.includes(d.cca3)){
                favs.push(d.cca3);
                localStorage.setItem('favoritos', JSON.stringify(favs));
                alert('País adicionado aos favoritos ⭐');
            } else {
                alert('Esse país já está nos favoritos.');
            }
        });

    } catch(e){
        container.innerHTML = `<p style="color:var(--muted)">Erro ao carregar detalhes.</p>`;
    }
}

carregarDetalhes();
