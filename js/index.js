if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('SW registrato!', reg))
                    .catch(err => console.log('SW Errore:', err));
            });
        }