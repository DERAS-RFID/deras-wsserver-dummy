const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

console.log('WebSocket server is running on ws://localhost:8080');

let isContinoues = false;
let intervalId = null;

server.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.event === 'scan-rfid-on') {
                if (!isContinoues) {
                    isContinoues = true;

                    const successResponse = {
                        event: 'response-scan-rfid-on',
                        statusCode: 1,
                        message: 'success!'
                    }
                    ws.send(JSON.stringify(successResponse));

                    // Start sending dummy data every second
                    intervalId = setInterval(() => {
                        if (isContinoues) {
                            const response = {
                                event: 'scan-rfid-result',
                                type: 1,
                                data: generateRandomRFID(),
                                data_tid: generateRandomRFID(),
                                pc: null,
                                user: '',
                                ant: '1',
                                rssi: '-64.7',
                                sensor: null,
                                rfid_valid: '1'
                            };
                            ws.send(JSON.stringify(response));
                        }
                    }, 100); // Send data every 1 second
                }
            } else if (data.event === 'scan-rfid-off') {
                
                const successResponse = {
                    event: 'response-scan-rfid-off',
                    statusCode: 1,
                    message: 'success!'
                }
                ws.send(JSON.stringify(successResponse));

                isContinoues = false;
                clearInterval(intervalId);
            } else {
                console.log('Unknown event:', data.event);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
            ws.send(JSON.stringify({ event: 'error', message: 'Invalid JSON' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        isContinoues = false;
        clearInterval(intervalId); // Ensure interval is cleared on disconnection
    });
});


function generateRandomRFID() {
    const hexChars = '0123456789ABCDEF';
    let rfid = '';
    for (let i = 0; i < 16; i++) {
        rfid += hexChars[Math.floor(Math.random() * hexChars.length)];
    }
    return "E2801170"+rfid;
}