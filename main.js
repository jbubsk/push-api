(function (window) {
    var pushApi = 'http://localhost:8000',
        subscribeButton,
        unsubscribeButton,
        endpoint;

    window.addEventListener('load', function () {
        subscribeButton = window.document.getElementById('subscribeBtn');
        unsubscribeButton = window.document.getElementById('unsubscribeBtn');

        if ('serviceWorker' in navigator) {
            //noinspection JSUnresolvedVariable
            navigator.serviceWorker
                .register('/sw.js')
                .then(initialize);
        } else {
            console.log('Service workers aren\'t supported in this browser.');
        }
    });

    function initialize() {
        //noinspection JSUnresolvedVariable
        if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
            console.log('Notifications aren\'t supported.');
            return;
        }

        if (Notification.permission === 'denied') {
            console.log('The user has blocked notifications.');
            return;
        }

        // Check if push messaging is supported
        if (!('PushManager' in window)) {
            console.log('Push messaging isn\'t supported.');
            return;
        }

        //noinspection JSUnresolvedVariable
        navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
            //noinspection JSUnresolvedVariable
            serviceWorkerRegistration.pushManager.getSubscription()
                .then(function (subscription) {
                    if (!subscription) {
                        subscribe();
                    } else {
                        endpoint = subscription.endpoint;
                        updateUIState();
                        console.log('already subscribed: ', subscription.endpoint);
                    }

                })
                .catch(function (err) {
                    console.log('Error during getSubscription()', err);
                });
        });
    }

    function subscribe() {
        //noinspection JSUnresolvedVariable
        navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
            console.log('request subscription...');

            //noinspection JSUnresolvedVariable
            serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
                .then(function (subscription) {
                    endpoint = subscription.endpoint;
                    updateUIState();
                    console.log('subscription endpoint: ', subscription.endpoint);
                })
                .catch(function (e) {
                    if (Notification.permission === 'denied') {
                        console.log('Permission for Notifications was denied');
                    } else {
                        console.error('Unable to subscribe to push.', e);
                    }
                });
        });
    }

    function updateUIState() {
        if (endpoint) {
            subscribeButton.disabled = true;
            unsubscribeButton.disabled = false;
        } else {
            subscribeButton.disabled = false;
            unsubscribeButton.disabled = true;
        }
    }

    window.subscribe = function () {
        var request = new XMLHttpRequest();
        request.open('POST', pushApi + '/subscribe');
        request.setRequestHeader('content-type', 'application/json');
        request.send(JSON.stringify({endpoint: endpoint}));
    };

    window.unsubscribe = function () {
        var request = new XMLHttpRequest();
        request.open('POST', pushApi + '/unsubscribe');
        request.setRequestHeader('content-type', 'application/json');
        request.send(JSON.stringify({endpoint: endpoint}));
    };

})(window);