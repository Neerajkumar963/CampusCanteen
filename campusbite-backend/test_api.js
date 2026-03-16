const ABBREVIATIONS = {
    'LPU': 'Lovely Professional University',
    'CU': 'Chandigarh University',
    'CGC': 'Chandigarh Group of Colleges',
    'PU': 'Panjab University',
    'TU': 'Thapar University',
    'PEC': 'Punjab Engineering College'
};

async function testSearch(name) {
    console.log(`\n--- Testing Search: "${name}" ---`);
    let apiSearchTerm = name.trim();
    if (ABBREVIATIONS[apiSearchTerm.toUpperCase()]) {
        apiSearchTerm = ABBREVIATIONS[apiSearchTerm.toUpperCase()];
        console.log(`Mapped to: "${apiSearchTerm}"`);
    }

    const url = `https://universities.hipolabs.com/search?country=India&name=${encodeURIComponent(apiSearchTerm)}`;
    console.log(`URL: ${url}`);
    
    try {
        const start = Date.now();
        const response = await fetch(url);
        const data = await response.json();
        const duration = Date.now() - start;
        
        console.log(`Time: ${duration}ms`);
        console.log(`Results: ${data.length}`);
        if (data.length > 0) {
            console.log('Top match:', data[0].name);
        }
    } catch (e) {
        console.error('API Error:', e.message);
    }
}

async function run() {
    await testSearch('LPU');
    await testSearch('CU');
    await testSearch('Lovely');
    await testSearch('Chandigarh');
}

run();
