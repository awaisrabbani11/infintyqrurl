// Debug Fix for Button Functionality
// This script directly binds event listeners to buttons

console.log('🔧 Loading debug fix for button functionality...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM loaded, applying button fixes...');

    // URL Shortener Button Fix
    const shortenBtn = document.getElementById('shortenBtn');
    if (shortenBtn) {
        console.log('✅ Found shorten button, adding event listener...');

        // Remove any existing event listeners
        shortenBtn.replaceWith(shortenBtn.cloneNode(true));
        const newShortenBtn = document.getElementById('shortenBtn');

        newShortenBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('🔗 Shorten button clicked!');

            const longUrlInput = document.getElementById('longUrl');
            const customAliasInput = document.getElementById('customAlias');

            if (!longUrlInput || !longUrlInput.value.trim()) {
                alert('Please enter a URL to shorten');
                return;
            }

            const longUrl = longUrlInput.value.trim();
            const customAlias = customAliasInput ? customAliasInput.value.trim() : '';

            // Basic URL validation
            try {
                new URL(longUrl);
            } catch {
                if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
                    longUrl = 'https://' + longUrl;
                }
            }

            console.log('🚀 Shortening URL:', longUrl);

            // Show loading state
            newShortenBtn.disabled = true;
            newShortenBtn.querySelector('.btn-text').textContent = 'Shortening...';

            try {
                // Use Rebrandly API directly
                const response = await fetch('https://api.rebrandly.com/v1/links', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': 'a74ebde57f5143ad8a2db22b04d8ef64',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        destination: longUrl,
                        domain: { fullName: "rebrand.ly" },
                        slashtag: customAlias || undefined
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const shortUrl = data.shortUrl;

                    console.log('✅ URL shortened successfully:', shortUrl);

                    // Update result display
                    const resultContainer = document.getElementById('urlResult');
                    const shortUrlInput = document.getElementById('shortUrl');
                    const createdDateSpan = document.getElementById('createdDate');
                    const clickCountSpan = document.getElementById('clickCount');

                    if (shortUrlInput) {
                        shortUrlInput.value = shortUrl;
                    }

                    if (createdDateSpan) {
                        createdDateSpan.textContent = new Date().toLocaleDateString();
                    }

                    if (clickCountSpan) {
                        clickCountSpan.textContent = '0';
                    }

                    if (resultContainer) {
                        resultContainer.style.display = 'block';
                    }

                    // Clear inputs
                    if (longUrlInput) longUrlInput.value = '';
                    if (customAliasInput) customAliasInput.value = '';

                    // Show success message
                    alert('URL shortened successfully: ' + shortUrl);

                } else {
                    const errorText = await response.text();
                    console.error('❌ API Error:', response.status, errorText);
                    alert('Error: ' + response.status + ' - ' + errorText);
                }
            } catch (error) {
                console.error('❌ Network Error:', error);
                alert('Network error. Please try again.');
            } finally {
                // Reset button
                newShortenBtn.disabled = false;
                newShortenBtn.querySelector('.btn-text').textContent = 'Shorten URL';
            }
        });

        console.log('✅ URL shortener button fixed');
    } else {
        console.error('❌ Shorten button not found!');
    }

    // QR Code Generator Button Fix
    const generateQrBtn = document.getElementById('generateQrBtn');
    if (generateQrBtn) {
        console.log('✅ Found QR generate button, adding event listener...');

        // Remove any existing event listeners
        generateQrBtn.replaceWith(generateQrBtn.cloneNode(true));
        const newGenerateBtn = document.getElementById('generateQrBtn');

        newGenerateBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('📱 QR generate button clicked!');

            const qrUrlInput = document.getElementById('qrUrl');
            const qrSizeSelect = document.getElementById('qrSize');
            const qrFormatSelect = document.getElementById('qrFormat');

            if (!qrUrlInput || !qrUrlInput.value.trim()) {
                alert('Please enter a URL for QR code generation');
                return;
            }

            const url = qrUrlInput.value.trim();
            const size = qrSizeSelect ? qrSizeSelect.value : '300';
            const format = qrFormatSelect ? qrFormatSelect.value : 'png';

            console.log('🔄 Generating QR code for:', url, 'Size:', size, 'Format:', format);

            // Show loading state
            newGenerateBtn.disabled = true;
            newGenerateBtn.querySelector('.btn-text').textContent = 'Generating...';

            try {
                // Use QRServer API (free, no auth required)
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&format=${format}`;

                const response = await fetch(qrUrl);

                if (response.ok) {
                    const blob = await response.blob();
                    const imageUrl = URL.createObjectURL(blob);

                    console.log('✅ QR code generated successfully');

                    // Update result display
                    const resultContainer = document.getElementById('qrResult');
                    const qrImage = document.getElementById('qrImage');

                    if (qrImage) {
                        qrImage.src = imageUrl;
                        qrImage.style.display = 'block';
                    }

                    if (resultContainer) {
                        resultContainer.style.display = 'block';
                    }

                    // Clear input
                    if (qrUrlInput) qrUrlInput.value = '';

                    // Show success message
                    alert('QR code generated successfully!');

                } else {
                    console.error('❌ QR API Error:', response.status);
                    alert('Error generating QR code. Please try again.');
                }
            } catch (error) {
                console.error('❌ QR Network Error:', error);
                alert('Network error. Please try again.');
            } finally {
                // Reset button
                newGenerateBtn.disabled = false;
                newGenerateBtn.querySelector('.btn-text').textContent = 'Generate QR Code';
            }
        });

        console.log('✅ QR generator button fixed');
    } else {
        console.error('❌ QR generate button not found!');
    }

    // Copy URL Button Fix
    const copyUrlBtn = document.getElementById('copyUrlBtn');
    if (copyUrlBtn) {
        copyUrlBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📋 Copy URL button clicked!');

            const shortUrlInput = document.getElementById('shortUrl');
            if (shortUrlInput && shortUrlInput.value) {
                navigator.clipboard.writeText(shortUrlInput.value).then(() => {
                    console.log('✅ URL copied to clipboard');
                    alert('URL copied to clipboard!');
                }).catch(err => {
                    console.error('❌ Copy failed:', err);
                    // Fallback method
                    shortUrlInput.select();
                    document.execCommand('copy');
                    alert('URL copied to clipboard!');
                });
            } else {
                alert('No URL to copy');
            }
        });
        console.log('✅ Copy URL button fixed');
    }

    // Download QR Button Fix
    const downloadQrBtn = document.getElementById('downloadQrBtn');
    if (downloadQrBtn) {
        downloadQrBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('💾 Download QR button clicked!');

            const qrImage = document.getElementById('qrImage');
            if (qrImage && qrImage.src) {
                const link = document.createElement('a');
                link.href = qrImage.src;
                link.download = 'qrcode.png';
                link.click();
                console.log('✅ QR code download started');
            } else {
                alert('No QR code to download');
            }
        });
        console.log('✅ Download QR button fixed');
    }

    console.log('🎉 All button fixes applied successfully!');
});

// Additional debug: Log when page loads
window.addEventListener('load', function() {
    console.log('🌐 Page fully loaded');
    console.log('🔍 Debug: Check browser console for any errors');
});