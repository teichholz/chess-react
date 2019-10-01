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
function indexInBetween(array, y, x) {
    return y >= 0 && y < array.length && x >= 0 && x < array[y].length;
}
function makeArray() {
    return Array(8).fill(false);
}
class Pawn extends Figure {
    constructor(type, team) {
        super(type, team);
        this.moveSet = this.moveSet;
        // Bauer kann sich beim ersten mal 2 Felder bewegen
        this.moved = false;
    }
    moveSet(position, board) {
        let possibleMoves = Array(8)
            .fill(null)
            .map(makeArray);
        const factor = this.team === "light" ? 1 : -1;

        const couldMove = this.pawnMove(
            position.y + 1 * factor,
            position.x,
            board,
            possibleMoves
        );
        if (!this.moved && couldMove) {
            this.moved = true;
            this.pawnMove(
                position.y + 2 * factor,
                position.x,
                board,
                possibleMoves
            );
        }
        this.pawnAttack(
            position.y + 1 * factor,
            position.x + 1 * factor,
            board,
            possibleMoves
        );
        this.pawnAttack(
            position.y + 1 * factor,
            position.x - 1 * factor,
            board,
            possibleMoves
        );

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
        let possible = Array(8)
            .fill(null)
            .map(makeArray);

        const y = position.y;
        const x = position.x;

        // Vertikal
        for (let v = y + 1; indexInBetween(board, v, x); v++) {
            if (!board[v][x]) {
                //An der Position ist keine Figur
                possible[v][x] = true;
            } else {
                if (this.team != board[v][x].team)
                    //Kein Frienly Fire
                    possible[v][x] = true;
                break;
            }
        }
        for (let v = y - 1; indexInBetween(board, v, x); v--) {
            if (!board[v][x]) {
                possible[v][x] = true;
            } else {
                if (this.team != board[v][x].team) possible[v][x] = true;
                break;
            }
        }
        //Horizontal
        for (let h = x + 1; indexInBetween(board, y, h); h++) {
            if (!board[y][h]) {
                possible[y][h] = true;
            } else {
                if (this.team != board[y][h].team) possible[y][h] = true;
                break;
            }
        }
        for (let h = x - 1; indexInBetween(board, y, h); h--) {
            if (!board[y][h]) {
                possible[y][h] = true;
            } else {
                if (this.team != board[y][h].team) possible[y][h] = true;
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
    moveSet(position, board) {
        let possible = Array(8)
            .fill(null)
            .map(makeArray);
        const i = position.y;
        const j = position.x;
        let turns = [
            [j - 1, i - 1],
            [j, i - 1],
            [j + 1, i - 1],
            [j + 1, i],
            [j + 1, i + 1],
            [j, i + 1],
            [j - 1, i + 1],
            [j - 1, i],
        ];

        for (let point of turns) {
            const x = point[0];
            const y = point[1];
            if (indexInBetween(board, y, x))
                if (board[y][x] == null) possible[y][x] = true;
                else if (this.team != board[y][x].team) possible[y][x] = true;
        }
        return possible;
    }
}
class Queen extends Figure {
    constructor(type, team) {
        super(type, team);
        this.moveSet = this.moveSet;
    }
    moveSet(position, board) {
        let possible = Array(8)
            .fill(null)
            .map(makeArray);
        const i = position.y;
        const j = position.x;
        let h, v;
        //Vertikal
        for (v = i + 1; indexInBetween(board, v, j); v++) {
            if (board[v][j] == null) {
                //An der Position ist keine Figur
                possible[v][j] = true;
            } else {
                if (this.team != board[v][j].team)
                    //Kein Frienly Fire
                    possible[v][j] = true;
                break;
            }
        }
        for (v = i - 1; indexInBetween(board, v, j); v--) {
            if (board[v][j] == null) {
                possible[v][j] = true;
            } else {
                if (this.team != board[v][j].team) possible[v][j] = true;
                break;
            }
        }
        //Horizontal
        for (h = j + 1; indexInBetween(board, i, h); h++) {
            if (board[i][h] == null) {
                possible[i][h] = true;
            } else {
                if (this.team != board[i][h].team) possible[i][h] = true;
                break;
            }
        }
        for (h = j - 1; indexInBetween(board, i, h); h--) {
            if (board[i][h] == null) {
                possible[i][h] = true;
            } else {
                if (this.team != board[i][h].team) possible[i][h] = true;
                break;
            }
        }

        //Nord-Ost
        for (v = i + 1, h = j + 1; indexInBetween(board, v, h); v++, h++) {
            if (board[v][h] == null) {
                //An der Position ist keine Figur
                possible[v][h] = true;
            } else {
                if (this.team != board[v][h].team)
                    //Kein Frienly Fire
                    possible[v][h] = true;
                break;
            }
        } //Nord-West
        for (v = i + 1, h = j - 1; indexInBetween(board, v, h); v++, h--) {
            if (board[v][h] == null) {
                possible[v][h] = true;
            } else {
                if (this.team != board[v][h].team) possible[v][h] = true;
                break;
            }
        }
        //Süd-Ost
        for (v = i - 1, h = j + 1; indexInBetween(board, v, h); v--, h++) {
            if (board[v][h] == null) {
                possible[v][h] = true;
            } else {
                if (this.team != board[v][h].team) possible[v][h] = true;
                break;
            }
        }
        //Süd-West
        for (v = i - 1, h = j - 1; indexInBetween(board, v, h); v--, h--) {
            if (board[v][h] == null) {
                possible[v][h] = true;
            } else {
                if (this.team != board[v][h].team) possible[v][h] = true;
                break;
            }
        }

        return possible;
    }
}
class Bishop extends Figure {
    constructor(type, team) {
        super(type, team);
        this.moveSet = this.moveSet;
    }
    moveSet(position, board) {
        let possible = Array(8)
            .fill(null)
            .map(makeArray);
        const i = position.y;
        const j = position.x;
        let h, v;
        //Nord-Ost
        for (v = i + 1, h = j + 1; indexInBetween(board, v, h); v++, h++) {
            if (board[v][h] == null) {
                //An der Position ist keine Figur
                possible[v][h] = true;
            } else {
                if (this.team != board[v][h].team)
                    //Kein Frienly Fire
                    possible[v][h] = true;
                break;
            }
        } //Nord-West
        for (v = i + 1, h = j - 1; indexInBetween(board, v, h); v++, h--) {
            if (board[v][h] == null) {
                possible[v][h] = true;
            } else {
                if (this.team != board[v][h].team) possible[v][h] = true;
                break;
            }
        }
        //Süd-Ost
        for (v = i - 1, h = j + 1; indexInBetween(board, v, h); v--, h++) {
            if (board[v][h] == null) {
                possible[v][h] = true;
            } else {
                if (this.team != board[v][h].team) possible[v][h] = true;
                break;
            }
        }
        //Süd-West
        for (v = i - 1, h = j - 1; indexInBetween(board, v, h); v--, h--) {
            if (board[v][h] == null) {
                possible[v][h] = true;
            } else {
                if (this.team != board[v][h].team) possible[v][h] = true;
                break;
            }
        }
        return possible;
    }
}
class Noble extends Figure {
    constructor(type, team) {
        super(type, team);
        this.moveSet = this.moveSet;
    }
    moveSet(position, board) {
        let possible = Array(8)
            .fill(null)
            .map(makeArray);
        const j = position.x;
        const i = position.y;

        const points = [
            { x: j + 1, y: i - 2 },
            { x: j - 1, y: i - 2 },
            { x: j + 1, y: i + 2 },
            { x: j - 1, y: i + 2 },
            { x: j + 2, y: i + 1 },
            { x: j + 2, y: i - 1 },
            { x: j - 2, y: i + 1 },
            { x: j - 2, y: i - 1 },
        ];
        for (let point of points) {
            if (indexInBetween(board, point.y, point.x))
                if (board[point.y][point.x] == null)
                    possible[point.y][point.x] = true;
                else if (this.team != board[point.y][point.x].team)
                    possible[point.y][point.x] = true;
        }

        return possible;
    }
}
