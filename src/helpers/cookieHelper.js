/**
 * Helper utility for handling cookies safely in the browser.
 */

export function setCookie(name, value, options = {}) {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value || '')}; path=/; SameSite=Strict;`;
    
    if (options.expires) {
        let date;
        if (typeof options.expires === 'number') {
            date = new Date();
            // If number, treat as days
            date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
        } else if (options.expires instanceof Date) {
            date = options.expires;
        } else if (typeof options.expires === 'string') {
            date = new Date(options.expires);
        }
        
        if (date && !isNaN(date.getTime())) {
            cookieString += ` expires=${date.toUTCString()};`;
        }
    }
    
    // Add Secure flag if on HTTPS protocol
    if (window.location.protocol === 'https:' || options.secure) {
        cookieString += ' Secure;';
    }

    document.cookie = cookieString;
}

export function getCookie(name) {
    const nameEQ = encodeURIComponent(name) + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }
    return null;
}

export function removeCookie(name) {
    document.cookie = `${encodeURIComponent(name)}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict;`;
}
