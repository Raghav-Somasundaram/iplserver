const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

let currentPlayer = 'None';
let currentBid = 20;
let currentBidder = '';
let auctionState = 'Waiting...';

server.on('connection', (socket) => {
    console.log('A user connected.');

    socket.send(JSON.stringify({
        type: 'update',
        currentPlayer,
        currentBid,
        currentBidder,
        auctionState,
    }));

    socket.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'setPlayer') {
            currentPlayer = data.playerName || 'None';
            resetState();
        } else if (data.type === 'placeBid') {
            if (currentBid < 2500) {
                currentBid += currentBid < 200 ? 20 : 50;
                currentBidder = data.bidder;
            }
        } else if (data.type === 'callOnce') {
            auctionState = 'Going Once!';
        } else if (data.type === 'callTwice') {
            auctionState = 'Going Twice!';
        } else if (data.type === 'callSold') {
            auctionState = 'SOLD!';
        } else if (data.type === 'reset') {
            resetState();
        }

        broadcast();
    });
});

function resetState() {
    currentBid = 20;
    currentBidder = '';
    auctionState = 'Waiting...';
}

function broadcast() {
    const message = JSON.stringify({
        type: 'update',
        currentPlayer,
        currentBid,
        currentBidder,
        auctionState,
    });

    server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}
