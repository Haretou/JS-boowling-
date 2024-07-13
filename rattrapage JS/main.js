const readline = require('readline');

// Définition des constantes
const MAX_PLAYERS = 6;
const MAX_FRAMES = 10;
const MAX_PINS = 10;

// Définition des structures de données
class Player {
    constructor(name) {
        this.name = name;
        this.score = 0;
        this.frames = [];
    }
}

class Frame {
    constructor(roll1, roll2) {
        this.roll1 = roll1;
        this.roll2 = roll2;
        this.score = 0;
    }
}

// lire l'entrée utilisateur
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, answer => resolve(answer)));
}

// Fonction pour demander le nombre de joueurs
async function askForPlayers() {
    let numPlayers;
    while (true) {
        const input = await askQuestion('Entrez le nombre de joueurs (entre 1 et 6) : ');
        numPlayers = parseInt(input);
        if (!isNaN(numPlayers) && numPlayers >= 1 && numPlayers <= MAX_PLAYERS) {
            break;
        }
        console.log('Erreur : le nombre de joueurs doit être entre 1 et 6.');
    }
    return numPlayers;
}

// Fonction pour demander le nom des joueurs
async function askForPlayerNames(numPlayers) {
    const players = [];
    for (let i = 0; i < numPlayers; i++) {
        const name = await askQuestion(`Entrez le nom du joueur ${i + 1} : `);
        players.push(new Player(name));
    }
    return players;
}

async function playFrame(player, frameNumber) {
    let roll1, roll2;
    while (true) {
        const input1 = await askQuestion(`${player.name}, combien de quilles avez-vous renversé au lancer 1 du frame ${frameNumber}? `);
        roll1 = parseInt(input1);
        if (!isNaN(roll1) && roll1 >= 0 && roll1 <= MAX_PINS) {
            break;
        }
        console.log('Erreur : le nombre de quilles doit être entre 0 et 10.');
    }

    if (roll1 === MAX_PINS) {
        return new Frame(roll1, 0); // Strike
    }

    while (true) {
        const input2 = await askQuestion(`${player.name}, combien de quilles avez-vous renversé au lancer 2 du frame ${frameNumber}? `);
        roll2 = parseInt(input2);
        if (!isNaN(roll2) && roll2 >= 0 && roll2 <= MAX_PINS - roll1) {
            break;
        }
        console.log(`Erreur : le nombre de quilles doit être entre 0 et ${MAX_PINS - roll1}.`);
    }

    return new Frame(roll1, roll2);
}

// Fonction pour calculer le score d'un joueur
function calculatePlayerScore(player) {
    player.score = 0;
    for (let i = 0; i < player.frames.length; i++) {
        const frame = player.frames[i];
        if (frame.roll1 === MAX_PINS) {
            // Strike
            if (i + 1 < player.frames.length) {
                const nextFrame = player.frames[i + 1];
                frame.score = MAX_PINS + nextFrame.roll1 + (nextFrame.roll2 !== 0 ? nextFrame.roll2 : (i + 2 < player.frames.length ? player.frames[i + 2].roll1 : 0));
            } else {
                frame.score = MAX_PINS;
            }
        } else if (frame.roll1 + frame.roll2 === MAX_PINS) {
            // Spare
            if (i + 1 < player.frames.length) {
                frame.score = MAX_PINS + player.frames[i + 1].roll1;
            } else {
                frame.score = MAX_PINS;
            }
        } else {
            frame.score = frame.roll1 + frame.roll2;
        }
        player.score += frame.score;
    }
}

// Fonction pour afficher le score final
function displayFinalScore(players) {
    console.log('Score final :');
    players.forEach(player => {
        console.log(`${player.name} : ${player.score}`);
    });
    const winner = players.reduce((a, b) => a.score > b.score ? a : b);
    console.log(`${winner.name} est le/la gagnant(e)!`);
}

async function main() {
    try {
        const numPlayers = await askForPlayers();
        const players = await askForPlayerNames(numPlayers);

        for (let frameNumber = 1; frameNumber <= MAX_FRAMES; frameNumber++) {
            console.log(`\nFrame ${frameNumber}`);
            for (const player of players) {
                const frame = await playFrame(player, frameNumber);
                player.frames.push(frame);
            }
        }

        players.forEach(calculatePlayerScore);
        displayFinalScore(players);
    } catch (error) {
        console.error(error);
    } finally {
        rl.close();
    }
}

main();