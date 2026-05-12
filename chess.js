﻿const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let isWhiteTurn = true;

let selectedPiece = null;


const FENChar = {
    WhitePawn: "P",
    WhiteKnight: "N",
    WhiteBishop: "B",
    WhiteRook: "R",
    WhiteQueen: "Q",
    WhiteKing: "K",
    BlackPawn: "p",
    BlackKnight: "n",
    BlackBishop: "b",
    BlackRook: "r",
    BlackQueen: "q",
    BlackKing: "k"
};

//Sound

const pickPieceSound = new Audio('assets/sounds/pickPiece.mp3');

const checkmateSound = new Audio('assets/sounds/checkmate.mp3');

function playSoundOnCheckmate(selectedTile) {
    checkmateSound.play();
}

function playSoundOnTileChange(selectedTile) {
    if (!lastSelectedTile || lastSelectedTile.x !== selectedTile.x || lastSelectedTile.y !== selectedTile.y) {
        pickPieceSound.play();
        lastSelectedTile = selectedTile;
    }
}

//

const pieceImagePaths = {
    [FENChar.WhitePawn]: "assets/resourceImages/whitePawn.png",
    [FENChar.WhiteKnight]: "assets/resourceImages/whiteHorse.png",
    [FENChar.WhiteBishop]: "assets/resourceImages/whiteBishop.png",
    [FENChar.WhiteRook]: "assets/resourceImages/whiteTower.png",
    [FENChar.WhiteQueen]: "assets/resourceImages/whiteQueen.png",
    [FENChar.WhiteKing]: "assets/resourceImages/whiteKing.png",
    [FENChar.BlackPawn]: "assets/resourceImages/redPawn.png",
    [FENChar.BlackKnight]: "assets/resourceImages/redHorse.png",
    [FENChar.BlackBishop]: "assets/resourceImages/redBishop.png",
    [FENChar.BlackRook]: "assets/resourceImages/redTower.png",
    [FENChar.BlackQueen]: "assets/resourceImages/redQueen.png",
    [FENChar.BlackKing]: "assets/resourceImages/redKing.png"
};

let pieceImagesLoaded = {};
for (const piece in pieceImagePaths) {
    pieceImagesLoaded[piece] = new Image();
    pieceImagesLoaded[piece].src = pieceImagePaths[piece];
}

const tileBlack = new Image();
tileBlack.src = 'assets/resourceImages/tileRed.png';

const tileWhite = new Image();
tileWhite.src = 'assets/resourceImages/tileWhite.png';

const selectedTileImage = new Image();
selectedTileImage.src = 'assets/resourceImages/selectedTile.png';

const desiredWidth = 800;
const desiredHeight = 450;

function resizeCanvas() {
    const aspectRatio = desiredWidth / desiredHeight;

    if (window.innerWidth / window.innerHeight < aspectRatio) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth / aspectRatio;
    } else {
        canvas.height = window.innerHeight;
        canvas.width = window.innerHeight * aspectRatio;
    }
}

resizeCanvas();

window.addEventListener('resize', resizeCanvas);

const tileSize = 36;
const tileHeight = 36;
const gridWidth = 8;
const gridHeight = 8;

let hoveredTile = { x: -1, y: -1 };

let pieces = null

let selectedTile = null

let lastSelectedTile = null;

function playSoundOnTileChange(selectedTile) {
    if (!lastSelectedTile || lastSelectedTile.x !== selectedTile.x || lastSelectedTile.y !== selectedTile.y) {
        pickPieceSound.play();
        lastSelectedTile = selectedTile; // Update last selected tile
    }
}

function toIso(x, y) {
    const isoX = (x * 0.5 * tileSize) + (y * -0.5 * tileSize);
    const isoY = (x * 0.25 * tileHeight) + (y * 0.25 * tileHeight);
    return { x: isoX, y: isoY };
}

function toGrid(screenX, screenY) {
    const offsetX = canvas.width / 2;
    const offsetY = canvas.height / 4;

    const a = 0.5 * tileSize;
    const b = -0.5 * tileSize;
    const c = 0.25 * tileHeight;
    const d = 0.25 * tileHeight;

    const det = (1 / (a * d - b * c));

    const inv = {
        a: det * d,
        b: det * -b,
        c: det * -c,
        d: det * a,
    };

    const gridX = (screenX - offsetX) * inv.a + (screenY - offsetY) * inv.b;
    const gridY = (screenX - offsetX) * inv.c + (screenY - offsetY) * inv.d;

    return {
        x: Math.floor(gridX), y: Math.floor(gridY)
    };
}

function checkForKing() {
    let whiteKingPresent = false;
    let blackKingPresent = false;

    for (const piece of pieces) {
        if (piece.img === pieceImagesLoaded[FENChar.WhiteKing]) {
            whiteKingPresent = true;
        }
        if (piece.img === pieceImagesLoaded[FENChar.BlackKing]) {
            blackKingPresent = true;
        }
    }

    if (!whiteKingPresent || !blackKingPresent) {
        pieces = null;
        drawPieces();
        drawGrid();
        isWhiteTurn = true;
        playSoundOnCheckmate()
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const offsetX = canvas.width / 2;
    const offsetY = canvas.height / 4;

    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            const isoPos = toIso(x, y);
            const tileToDraw = (x + y) % 2 === 0 ? tileWhite : tileBlack;

            if (hoveredTile.x === x && hoveredTile.y === y && (
                !selectedTile || selectedTile.x !== x || selectedTile.y !== y
            )) {
                const highlightOffsetY = -5;
                const highlightScale = 1.1;

                ctx.drawImage(
                    tileToDraw,
                    offsetX + isoPos.x - (tileSize * highlightScale) / 2,
                    offsetY + isoPos.y + highlightOffsetY,
                    tileSize * highlightScale,
                    tileHeight * highlightScale
                );
            } else {
                ctx.drawImage(
                    tileToDraw,
                    offsetX + isoPos.x - tileSize / 2,
                    offsetY + isoPos.y,
                    tileSize,
                    tileHeight
                );
            }

            if (selectedTile && selectedTile.x === x && selectedTile.y == y) {
                ctx.drawImage(
                    selectedTileImage,
                    offsetX + isoPos.x - tileSize / 2,
                    offsetY + isoPos.y,
                    tileSize,
                    tileHeight
                );
            }
        }
    }
}

function drawPieces() {
    const offsetX = canvas.width / 2;
    const offsetY = canvas.height / 4;

    if (pieces == null) {
        pieces = [
            { img: pieceImagesLoaded[FENChar.BlackPawn], x: 0, y: 6 },
            { img: pieceImagesLoaded[FENChar.BlackPawn], x: 1, y: 6 },
            { img: pieceImagesLoaded[FENChar.BlackPawn], x: 2, y: 6 },
            { img: pieceImagesLoaded[FENChar.BlackPawn], x: 3, y: 6 },
            { img: pieceImagesLoaded[FENChar.BlackPawn], x: 4, y: 6 },
            { img: pieceImagesLoaded[FENChar.BlackPawn], x: 5, y: 6 },
            { img: pieceImagesLoaded[FENChar.BlackPawn], x: 6, y: 6 },
            { img: pieceImagesLoaded[FENChar.BlackPawn], x: 7, y: 6 },
            { img: pieceImagesLoaded[FENChar.BlackRook], x: 0, y: 7 },
            { img: pieceImagesLoaded[FENChar.BlackKnight], x: 1, y: 7 },
            { img: pieceImagesLoaded[FENChar.BlackBishop], x: 2, y: 7 },
            { img: pieceImagesLoaded[FENChar.BlackQueen], x: 4, y: 7 },
            { img: pieceImagesLoaded[FENChar.BlackKing], x: 3, y: 7 },
            { img: pieceImagesLoaded[FENChar.BlackBishop], x: 5, y: 7 },
            { img: pieceImagesLoaded[FENChar.BlackKnight], x: 6, y: 7 },
            { img: pieceImagesLoaded[FENChar.BlackRook], x: 7, y: 7 },

            { img: pieceImagesLoaded[FENChar.WhiteRook], x: 0, y: 0 },
            { img: pieceImagesLoaded[FENChar.WhiteKnight], x: 1, y: 0 },
            { img: pieceImagesLoaded[FENChar.WhiteBishop], x: 2, y: 0 },
            { img: pieceImagesLoaded[FENChar.WhiteQueen], x: 3, y: 0 },
            { img: pieceImagesLoaded[FENChar.WhiteKing], x: 4, y: 0 },
            { img: pieceImagesLoaded[FENChar.WhiteBishop], x: 5, y: 0 },
            { img: pieceImagesLoaded[FENChar.WhiteKnight], x: 6, y: 0 },
            { img: pieceImagesLoaded[FENChar.WhiteRook], x: 7, y: 0 },
            { img: pieceImagesLoaded[FENChar.WhitePawn], x: 0, y: 1 },
            { img: pieceImagesLoaded[FENChar.WhitePawn], x: 1, y: 1 },
            { img: pieceImagesLoaded[FENChar.WhitePawn], x: 2, y: 1 },
            { img: pieceImagesLoaded[FENChar.WhitePawn], x: 3, y: 1 },
            { img: pieceImagesLoaded[FENChar.WhitePawn], x: 4, y: 1 },
            { img: pieceImagesLoaded[FENChar.WhitePawn], x: 5, y: 1 },
            { img: pieceImagesLoaded[FENChar.WhitePawn], x: 6, y: 1 },
            { img: pieceImagesLoaded[FENChar.WhitePawn], x: 7, y: 1 }
        ];
    } else {
        checkForKing();
    }

    pieces = pieces.sort((a, b) => a.y - b.y);

    let newPieces = [], latestPiece = undefined;
    for (let i in pieces) {
        if (pieces[i].x === hoveredTile.x && pieces[i].y === hoveredTile.y) {
            latestPiece = pieces[i];
        } else {
            newPieces.push(pieces[i]);
        }
    }
    pieces = latestPiece ? [...newPieces, latestPiece] : [...newPieces];
    console.log(latestPiece ? [...newPieces] : [latestPiece, ...newPieces]);

    pieces.forEach(piece => {
        const isoPos = toIso(piece.x, piece.y);

        if (hoveredTile.x == piece.x && hoveredTile.y == piece.y && (
            !selectedTile || selectedTile.x !== piece.x || selectedTile.y !== piece.y
        )) {
            const highlightOffsetY = -25;
            const highlightScale = 1.1;

            ctx.drawImage(
                piece.img,
                offsetX + isoPos.x - (tileSize * highlightScale) / 2,
                offsetY + isoPos.y + highlightOffsetY,
                tileSize * highlightScale,
                tileHeight * highlightScale
            );
        } else {
            ctx.drawImage(
                piece.img,
                offsetX + isoPos.x - tileSize / 2,
                offsetY + isoPos.y - tileHeight / 2,
                tileSize,
                tileHeight
            );
        }
    });
}
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const newHoveredTile = toGrid(mouseX, mouseY);
    if (newHoveredTile.x !== hoveredTile.x || newHoveredTile.y !== hoveredTile.y) {
        hoveredTile = newHoveredTile;
        drawGrid();
        drawPieces();
    }
});

// Removed duplicate click handler - selection is now handled in the main click handler below

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////Movement Logic/////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function capturePiece(targetX, targetY) {
    pieces = pieces.filter(p => !(p.x === targetX && p.y === targetY));
}

function isSameColor(piece, targetX, targetY) {
    const targetPiece = pieces.find(p => p.x === targetX && p.y === targetY);
    if (!targetPiece) return false;

    const whitePieces = [
        FENChar.WhitePawn, FENChar.WhiteRook, FENChar.WhiteKnight,
        FENChar.WhiteBishop, FENChar.WhiteQueen, FENChar.WhiteKing
    ];

    const pieceChar = Object.keys(pieceImagesLoaded).find(k => pieceImagesLoaded[k] === piece.img);
    const targetChar = Object.keys(pieceImagesLoaded).find(k => pieceImagesLoaded[k] === targetPiece.img);

    const pieceIsWhite = whitePieces.includes(pieceChar);
    const targetIsWhite = whitePieces.includes(targetChar);

    return pieceIsWhite === targetIsWhite;
}

function isPathClear(startPos, endPos) {
    const { x: startX, y: startY } = startPos;
    const { x: endX, y: endY } = endPos;

    let deltaX = Math.sign(endX - startX);
    let deltaY = Math.sign(endY - startY);

    let x = startX + deltaX;
    let y = startY + deltaY;

    while (x !== endX || y !== endY) {
        if (getPieceAt({ x, y }) !== null) {
            return false;
        }
        x += deltaX;
        y += deltaY;
    }

    return true;
}

function makeMove(selectedPiece, targetSquare) {
    if (!canMoveThisTurn(selectedPiece)) {
        console.log("It's not this piece's turn.");
        return false;
    }

    const { x: targetX, y: targetY } = targetSquare;

    let isMoveValid = false;

    if (selectedPiece.img === pieceImagesLoaded[FENChar.WhitePawn] || selectedPiece.img === pieceImagesLoaded[FENChar.BlackPawn]) {
        isMoveValid = isPawnMoveValid(selectedPiece, targetX, targetY);
    } else if (selectedPiece.img === pieceImagesLoaded[FENChar.WhiteKnight] || selectedPiece.img === pieceImagesLoaded[FENChar.BlackKnight]) {
        isMoveValid = isKnightMoveValid(selectedPiece, targetX, targetY);
    } else if (selectedPiece.img === pieceImagesLoaded[FENChar.WhiteKing] || selectedPiece.img === pieceImagesLoaded[FENChar.BlackKing]) {
        isMoveValid = isKingMoveValid(selectedPiece, targetX, targetY);
    } else if (selectedPiece.img === pieceImagesLoaded[FENChar.WhiteQueen] || selectedPiece.img === pieceImagesLoaded[FENChar.BlackQueen]) {
        isMoveValid = isQueenMoveValid(selectedPiece, targetX, targetY);
    }

    if (!isMoveValid) {
        console.log("Move not allowed by piece movement rules.");
        return false;
    }

    // Si pasó todo, mover
    selectedPiece.x = targetX;
    selectedPiece.y = targetY;

    console.log("Move successful.");
    return true;
}

drawGrid();
drawPieces();

function isKingMoveValid(piece, targetX, targetY) {
    if (isSameColor(piece, targetX, targetY)) return false;

    if ((isWhiteTurn && piece.img !== pieceImagesLoaded[FENChar.WhiteKing]) ||
        (!isWhiteTurn && piece.img !== pieceImagesLoaded[FENChar.BlackKing])) {
        return false;
    }

    const dx = Math.abs(targetX - piece.x);
    const dy = Math.abs(targetY - piece.y);

    if (dx > 1 || dy > 1) return false;

    const targetPiece = pieces.find(p => p.x === targetX && p.y === targetY);
    if (targetPiece && !isSameColor(piece, targetX, targetY)) {
        capturePiece(targetX, targetY);
    }

    isWhiteTurn = !isWhiteTurn;
    return true;
}

function isQueenMoveValid(piece, targetX, targetY) {
    if (isSameColor(piece, targetX, targetY)) return false;

    if ((isWhiteTurn && piece.img !== pieceImagesLoaded[FENChar.WhiteQueen]) ||
        (!isWhiteTurn && piece.img !== pieceImagesLoaded[FENChar.BlackQueen])) {
        return false;
    }

    const dx = Math.abs(targetX - piece.x);
    const dy = Math.abs(targetY - piece.y);

    if (dx !== 0 && dy !== 0 && dx !== dy) return false;

    const xDirection = targetX > piece.x ? 1 : targetX < piece.x ? -1 : 0;
    const yDirection = targetY > piece.y ? 1 : targetY < piece.y ? -1 : 0;

    let x = piece.x + xDirection;
    let y = piece.y + yDirection;
    while (x !== targetX || y !== targetY) {
        if (pieces.some(p => p.x === x && p.y === y)) return false;
        x += xDirection;
        y += yDirection;
    }

    const targetPiece = pieces.find(p => p.x === targetX && p.y === targetY);
    if (targetPiece) {
        if (!isSameColor(piece, targetX, targetY)) {
            capturePiece(targetX, targetY);
        } else {
            return false;
        }
    }

    isWhiteTurn = !isWhiteTurn;
    return true;
}

function isBishopMoveValid(piece, targetX, targetY) {
    if (isSameColor(piece, targetX, targetY)) return false;

    if ((isWhiteTurn && piece.img !== pieceImagesLoaded[FENChar.WhiteBishop]) ||
        (!isWhiteTurn && piece.img !== pieceImagesLoaded[FENChar.BlackBishop])) {
        return false;
    }

    const dx = Math.abs(targetX - piece.x);
    const dy = Math.abs(targetY - piece.y);

    if (dx !== dy) return false;

    const xDirection = targetX > piece.x ? 1 : -1;
    const yDirection = targetY > piece.y ? 1 : -1;

    let x = piece.x + xDirection;
    let y = piece.y + yDirection;
    while (x !== targetX && y !== targetY) {
        if (pieces.some(p => p.x === x && p.y === y)) return false;
        x += xDirection;
        y += yDirection;
    }

    const targetPiece = pieces.find(p => p.x === targetX && p.y === targetY);
    if (targetPiece) {
        if (!isSameColor(piece, targetX, targetY)) {
            capturePiece(targetX, targetY);
        } else {
            return false;
        }
    }

    isWhiteTurn = !isWhiteTurn;
    return true;
}

function isRookMoveValid(piece, targetX, targetY) {
    if (isSameColor(piece, targetX, targetY)) return false;

    if ((isWhiteTurn && piece.img !== pieceImagesLoaded[FENChar.WhiteRook]) ||
        (!isWhiteTurn && piece.img !== pieceImagesLoaded[FENChar.BlackRook])) {
        return false;
    }

    if (piece.x !== targetX && piece.y !== targetY) {
        return false;
    }

    if (piece.x === targetX) {
        const minY = Math.min(piece.y, targetY);
        const maxY = Math.max(piece.y, targetY);
        for (let y = minY + 1; y < maxY; y++) {
            if (pieces.some(p => p.x === piece.x && p.y === y)) {
                return false;
            }
        }
    } else if (piece.y === targetY) {
        const minX = Math.min(piece.x, targetX);
        const maxX = Math.max(piece.x, targetX);
        for (let x = minX + 1; x < maxX; x++) {
            if (pieces.some(p => p.y === piece.y && p.x === x)) {
                return false;
            }
        }
    }

    isWhiteTurn = !isWhiteTurn;
    return true;
}

function isKnightMoveValid(piece, targetX, targetY) {
    if (isSameColor(piece, targetX, targetY)) return false;
    
    if ((isWhiteTurn && piece.img !== pieceImagesLoaded[FENChar.WhiteKnight]) ||
        (!isWhiteTurn && piece.img !== pieceImagesLoaded[FENChar.BlackKnight])) {
        return false;
    }

    const dx = Math.abs(targetX - piece.x);
    const dy = Math.abs(targetY - piece.y);

    if ((dx === 2 && dy === 1) || (dx === 1 && dy === 2)) {
        if (!isSameColor(piece, targetX, targetY)) {
            capturePiece(targetX, targetY);
        }
        isWhiteTurn = !isWhiteTurn;
        return true;
    }

    return false;
}

function isPawnMoveValid(piece, targetX, targetY) {
    if (isSameColor(piece, targetX, targetY)) return false;

    if (isWhiteTurn && piece.img !== pieceImagesLoaded[FENChar.WhitePawn]) {
        return false;
    } else if (!isWhiteTurn && piece.img !== pieceImagesLoaded[FENChar.BlackPawn]) {
        return false;
    }

    function isTileOccupied(x, y) {
        return pieces.some(p => p.x === x && p.y === y);
    }

    if (piece.img === pieceImagesLoaded[FENChar.WhitePawn]) {
        if (targetX === piece.x && targetY === piece.y + 1 && !isTileOccupied(targetX, targetY)) {
            isWhiteTurn = false;
            return true;
        }
        if (piece.y === 1 && targetX === piece.x && targetY === piece.y + 2) {
            if (!isTileOccupied(piece.x, piece.y + 1) && !isTileOccupied(targetX, targetY)) {
                isWhiteTurn = false;
                return true;
            }
        }
        if (Math.abs(targetX - piece.x) === 1 && targetY === piece.y + 1 && !isSameColor(piece, targetX, targetY)) {
            if (isTileOccupied(targetX, targetY)) {
                capturePiece(targetX, targetY);
                isWhiteTurn = false;
                return true;
            }
        }
    }
    else if (piece.img === pieceImagesLoaded[FENChar.BlackPawn]) {
        if (targetX === piece.x && targetY === piece.y - 1 && !isTileOccupied(targetX, targetY)) {
            isWhiteTurn = true;
            return true;
        }
        if (piece.y === 6 && targetX === piece.x && targetY === piece.y - 2) {
            if (!isTileOccupied(piece.x, piece.y - 1) && !isTileOccupied(targetX, targetY)) {
                isWhiteTurn = true;
                return true;
            }
        }
        if (Math.abs(targetX - piece.x) === 1 && targetY === piece.y - 1 && !isSameColor(piece, targetX, targetY)) {
            if (isTileOccupied(targetX, targetY)) {
                capturePiece(targetX, targetY);
                isWhiteTurn = true;
                return true;
            }
        }
    }

    return false;
}

function canMoveThisTurn(piece) {
    return (isWhiteTurn && piece.color === "white") || (!isWhiteTurn && piece.color === "black");
}

canvas.addEventListener('click', event => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const clickedTile = toGrid(mouseX, mouseY);

    if (clickedTile.x >= 0 && clickedTile.x < 8 && clickedTile.y >= 0 && clickedTile.y < 8) {
        playSoundOnTileChange(clickedTile);
    }

    if (clickedTile.x < 0 || clickedTile.x >= gridWidth || clickedTile.y < 0 || clickedTile.y >= gridHeight) {
        return;
    }

    // Update selectedTile to show visual selection
    selectedTile = clickedTile;

    if (!selectedPiece) {
        selectedPiece = pieces.find(piece => piece.x === clickedTile.x && piece.y === clickedTile.y);
    } else {
        const targetPiece = pieces.find(piece => piece.x === clickedTile.x && piece.y === clickedTile.y);
        let isMoveValid = false;

        if (selectedPiece.img === pieceImagesLoaded[FENChar.WhitePawn] || selectedPiece.img === pieceImagesLoaded[FENChar.BlackPawn]) {
            isMoveValid = isPawnMoveValid(selectedPiece, clickedTile.x, clickedTile.y);
        } else if (selectedPiece.img === pieceImagesLoaded[FENChar.WhiteRook] || selectedPiece.img === pieceImagesLoaded[FENChar.BlackRook]) {
            isMoveValid = isRookMoveValid(selectedPiece, clickedTile.x, clickedTile.y);
        } else if (selectedPiece.img === pieceImagesLoaded[FENChar.WhiteKnight] || selectedPiece.img === pieceImagesLoaded[FENChar.BlackKnight]) {
            isMoveValid = isKnightMoveValid(selectedPiece, clickedTile.x, clickedTile.y);
        } else if (selectedPiece.img === pieceImagesLoaded[FENChar.WhiteBishop] || selectedPiece.img === pieceImagesLoaded[FENChar.BlackBishop]) {
            isMoveValid = isBishopMoveValid(selectedPiece, clickedTile.x, clickedTile.y);
        } else if (selectedPiece.img === pieceImagesLoaded[FENChar.WhiteKing] || selectedPiece.img === pieceImagesLoaded[FENChar.BlackKing]) {
            isMoveValid = isKingMoveValid(selectedPiece, clickedTile.x, clickedTile.y);
        } else if (selectedPiece.img === pieceImagesLoaded[FENChar.WhiteQueen] || selectedPiece.img === pieceImagesLoaded[FENChar.BlackQueen]) {
            isMoveValid = isQueenMoveValid(selectedPiece, clickedTile.x, clickedTile.y);
        }

        if (isMoveValid) {
            const targetTileOccupied = pieces.some(piece => piece.x === clickedTile.x && piece.y === clickedTile.y);
            if (!targetTileOccupied) {
                selectedPiece.x = clickedTile.x;
                selectedPiece.y = clickedTile.y;
                selectedPiece = null;
                selectedTile = null; // Clear selection after successful move
            }
        } else {
            selectedPiece = null;
            // Keep selectedTile to show the clicked tile even if move is invalid
        }
    }

    drawGrid();
    drawPieces();
});


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

drawGrid();
drawPieces();