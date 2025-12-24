const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// In-memory storage (use database for production)
const auctions = new Map();
const players = [
    // Star Players (Base Price: 2+ Cr)
    { id: 1, name: "Virat Kohli", role: "Batsman", nationality: "India", basePrice: 2, avatar: "VK", stats: { matches: 237, runs: 7263, avg: 38.65 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348498.png" },
    { id: 2, name: "Rohit Sharma", role: "Batsman", nationality: "India", basePrice: 2, avatar: "RS", stats: { matches: 257, runs: 6628, avg: 31.17 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348464.png" },
    { id: 3, name: "Jasprit Bumrah", role: "Bowler", nationality: "India", basePrice: 2, avatar: "JB", stats: { matches: 133, wickets: 165, economy: 7.26 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348423.png" },
    { id: 4, name: "MS Dhoni", role: "Wicket-keeper", nationality: "India", basePrice: 2, avatar: "MSD", stats: { matches: 264, runs: 5243, avg: 38.09 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348445.png" },
    { id: 5, name: "AB de Villiers", role: "Batsman", nationality: "South Africa", basePrice: 2, avatar: "ABD", stats: { matches: 184, runs: 5162, avg: 39.70 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348410.png" },
    
    // Premium Players (Base Price: 1.5 Cr)
    { id: 6, name: "Hardik Pandya", role: "All-rounder", nationality: "India", basePrice: 1.5, avatar: "HP", stats: { matches: 148, runs: 2556, wickets: 52 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348438.png" },
    { id: 7, name: "KL Rahul", role: "Wicket-keeper", nationality: "India", basePrice: 1.5, avatar: "KLR", stats: { matches: 132, runs: 4163, avg: 47.86 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348502.png" },
    { id: 8, name: "Rishabh Pant", role: "Wicket-keeper", nationality: "India", basePrice: 1.5, avatar: "RP", stats: { matches: 110, runs: 3284, avg: 35.31 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348460.png" },
    { id: 9, name: "Ravindra Jadeja", role: "All-rounder", nationality: "India", basePrice: 1.5, avatar: "RJ", stats: { matches: 240, runs: 2935, wickets: 146 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348442.png" },
    { id: 10, name: "David Warner", role: "Batsman", nationality: "Australia", basePrice: 1.5, avatar: "DW", stats: { matches: 184, runs: 6397, avg: 40.50 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348512.png" },
    { id: 11, name: "Glenn Maxwell", role: "All-rounder", nationality: "Australia", basePrice: 1.5, avatar: "GM", stats: { matches: 129, runs: 2691, wickets: 28 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348447.png" },
    { id: 12, name: "Pat Cummins", role: "Bowler", nationality: "Australia", basePrice: 1.5, avatar: "PC", stats: { matches: 54, wickets: 74, economy: 7.86 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348429.png" },
    { id: 13, name: "Jos Buttler", role: "Wicket-keeper", nationality: "England", basePrice: 1.5, avatar: "JB", stats: { matches: 107, runs: 3582, avg: 35.46 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348422.png" },
    { id: 14, name: "Ben Stokes", role: "All-rounder", nationality: "England", basePrice: 1.5, avatar: "BS", stats: { matches: 107, runs: 1805, wickets: 30 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348487.png" },
    { id: 15, name: "Andre Russell", role: "All-rounder", nationality: "West Indies", basePrice: 1.5, avatar: "AR", stats: { matches: 140, runs: 2395, wickets: 88 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348465.png" },
    
    // Quality Players (Base Price: 1 Cr)
    { id: 16, name: "Rashid Khan", role: "Bowler", nationality: "Afghanistan", basePrice: 1, avatar: "RK", stats: { matches: 119, wickets: 142, economy: 6.33 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348461.png" },
    { id: 17, name: "Kagiso Rabada", role: "Bowler", nationality: "South Africa", basePrice: 1, avatar: "KR", stats: { matches: 66, wickets: 93, economy: 8.45 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348459.png" },
    { id: 18, name: "Quinton de Kock", role: "Wicket-keeper", nationality: "South Africa", basePrice: 1, avatar: "QDK", stats: { matches: 94, runs: 2838, avg: 32.61 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348433.png" },
    { id: 19, name: "Trent Boult", role: "Bowler", nationality: "New Zealand", basePrice: 1, avatar: "TB", stats: { matches: 79, wickets: 104, economy: 8.16 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348419.png" },
    { id: 20, name: "Kane Williamson", role: "Batsman", nationality: "New Zealand", basePrice: 1, avatar: "KW", stats: { matches: 104, runs: 2838, avg: 38.35 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348515.png" },
    { id: 21, name: "Shubman Gill", role: "Batsman", nationality: "India", basePrice: 1, avatar: "SG", stats: { matches: 98, runs: 2790, avg: 32.43 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348477.png" },
    { id: 22, name: "Ishan Kishan", role: "Wicket-keeper", nationality: "India", basePrice: 1, avatar: "IK", stats: { matches: 92, runs: 2325, avg: 29.42 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348441.png" },
    { id: 23, name: "Suryakumar Yadav", role: "Batsman", nationality: "India", basePrice: 1, avatar: "SKY", stats: { matches: 145, runs: 3623, avg: 30.87 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348491.png" },
    { id: 24, name: "Shreyas Iyer", role: "Batsman", nationality: "India", basePrice: 1, avatar: "SI", stats: { matches: 115, runs: 3127, avg: 32.92 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348440.png" },
    { id: 25, name: "Mohammed Shami", role: "Bowler", nationality: "India", basePrice: 1, avatar: "MS", stats: { matches: 106, wickets: 127, economy: 9.03 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348475.png" },
    { id: 26, name: "Yuzvendra Chahal", role: "Bowler", nationality: "India", basePrice: 1, avatar: "YC", stats: { matches: 157, wickets: 205, economy: 7.79 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348425.png" },
    { id: 27, name: "Mitchell Starc", role: "Bowler", nationality: "Australia", basePrice: 1, avatar: "MS", stats: { matches: 41, wickets: 51, economy: 9.08 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348488.png" },
    { id: 28, name: "Sunil Narine", role: "All-rounder", nationality: "West Indies", basePrice: 1, avatar: "SN", stats: { matches: 162, runs: 1093, wickets: 180 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348452.png" },
    { id: 29, name: "Faf du Plessis", role: "Batsman", nationality: "South Africa", basePrice: 1, avatar: "FDP", stats: { matches: 111, runs: 2935, avg: 32.99 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348446.png" },
    { id: 30, name: "Jonny Bairstow", role: "Wicket-keeper", nationality: "England", basePrice: 1, avatar: "JB", stats: { matches: 46, runs: 1038, avg: 26.61 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348416.png" },
    
    // Rising Stars (Base Price: 0.5 Cr)
    { id: 31, name: "Axar Patel", role: "All-rounder", nationality: "India", basePrice: 0.5, avatar: "AP", stats: { matches: 115, runs: 898, wickets: 121 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348412.png" },
    { id: 32, name: "Washington Sundar", role: "All-rounder", nationality: "India", basePrice: 0.5, avatar: "WS", stats: { matches: 86, runs: 579, wickets: 85 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348511.png" },
    { id: 33, name: "Shardul Thakur", role: "All-rounder", nationality: "India", basePrice: 0.5, avatar: "ST", stats: { matches: 84, runs: 452, wickets: 86 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348476.png" },
    { id: 34, name: "Bhuvneshwar Kumar", role: "Bowler", nationality: "India", basePrice: 0.5, avatar: "BK", stats: { matches: 159, wickets: 181, economy: 7.23 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348421.png" },
    { id: 35, name: "Arshdeep Singh", role: "Bowler", nationality: "India", basePrice: 0.5, avatar: "AS", stats: { matches: 65, wickets: 76, economy: 9.03 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348411.png" },
    { id: 36, name: "Ruturaj Gaikwad", role: "Batsman", nationality: "India", basePrice: 0.5, avatar: "RG", stats: { matches: 66, runs: 2380, avg: 38.70 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348437.png" },
    { id: 37, name: "Prithvi Shaw", role: "Batsman", nationality: "India", basePrice: 0.5, avatar: "PS", stats: { matches: 76, runs: 1892, avg: 25.89 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348478.png" },
    { id: 38, name: "Ravi Bishnoi", role: "Bowler", nationality: "India", basePrice: 0.5, avatar: "RB", stats: { matches: 55, wickets: 63, economy: 7.36 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348418.png" },
    { id: 39, name: "Venkatesh Iyer", role: "All-rounder", nationality: "India", basePrice: 0.5, avatar: "VI", stats: { matches: 50, runs: 1326, wickets: 11 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348509.png" },
    { id: 40, name: "Avesh Khan", role: "Bowler", nationality: "India", basePrice: 0.5, avatar: "AK", stats: { matches: 63, wickets: 76, economy: 9.13 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348413.png" },
    
    // Young Prospects (Base Price: 0.25 Cr)
    { id: 41, name: "Yashasvi Jaiswal", role: "Batsman", nationality: "India", basePrice: 0.25, avatar: "YJ", stats: { matches: 36, runs: 1141, avg: 34.57 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348443.png" },
    { id: 42, name: "Tilak Varma", role: "Batsman", nationality: "India", basePrice: 0.25, avatar: "TV", stats: { matches: 46, runs: 1149, avg: 33.79 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348492.png" },
    { id: 43, name: "Abhishek Sharma", role: "All-rounder", nationality: "India", basePrice: 0.25, avatar: "AS", stats: { matches: 68, runs: 1174, wickets: 14 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348408.png" },
    { id: 44, name: "Rinku Singh", role: "Batsman", nationality: "India", basePrice: 0.25, avatar: "RS", stats: { matches: 54, runs: 893, avg: 42.52 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348463.png" },
    { id: 45, name: "Kuldeep Yadav", role: "Bowler", nationality: "India", basePrice: 0.25, avatar: "KY", stats: { matches: 84, wickets: 98, economy: 8.36 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348444.png" },
    { id: 46, name: "Umran Malik", role: "Bowler", nationality: "India", basePrice: 0.25, avatar: "UM", stats: { matches: 29, wickets: 32, economy: 10.07 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348448.png" },
    { id: 47, name: "Mayank Yadav", role: "Bowler", nationality: "India", basePrice: 0.25, avatar: "MY", stats: { matches: 4, wickets: 7, economy: 6.14 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348450.png" },
    { id: 48, name: "Rahul Tripathi", role: "Batsman", nationality: "India", basePrice: 0.25, avatar: "RT", stats: { matches: 95, runs: 2383, avg: 28.15 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348495.png" },
    { id: 49, name: "Nitish Rana", role: "Batsman", nationality: "India", basePrice: 0.25, avatar: "NR", stats: { matches: 102, runs: 2348, avg: 27.64 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348454.png" },
    { id: 50, name: "Mohsin Khan", role: "Bowler", nationality: "India", basePrice: 0.25, avatar: "MK", stats: { matches: 24, wickets: 24, economy: 9.08 }, photo: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/348400/348451.png" }
];

// Generate room code
function generateRoomCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// REST API Endpoints
app.get('/', (req, res) => {
    res.json({ message: 'IPL Auction Server Running' });
});

app.post('/api/create-room', (req, res) => {
    const { hostName, budget, maxTeams } = req.body;
    const roomCode = generateRoomCode();
    
    const auction = {
        roomCode,
        hostName,
        budget: budget || 100,
        maxTeams: maxTeams || 8,
        teams: [],
        players: players.map(p => ({ ...p, status: 'pending', soldTo: null, soldPrice: 0 })),
        currentPlayerIndex: 0,
        currentBid: 0,
        currentBidder: null,
        timerValue: 30,
        auctionActive: false,
        bidHistory: []
    };
    
    auctions.set(roomCode, auction);
    
    res.json({ roomCode, auction });
});

app.get('/api/room/:roomCode', (req, res) => {
    const auction = auctions.get(req.params.roomCode);
    if (!auction) {
        return res.status(404).json({ error: 'Room not found' });
    }
    res.json(auction);
});

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', ({ roomCode, teamName }) => {
        const auction = auctions.get(roomCode);
        
        if (!auction) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        if (auction.teams.length >= auction.maxTeams) {
            socket.emit('error', { message: 'Room is full' });
            return;
        }

        const team = {
            id: socket.id,
            name: teamName,
            budget: auction.budget,
            players: [],
            socketId: socket.id
        };

        auction.teams.push(team);
        socket.join(roomCode);
        
        // Send current state to all users in room
        io.to(roomCode).emit('auctionUpdate', auction);
        io.to(roomCode).emit('teamJoined', { team, totalTeams: auction.teams.length });
        
        console.log(`${teamName} joined room ${roomCode}`);
    });

    socket.on('startBidding', ({ roomCode }) => {
        const auction = auctions.get(roomCode);
        if (!auction) return;

        const currentPlayer = auction.players[auction.currentPlayerIndex];
        if (!currentPlayer || currentPlayer.status !== 'pending') return;

        auction.auctionActive = true;
        auction.timerValue = 30;
        auction.currentBid = currentPlayer.basePrice;
        auction.currentBidder = null;
        auction.bidHistory = [];

        io.to(roomCode).emit('auctionUpdate', auction);
        
        // Start timer
        startTimer(roomCode);
    });

    socket.on('placeBid', ({ roomCode, bidAmount }) => {
        const auction = auctions.get(roomCode);
        if (!auction || !auction.auctionActive) return;

        const team = auction.teams.find(t => t.socketId === socket.id);
        if (!team) return;

        // Validate bid
        if (bidAmount <= auction.currentBid) {
            socket.emit('error', { message: 'Bid must be higher than current bid' });
            return;
        }

        if (bidAmount > team.budget) {
            socket.emit('error', { message: 'Insufficient budget' });
            return;
        }

        // Update bid
        auction.currentBid = bidAmount;
        auction.currentBidder = team.id;
        auction.timerValue = 30; // Reset timer

        // Add to history
        auction.bidHistory.unshift({
            teamName: team.name,
            amount: bidAmount,
            timestamp: new Date().toISOString()
        });

        io.to(roomCode).emit('auctionUpdate', auction);
    });

    socket.on('markSold', ({ roomCode }) => {
        const auction = auctions.get(roomCode);
        if (!auction) return;

        if (!auction.currentBidder) {
            socket.emit('error', { message: 'No bids placed' });
            return;
        }

        const player = auction.players[auction.currentPlayerIndex];
        const team = auction.teams.find(t => t.id === auction.currentBidder);

        player.status = 'sold';
        player.soldTo = team.id;
        player.soldPrice = auction.currentBid;

        team.budget -= auction.currentBid;
        team.players.push(player);

        auction.auctionActive = false;
        clearTimer(roomCode);

        io.to(roomCode).emit('playerSold', { player, team });
        io.to(roomCode).emit('auctionUpdate', auction);

        // Auto move to next player after 2 seconds
        setTimeout(() => {
            moveToNextPlayer(roomCode);
        }, 2000);
    });

    socket.on('markUnsold', ({ roomCode }) => {
        const auction = auctions.get(roomCode);
        if (!auction) return;

        const player = auction.players[auction.currentPlayerIndex];
        player.status = 'unsold';

        auction.auctionActive = false;
        clearTimer(roomCode);

        io.to(roomCode).emit('playerUnsold', { player });
        io.to(roomCode).emit('auctionUpdate', auction);

        // Auto move to next player after 2 seconds
        setTimeout(() => {
            moveToNextPlayer(roomCode);
        }, 2000);
    });

    socket.on('nextPlayer', ({ roomCode }) => {
        moveToNextPlayer(roomCode);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Remove team from all auctions
        auctions.forEach((auction, roomCode) => {
            const teamIndex = auction.teams.findIndex(t => t.socketId === socket.id);
            if (teamIndex !== -1) {
                const team = auction.teams[teamIndex];
                auction.teams.splice(teamIndex, 1);
                io.to(roomCode).emit('teamLeft', { teamName: team.name });
                io.to(roomCode).emit('auctionUpdate', auction);
            }
        });
    });
});

// Timer management
const timers = new Map();

function startTimer(roomCode) {
    clearTimer(roomCode);
    
    const timerId = setInterval(() => {
        const auction = auctions.get(roomCode);
        if (!auction || !auction.auctionActive) {
            clearTimer(roomCode);
            return;
        }

        auction.timerValue--;
        io.to(roomCode).emit('timerUpdate', { timerValue: auction.timerValue });

        if (auction.timerValue <= 0) {
            clearTimer(roomCode);
            autoSellPlayer(roomCode);
        }
    }, 1000);

    timers.set(roomCode, timerId);
}

function clearTimer(roomCode) {
    const timerId = timers.get(roomCode);
    if (timerId) {
        clearInterval(timerId);
        timers.delete(roomCode);
    }
}

function autoSellPlayer(roomCode) {
    const auction = auctions.get(roomCode);
    if (!auction) return;

    if (auction.currentBidder) {
        // Mark as sold
        const player = auction.players[auction.currentPlayerIndex];
        const team = auction.teams.find(t => t.id === auction.currentBidder);

        player.status = 'sold';
        player.soldTo = team.id;
        player.soldPrice = auction.currentBid;

        team.budget -= auction.currentBid;
        team.players.push(player);

        io.to(roomCode).emit('playerSold', { player, team });
    } else {
        // Mark as unsold
        const player = auction.players[auction.currentPlayerIndex];
        player.status = 'unsold';

        io.to(roomCode).emit('playerUnsold', { player });
    }

    auction.auctionActive = false;
    io.to(roomCode).emit('auctionUpdate', auction);

    setTimeout(() => {
        moveToNextPlayer(roomCode);
    }, 2000);
}

function moveToNextPlayer(roomCode) {
    const auction = auctions.get(roomCode);
    if (!auction) return;

    auction.currentPlayerIndex++;
    auction.currentBid = 0;
    auction.currentBidder = null;
    auction.bidHistory = [];
    auction.auctionActive = false;

    if (auction.currentPlayerIndex >= auction.players.length) {
        io.to(roomCode).emit('auctionComplete', auction);
    } else {
        io.to(roomCode).emit('auctionUpdate', auction);
    }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
