// Copyright (c) 2023 YA-androidapp(https://github.com/yzkn) All rights reserved.


let map;
const initMap = () => {
    map = L.map('map');

    L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
        attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
    }).addTo(map);

    map.setView([35.681236, 139.767125], 10);
};


const updateLocationResult = (coords) => {
    document.getElementById('locationResult').value = `${coords.latitude},${coords.longitude} (${coords.accuracy}m)` + '\n' +
        (coords.altitude ? `${coords.altitude} (${coords.altitudeAccuracy}m)` : '') + '\n' +
        (coords.heading ? `${coords.heading}deg` : '') + '\n' +
        (coords.speed ? `${coords.speed} m / s` : '');
};


window.addEventListener('DOMContentLoaded', _ => {
    initMap();

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((pos) => {
            const c = pos.coords;
            updateLocationResult(c);
            if (map) {
                map.setView([c.latitude, c.longitude], 16);
            }
        }, (error) => {
            console.error(error);
        }, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        });
    }

    // if (DeviceMotionEvent.requestPermission) {
    //     DeviceMotionEvent.requestPermission()
    //         .then(permissionState => {
    //             if (permissionState === 'granted') {
    window.addEventListener("devicemotion", function (event) {
        if (event.accelerationIncludingGravity) {
            document.getElementById('motionResult').value = (event.acceleration.x ? event.acceleration.x : '') + ' ' + (event.acceleration.y ? event.acceleration.y : '') + ' ' + (event.acceleration.z ? event.acceleration.z : '') + '\n' +
                (event.accelerationIncludingGravity.x ? event.accelerationIncludingGravity.x : '') + ' ' + (event.accelerationIncludingGravity.y ? event.accelerationIncludingGravity.y : '') + ' ' + (event.accelerationIncludingGravity.z ? event.accelerationIncludingGravity.z : '') + '\n' +
                (event.rotationRate.alpha ? event.rotationRate.alpha : '') + ' ' + (event.rotationRate.beta ? event.rotationRate.beta : '') + ' ' + (event.rotationRate.gamma ? event.rotationRate.gamma : '')
                ;
        }
    });
    //             }
    //         })
    //         .catch(console.error);
    // }

    if (window.DeviceOrientationEvent) {
        window.addEventListener(
            "deviceorientation",
            (event) => {
                // alpha: rotation around z-axis var rotateDegrees = event.alpha;
                // gamma: left to right          var leftToRight = event.gamma;
                // beta: front back motion       var frontToBack = event.beta;

                document.getElementById('orientationResult').value = (event.alpha ? event.alpha : '') + ' ' + (event.gamma ? event.gamma : '') + ' ' + (event.beta ? event.beta : '');
            },
            true,
        );
    }

    if (navigator.bluetooth) {
        document.getElementById('requestBle').addEventListener("click", (event) => {
            navigator.bluetooth.requestDevice({
                acceptAllDevices: true
                // filters: [{ name: "YA" }]
            })
                // .then(device => device.gatt.connect())
                // .then(server => server.getPrimaryService('battery_service'))
                // .then(service => service.getCharacteristic('battery_level'))
                // .then(characteristic => characteristic.readValue())
                // .then(value => {
                //     let batteryLevel = value.getUint8(0);
                //     console.log(batteryLevel);
                // })
                .then(device => {
                    console.log('device', device);
                    device.watchAdvertisements()
                })
                .then(device => device.addEventListener('advertisementreceived', (event) => {
                    var rssi = event.rssi;
                    var appleData = event.manufacturerData.get(0x004C);
                    if (appleData.byteLength != 23 ||
                        appleData.getUint16(0, false) !== 0x0215) {
                        console.log({ isBeacon: false });
                    }
                    var uuidArray = new Uint8Array(appleData.buffer, 2, 16);
                    var major = appleData.getUint16(18, false);
                    var minor = appleData.getUint16(20, false);
                    var txPowerAt1m = -appleData.getInt8(22);
                    console.log({
                        isBeacon: true,
                        uuidArray,
                        major,
                        minor,
                        rssi: rssi,
                        pathLossVs1m: txPowerAt1m - rssi
                    });
                }))

                .catch(error => console.log(error));
        });
    }


    if (navigator.vibrate) {
        document.getElementById('vibrate').addEventListener("click", (event) => {
            let duration = document.getElementById('vibrateDuration').value;
            if (duration.includes(',')) {
                duration = document.getElementById('vibrateDuration').value.split(',');
            }
            console.log('duration', duration);

            window.navigator.vibrate(duration);
        });
    }

});
