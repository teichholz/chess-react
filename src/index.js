import React, { useState, useEffect, setState } from "react";
import ReactDOM from "react-dom";
import "./index.sass";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { createFigure } from "./figure.js";

class Game extends React.Component {
    constructor(props) {
        super(props);
        const startBoard = Array(8)
            .fill(Array(8))
            .map(createRow);
        this.state = {
            board: [startBoard],
            // Das Square, das zuletzt angeklickt wurde
            selected: null,
            current: startBoard,
            possibleMoves: Array(8).fill(Array(8).fill(false)),
        };
        //TODO Board kopieren
        this.moveFigure = this.moveFigure.bind(this);
    }

    componentDidMount() {}

    // json in form von {x: 1, y: 1}
    moveFigure(position, cell) {
        const last = this.state.board.length - 1;
        if (this.state.selected) {
            // Keine Hints
            // Zustand zum zwischenspeichern der vorherigen Position
            const from = this.state.selected;
            const to = position;
            let copy = this.state.board[last].slice();
            // console.log(copy);
            // bewegt Figur zum Ziel
            copy[to.y][to.x] = copy[from.y][from.x];
            // Figur von Startfeld entfernen
            copy[from.y][from.x] = null;
            // Neues Board einfuegen
            this.setState({
                board: this.state.board.concat([copy]),
                current: this.state.board[last],
                selected: null,
                possibleMoves: Array(8).fill(Array(8).fill(false)),
            });
        } else {
            if (!this.state.board[last][position.y][position.x]) {
                console.log("Kein Figur befindet sich auf diesem Feld");
                return;
            }
            // Hints anzeigen
            console.log(this.possibleMoves);

            this.setState({
                selected: position,
                possibleMoves: this.state.board[last][position.y][
                    position.x
                ].moveSet(position, this.state.current),
            });
        }
    }

    // Prueft ob der Zug moeglich ist, wenn ja gibt es ein neues Board zurueck, mit der entsprechenden Aenderung
    validateWantedMove(from, to) {
        const current = this.state.current;
        const possibleMoves = this.state.possibleMoves;

        if(possibleMoves[to.y][to.x]){

        }
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
    // const moveFigure = figure
    //     ? props.moveFigure
    //     : () => {
    //           console.log("Auf diesem Feld befindet sich keine Figur");
    //       };

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

function createRow(row, index) {
    if (index > 1 && index < 6) return Array(8).fill(null);
    const team = index == 0 || index == 1 ? "light" : "dark";
    const line = index == 0 || index == 7 ? "back" : "front";
    if (line === "front")
        return [
            createFigure("pawn", team),
            createFigure("pawn", team),
            createFigure("pawn", team),
            createFigure("pawn", team),
            createFigure("pawn", team),
            createFigure("pawn", team),
            createFigure("pawn", team),
            createFigure("pawn", team),
        ];
    else
        return [
            createFigure("rastle", team),
            createFigure("noble", team),
            createFigure("bishop", team),
            createFigure("king", team),
            createFigure("queen", team),
            createFigure("bishop", team),
            createFigure("noble", team),
            createFigure("rastle", team),
        ];
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
