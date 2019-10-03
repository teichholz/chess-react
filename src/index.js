import React, { useState, useEffect, setState } from "react";
import ReactDOM from "react-dom";
import "./index.sass";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { createFigure } from "./figure.js";

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lightTeam: [],
            darkTeam: [],
            board: null,
            selected: null,
            current: null,
            possibleMoves: Array(8).fill(Array(8).fill(false)),
            lightKing: null,
            darkKing: null,
        };
        const startBoard = Array(8)
            .fill(null)
            .map(this.createRow, this);
        this.state.board = [startBoard];
        this.state.current = startBoard;
        this.state.lightKing = startBoard[0][3];
        this.state.darkKing = startBoard[7][3];
        //TODO Board kopieren
        this.moveFigure = this.moveFigure.bind(this);
        this.escapeFunction = this.escapeFunction.bind(this);
    }

    escapeFunction(event) {
        if (event.keyCode === 27) {
            this.setState({
                selected: null,
                possibleMoves: Array(8).fill(Array(8).fill(false)),
            });
        }
    }
    createRow(row, index) {
        if (index > 1 && index < 6) return Array(8).fill(null);
        const team = index == 0 || index == 1 ? "light" : "dark";
        const line = index == 0 || index == 7 ? "back" : "front";
        if (line === "front") {
            const front = [
                createFigure("pawn", team),
                createFigure("pawn", team),
                createFigure("pawn", team),
                createFigure("pawn", team),
                createFigure("pawn", team),
                createFigure("pawn", team),
                createFigure("pawn", team),
                createFigure("pawn", team),
            ];
            return front;
        } else {
            const back = [
                createFigure("rastle", team),
                createFigure("noble", team),
                createFigure("bishop", team),
                createFigure("king", team),
                createFigure("queen", team),
                createFigure("bishop", team),
                createFigure("noble", team),
                createFigure("rastle", team),
            ];
            return back;
        }
    }

    componentDidMount() {
        this.state.current.map((row, rIndex) => {
            row.map((cell, cIndex) => {
                if (cell) {
                    cell.position = { y: rIndex, x: cIndex };
                }
            });
        });

        const light = new Set(
            this.state.current[0].concat(this.state.current[1])
        );
        const dark = new Set(
            this.state.current[6].concat(this.state.current[7])
        );

        this.setState({
            lightTeam: light,
            darkTeam: dark,
        });

        document.addEventListener("keydown", (event) => {
            this.escapeFunction(event)
        }, false);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", (event) => {
            this.escapeFunction(event)
        }, false);
    }

    // json in form von {x: 1, y: 1}
    moveFigure(position, cell) {
        const last = this.state.board.length - 1;
        // hot swapping, schnelle wechseln der Figur des gleichen teams
        if (
            this.state.selected &&
            this.state.current[position.y][position.x] &&
            this.state.current[position.y][position.x].team ==
                this.state.current[this.state.selected.y][this.state.selected.x]
                    .team
        ) {
            this.setState({
                selected: position,
                possibleMoves: this.state.board[last][position.y][
                    position.x
                ].moveSet(position, this.state.current),
            });
            // Kann die Figur bewegt werden?
        } else if (this.state.selected) {
            // Zustand zum zwischenspeichern der vorherigen Position
            const from = this.state.selected;
            const to = position;

            const change = this.performMoveWhenPossible(from, to);

            if (change) {
                this.setState({
                    board: this.state.board.concat([change]),
                    current: this.state.board[last],
                    selected: null,
                    possibleMoves: Array(8).fill(Array(8).fill(false)),
                });
            } else {
                console.log("Kein valider Schachzug");
                this.setState({
                    selected: null,
                    possibleMoves: Array(8).fill(Array(8).fill(false)),
                });
            }
            // Erste anklicken einer Figur
        } else {
            if (!this.state.board[last][position.y][position.x]) {
                console.log("Kein Figur befindet sich auf diesem Feld");
                return;
            }
            // Hints anzeigen
            // console.log(this.possibleMoves);

            this.setState({
                selected: position,
                possibleMoves: this.state.board[last][position.y][
                    position.x
                ].moveSet(position, this.state.current),
            });
        }
    }

    // Prueft ob der Zug moeglich ist, wenn ja gibt es ein neues Board zurueck, mit der entsprechenden Aenderung
    performMoveWhenPossible(from, to) {
        // shallow copy des Array
        const current = this.state.current.slice(0);
        const possibleMoves = this.state.possibleMoves;
        const figure = current[from.y][from.x];
        const enemy = current[to.y][to.x];
        const friendTeamSet =
            figure.team == "light" ? this.state.lightTeam : this.state.darkTeam;
        const enemyTeam = figure.team == "light" ? "dark" : "light";
        if (possibleMoves[to.y][to.x]) {
            // Bauer kann nur einmal am Anfang 2 Felder ziehen
            if (figure.type == "pawn") figure.moved = true;
            // Aktualisieren der Positionen der Koenig
            // if (figure.type == "king")
            //     if (figure.team == "light")
            //         this.setState({
            //             lightKing: to,
            //         });
            //     else
            //         this.setState({
            //             darkKing: to,
            //         });

            // Positon der Figur aktualisieren
            figure.position = to;
            // Figur aus set loeschen, wenn diese geschlagen wird
            if (enemy)
                if (enemy.team == "light") this.state.lightTeam.delete(enemy);
                else this.state.darkTeam.delete(enemy);

            current[to.y][to.x] = current[from.y][from.x];
            current[from.y][from.x] = null;

            if (this.check(enemyTeam, current, friendTeamSet)) {
                if (this.checkmate(enemyTeam, current)) {
                    console.log(enemyTeam + " hat verloren!");
                }
            }
            return current;
        }
        return false;
    }

    // prueft fuer team, ob der Koenig bedroht ist
    check(team, boardState, enemyTeamSet) {
        // const enemy =
        //     team == "light" ? this.state.darkTeam : this.state.lightTeam;
        const king =
            team == "light"
                ? this.state.lightKing.position
                : this.state.darkKing.position;

        for (let en of enemyTeamSet.entries()) {
            const e = en[0];
            if (e.moveSet(e.position, boardState)[king.y][king.x]) {
                // console.log("Der Koenig von " + team + " steht im Schach");
                // console.log("Grund dafuer ist:");
                // console.log(e);
                return true;
            }
        }
        return false;
    }

    checkmate(team, boardState) {
        // Schachmat ist wenn:
        // - Man Schach
        // - Es keine Figur im eigenen Team, die mit einem beliebigen Zug, Voraussetzung Nummer 1 verhindern kann

        // Naiver Ansatz:
        // Fuer jede Figur im eigenem Team, fuer jeden moeglichen Zug dieser Figur, pruefe ob man immer noch im Schach ist
        const friends =
            team == "light" ? this.state.lightTeam : this.state.darkTeam;
        const enemies =
            team == "light" ? this.state.darkTeam : this.state.lightTeam;

        for (let f of friends.entries()) {
            const friend = f[0];
            // console.log('Pruefe moveSet von:');
            // console.log(friend);
            const possible = friend.moveSet(friend.position, boardState);
            const figurePos = friend.position;
            const canHinder = possible.reduce((previous, current, rowIndex) => {
                return (
                    previous ||
                    current.reduce((previous, current, colIndex, array) => {
                        if (array[colIndex]) {
                            // console.log("Figure hat eine Zugmoeglichkeit:");
                            // console.log(friend);
                            let probe = Array(boardState.length).fill(null);
                            let probeSet = new Set(enemies);
                            // console.log(probeSet);
                            // shallow copy von 2d array
                            probe = probe.map((row, index) => {
                                return boardState[index].slice(0);
                            });
                            if (probe[rowIndex][colIndex]) {
                                probeSet.delete(probe[rowIndex][colIndex]);
                            }
                            probe[rowIndex][colIndex] = friend;
                            probe[figurePos.y][figurePos.x] = null;

                            friend.position = { y: rowIndex, x: colIndex };

                            if (friend.type == "king") {
                                console.log("Probe vom King");
                                console.log(probe);
                                console.log("Ergebnis von check(probe)");
                                console.log(this.check(team, probe, probeSet));
                            }

                            return (
                                !this.check(team, probe, probeSet) || previous
                            );
                        }
                        return false || previous;
                    }, false)
                );
            }, false);

            if (canHinder) {
                return false;
            } else {
                friend.position = figurePos;
            }
        }
        return true;
    }

    render() {
        return (
            <div className="Game">
                <Board
                    board={this.state.current}
                    moveHint={this.state.possibleMoves}
                    moveFigure={this.moveFigure}
                ></Board>
            </div>
        );
    }
}

function Board(props) {
    const moveHint = props.moveHint;
    // Erzeugt aus Objkekten Squares
    function mapRows() {
        let even = false;

        const board = props.board.map((row, rowIndex) => {
            even = !even;
            return (
                <div className="Row" key={"r" + rowIndex}>
                    {row.map((cell, columnIndex) => {
                        even = !even;
                        return (
                            <Square
                                position={{ x: columnIndex, y: rowIndex }}
                                moveFigure={props.moveFigure}
                                even={even ? "even" : "odd"}
                                moveHint={
                                    moveHint[rowIndex][columnIndex]
                                        ? "Hint"
                                        : "NoHint"
                                }
                                square={cell}
                                key={"s" + columnIndex}
                            ></Square>
                        );
                    })}
                </div>
            );
        });
        return board;
    }

    return <div className="Board">{mapRows()}</div>;
}

function Square(props) {
    // ist null, wenn auf dem Square keine Figur steht
    const figure = props.square;
    const img =
        figure && figure.imgPath ? (
            <img alt="" src={"/figures/" + figure.imgPath} />
        ) : (
            <img alt="" src="" />
        );

    const moveFigure = props.moveFigure;

    return (
        <div
            onClick={event => {
                moveFigure(props.position, null);
            }}
            className={`Square ${props.even} ${props.moveHint}`}
        >
            {img}
        </div>
    );
}

ReactDOM.render(<Game />, document.getElementById("root"));

// function Row(props) {
//     function mapSquares() {
//         let even = props.even;
//         return props.row.map((cell, index) => {
//             even = !even;
//             return (
//                 <Square
//                     moveFigure={props.moveFigure}
//                     even={even ? "even" : "odd"}
//                     square={cell}
//                     key={"s" + index}
//                 ></Square>
//             );
//         });
//     }

//     return <div className="Row">{mapSquares()}</div>;
// }
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
