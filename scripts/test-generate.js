const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');

(async () => {
    try {
        // Create a tiny 1x1 PNG buffer (transparent)
        const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
        const buffer = Buffer.from(pngBase64, 'base64');

        const form = new FormData();
        form.append('image', buffer, { filename: 'test.png', contentType: 'image/png' });
        form.append('prompt', 'Test prompt: convert to watercolor');

        console.log('Posting to http://localhost:3000/api/generate ...');

        const res = await fetch('http://localhost:3000/api/generate', {
            method: 'POST',
            body: form,
            headers: form.getHeaders(),
        });

        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Response body:', text);
    } catch (err) {
        console.error('Test script error:', err);
    }
})();
