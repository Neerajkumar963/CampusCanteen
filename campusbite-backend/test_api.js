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

    const encoded = encodeURIComponent(apiSearchTerm);
    const urls = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(`http://universities.hipolabs.com/search?country=India&name=${apiSearchTerm}`)}`,
        `http://universities.hipolabs.com/search?country=India&name=${encoded}`,
        `https://universities.hipolabs.com/search?country=India&name=${encoded}`
    ];
    
    for (const url of urls) {
        console.log(`Trying URL: ${url}`);
        try {
            const start = Date.now();
            const response = await fetch(url);
            const data = await response.json();
            const duration = Date.now() - start;
            
            console.log(`SUCCESS! Time: ${duration}ms, Results: ${data.length}`);
            if (data.length > 0) {
                console.log('Top match:', data[0].name);
            }
            return; // Exit loop on success
        } catch (e) {
            console.error(`FAILED ${url.split(':')[0]}: ${e.message}`);
        }
    }
}

async function run() {
    await testSearch('LPU');
    await testSearch('CU');
    await testSearch('Lovely');
    await testSearch('Chandigarh');
}

run();
