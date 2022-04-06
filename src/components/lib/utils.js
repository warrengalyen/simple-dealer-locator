export function loadScript(src) {
    return new Promise((resolve, reject) => {
        let script, ready, tag;
        ready = false;
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        script.onload = s.onreadystatechange = function () {
            if (!ready && (!this.readyState || this.readyState === 'complete')) {
                ready = true;
                return resolve();
            }
            return reject();
        };
        tag = document.getElementsByTagName('script')[0];
        tag.parentNode.insertBefore(script, tag);
    });
}

export function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject('no geolocation support');
        navigator.geolocation.getCurrentPosition(
            p => {
                resolve({ lat: p.coords.latitude, lng: p.coords.longitude });
            },
            () => {
                reject('user denied request for position');
            }
        );
    });
} 