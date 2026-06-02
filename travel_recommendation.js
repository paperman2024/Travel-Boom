const links = document.querySelectorAll('#navbar ul li a');
const sections = document.querySelectorAll('section');
const searchbar = document.querySelector('.searchbar');

links.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href').replace('#', '');

        sections.forEach(s => s.classList.remove('active'));
        links.forEach(l => l.classList.remove('active'));

        document.getElementById(target).classList.add('active');
        link.classList.add('active');

        searchbar.classList.toggle('hidden', target !== 'home');
    });
});

document.querySelector('a[href="#home"]').click();

// ── Employee cards ──
async function loadEmployees() {
    const res = await fetch('employees.json');
    const employees = await res.json();
    const list = document.getElementById('employee-list');

    list.innerHTML = '';

    employees.forEach(emp => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="employee-card">
                <div class="employee-icon">${emp.icon}</div>
                <div class="employee-info">
                    <h3 class="employee-name">${emp.name}</h3>
                    <span class="employee-role">${emp.role}</span>
                    <p class="employee-description">${emp.description}</p>
                </div>
            </div>
        `;
        list.appendChild(li);
    });
}

loadEmployees();

async function loadDestinations() {
    const res = await fetch('travel_recommendation_api.json');
    return await res.json();
}

function normalizeInput(input) {
    return input.trim().toLowerCase();
}

function getTag(query) {
    if (query.includes("beach")) return "beaches";
    if (query.includes("temple") || query.includes("shrine")) return "temples";
    if (query.includes("countrie")) return "countries";
    return null;
}

function getResults(data, query) {
    const category = getTag(query);

    if (category === "countries") {
        return data.countries.flatMap(c => c.cities);
    }
    if (category) return data[category];

    // Country name → return all its cities
    const countryMatch = data.countries.find(
        c => c.name.toLowerCase().includes(query)
    );
    if (countryMatch) return countryMatch.cities;

    // Fallback
    return [
        ...data.countries.flatMap(c => c.cities),
        ...data.beaches,
        ...data.temples
    ].filter(
        item =>
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
    );
}

function renderResults(results, query) {
    const container = document.getElementById('search-results');
    const heading = document.querySelector('#search h2');

    heading.textContent = `Search results for "${query}":`;

    if (!results || results.length === 0) {
        container.innerHTML = `<p class="no-results">No results found for "<strong>${query}</strong>". Try "beach", "temple", or a country like "japan".</p>`;
        return;
    }

    container.innerHTML = results.map(item => `
        <div class="destination-card">
            <img src="${item.imageUrl}" alt="${item.name}" onerror="this.style.display='none'">
            <div class="destination-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
            </div>
        </div>
    `).join('');
}

async function handleSearch() {
    const input = document.querySelector('.searchbar input');
    const query = normalizeInput(input.value);
    if (!query) return;

    const data = await loadDestinations();
    const results = getResults(data, query);

    renderResults(results, query);

    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('#navbar ul li a').forEach(l => l.classList.remove('active'));
    document.getElementById('search').classList.add('active');
}

// ── Wire up search button & Enter key ──
function initSearch() {
    const searchBtn = document.getElementById('search-button');
    const clearBtn = document.getElementById('search-clear');
    const input = document.getElementById('search-input');

    searchBtn.addEventListener('click', handleSearch);

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        document.getElementById('search-results').innerHTML = '';
    });
}

initSearch();