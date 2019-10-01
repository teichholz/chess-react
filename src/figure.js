export function createFigure(type, team) {
    return dispatchFigureType(type, team);
}

function dispatchFigureType(type, team) {
    let figure;
    if (type === "pawn") figure = new Pawn(type, team);
    if (type === "rastle") figure = new Castle(type, team);
    if (type === "king") figure = new King(type, team);
    if (type === "queen") figure = new Queen(type, team);
    if (type === "bishop") figure = new Bishop(type, team);
    if (type === "noble") figure = new Noble(type, team);

    return figure;
}

// Bishop (Laeufer), (r)Castle, King, noble (Pferd), Pawn (Bauer), Queen
// dark, light
function dispatchFigurePath(type, team) {
    const te = team === "dark" ? "d" : "l";
    const ty = type.charAt(0);
    return `Chess_${ty}${te}t60.png`;
}

class Figure {
    constructor(type, team) {
        this.type = type;
        this.team = team;
        this.imgPath = dispatchFigurePath(type, team);
    }
}
function indexInBetween(array, y, x){
    return y >= 0 && y < array.length && x >= 0 && x < array[y].length;
}
class Pawn extends Figure {
    constructor(type, team) {
        super(type, team);
        this.moveSet = this.moveSet;
        // Bauer kann sich beim ersten mal 2 Felder bewegen
        this.moved = false;
    }
    moveSet(position, board) {
        let possibleMoves = Array(8).fill(Array(8).fill(false));
        // entscheidet in Welche Richtung entlang der Y-Achse der Bauer gehen kann
        // TODO unnoetige Komplexitaet + unschoen
        const factor = this.team === "light" ? 1 : -1;

        const couldMove = this.pawnMove(
            position.y + (1 * factor),
            position.x,
            board,
            possibleMoves
        );
        // if (!this.moved && couldMove) {
        //     this.moved = true;
        //     this.pawnMove(position.y + 2 * factor, position.x, board, possibleMoves);
        // }
        // this.pawnAttack(position.y + 1 * factor, position.x + 1 * factor, board, possibleMoves);
        // this.pawnAttack(position.y + 1 * factor, position.x - 1 * factor, board, possibleMoves);

        return possibleMoves;
    }

    pawnAttack(y, x, board, moves) {
        const t = x < board[0].length && y < board.length;
        const t2 = t && board[y][x] && board[y][x].team != this.team;
        if (t2) {
            moves[y][x] = true;
            return true;
        }
    }
    pawnMove(y, x, board, moves) {
        const t = x < board[0].length && y < board.length;
        const t2 = t && !board[y][x];
        if (t2) {
            console.log(moves);
            moves[y][x] = true;
            return moves;
        }
        return false;
    }
}
class Castle extends Figure {
    constructor(type, team) {
        super(type, team);
        this.moveSet = this.moveSet;
    }
    moveSet(position, board) {
        let possible = Array(8).fill(Array(8).fill(false));
        const y = position.y;
        const x = position.x;

        // Vertikal
        for (let v = y+1; indexInBetween(board, v, x); v++) {
            if (!board[v][x]) { //An der Position ist keine Figur
                possible[v][x] = true;
            } else {
                if (this.team != board[v][x].team) //Kein Frienly Fire
                    possible[v][x] = true;
                break;
            }
        }
        for (let v = y-1; indexInBetween(board, v, x); v--) {
            if (!board[v][x]) {
                possible[v][x] = true;
            } else {
                if (this.team != board[v][x].team)
                    possible[v][x] = true;
                break;
            }
        }
        //Horizontal
        for (let h = x+1; indexInBetween(board, y, h); h++) {
            if (!board[y][h]) {
                possible[y][h] = true;
            } else {
                if (this.team != board[y][h].team)
                    possible[y][h] = true;
                break;
            }
        }
        for (let h = x-1; indexInBetween(board, y, h); h--) {
            if (!board[y][h]) {
                possible[y][h] = true;
            } else {
                if (this.team != board[y][h].team)
                    possible[y][h] = true;
                break;
            }
        }


        return possible;
    }
}
class King extends Figure {
    constructor(type, team) {
        super(type, team);
        this.moveSet = this.moveSet;
    }
    moveSet(position) {
        let possibleMoves = Array(8).fill(Array(8).fill(false));
        possibleMoves = possibleMoves.map(function(row, rowIndex) {
            return row.map(function(cell, columnIndex) {
                if (rowIndex === position.y && columnIndex === position.x + 1)
                    return true;
                if (rowIndex === position.y && columnIndex === position.x - 1)
                    return true;
                if (rowIndex === position.y - 1 && columnIndex === position.x)
                    return true;
                if (rowIndex === position.y + 1 && columnIndex === position.x)
                    return true;
            });
        });
        return possibleMoves;
    }
}
class Queen extends Figure {
    constructor(type, team) {
        super(type, team);
        this.moveSet = this.moveSet;
    }
    moveSet(position) {
        let possibleMoves = Array(8).fill(Array(8).fill(false));
        possibleMoves = possibleMoves.map(function(row, rowIndex) {
            return row.map(function(cell, columnIndex) {
                // Wie Castle
                if (rowIndex === position.y) return true;
                if (columnIndex === position.x) return true;
                // Wie Bishop
                if (rowIndex + columnIndex === position.x + position.y)
                    return true;
                const difference = position.y - position.x;
                if (difference === rowIndex - columnIndex) return true;
            });
        });
        return possibleMoves;
    }
}
class Bishop extends Figure {
    constructor(type, team) {
        super(type, team);
        this.moveSet = this.moveSet;
    }
    moveSet(position) {
        let possibleMoves = Array(8).fill(Array(8).fill(false));
        possibleMoves = possibleMoves.map(function(row, rowIndex) {
            return row.map(function(cell, columnIndex) {
                if (rowIndex + columnIndex === position.x + position.y)
                    return true;
                const difference = position.y - position.x;
                if (difference === rowIndex - columnIndex) return true;
            });
        });
        return possibleMoves;
    }
}
class Noble extends Figure {
    constructor(type, team) {
        super(type, team);
        this.moveSet = this.moveSet;
    }
    moveSet(position) {
        let possibleMoves = Array(8).fill(Array(8).fill(false));
        const x = position.x;
        const y = position.y;

        possibleMoves = possibleMoves.map(function(row, rowIndex) {
            return row.map(function(cell, columnIndex) {
                if (
                    (rowIndex === y + 2 || rowIndex === y - 2) &&
                    (columnIndex === x + 1 || columnIndex === x - 1)
                )
                    return true;
                if (
                    (rowIndex === y + 1 || rowIndex === y - 1) &&
                    (columnIndex === x + 2 || columnIndex === x - 2)
                )
                    return true;
            });
        });

        return possibleMoves;
    }
}
