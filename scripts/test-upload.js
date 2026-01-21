const fs = require('fs');
const path = require('path');

// Create a dummy file if not exists
const dummyPath = path.join(__dirname, 'test-image.txt');
fs.writeFileSync(dummyPath, 'This is a test image content');

async function testUpload() {
    const url = 'https://microfotos.ratelapps.com/upload';
    const folder = 'test_debug';

    console.log(`Testing upload to ${url}...`);

    const formData = new FormData();
    // Create a Blob/File from the dummy content
    const file = new Blob(['Test image content'], { type: 'text/plain' });
    formData.append('file', file, 'test.txt');
    formData.append('folder', folder);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.log(`Response: ${text}`);
    } catch (e) {
        console.error('Error:', e);
    }
}

testUpload();
