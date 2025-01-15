import { Chessboard, RANK } from '../board/board';
import { Colour, PieceLetter, PlayerCastlingRights } from '../types';
import * as algebraic from '../parsers/algebraic';

export class Player {
    colour: Colour;
    castlingRights: PlayerCastlingRights;
    #board: Chessboard;

    constructor(
        colour: Colour,
        castlingRights: PlayerCastlingRights,
        board: Chessboard
    ) {
        this.colour = colour;
        this.castlingRights = castlingRights;
        this.#board = board;
    }

    move(destination: string): void {
        const moves = algebraic.parse(destination);
        const isCastling = moves.length === 2;

        for (const pieceToMove of moves) {
            if (isCastling) {
                pieceToMove.destination[0] =
                    this.colour === 'w' ? RANK[1] : RANK[8];
            }
            if (this.colour === 'b') {
                pieceToMove.piece.letter = <PieceLetter>(
                    pieceToMove.piece.letter.toLowerCase()
                );
            }
            this.#board.move(pieceToMove);
        }
    }
}
