import { describe, it, expect } from 'vitest';
import { Chessboard, FILE, RANK } from './board';
import { Colour, Square } from '../types';

const STARTING_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

describe('Board', () => {
    it('Is 8x8', () => {
        const chessboard = new Chessboard(STARTING_POSITION);
        expect(chessboard.board.length).toBe(8);
        expect(chessboard.board.every((row) => row.length === 8)).toBe(true);
    });

    it('Starts with standard piece count', () => {
        const pieceCounts: {
            w: { [key: string]: number };
            b: { [key: string]: number };
        } = {
            w: { P: 8, N: 2, B: 2, R: 2, Q: 1, K: 1 },
            b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
        };

        const board = new Chessboard(STARTING_POSITION).board;
        board.forEach((row) => {
            row.forEach((square: Square) => {
                if (square === null) return;
                pieceCounts[square.colour][square.letter]--;
            });
        });

        function checkPieceCount(colour: Colour) {
            return Object.values(pieceCounts[colour]).every(
                (count) => count === 0
            );
        }
        expect(checkPieceCount('w')).toBe(true);
        expect(checkPieceCount('b')).toBe(true);
    });

    it('Starts with standard piece placement if no FEN passed in', () => {
        const startingBoard = [
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
        ];
        const actualBoard = new Chessboard(STARTING_POSITION).board.map((row) =>
            row.map((square: Square) => square && square.letter)
        );
        expect(actualBoard).toEqual(startingBoard);
    });

    it('Constructs board from FEN', () => {
        const najdorf = [
            ['r', 'n', 'b', 'q', 'k', 'b', null, 'r'],
            [null, 'p', null, null, 'p', 'p', 'p', 'p'],
            ['p', null, null, 'p', null, 'n', null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, 'N', 'P', null, null, null],
            [null, null, 'N', null, null, null, null, null],
            ['P', 'P', 'P', null, null, 'P', 'P', 'P'],
            ['R', null, 'B', 'Q', 'K', 'B', null, 'R'],
        ];
        const actualBoard1 = new Chessboard(
            'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R'
        ).board.map((row) =>
            row.map((square: Square) => square && square.letter)
        );
        expect(actualBoard1).toEqual(najdorf);

        const berlinDraw = [
            ['r', null, 'b', null, 'k', 'b', null, 'r'],
            ['p', 'p', 'p', null, null, 'p', 'p', 'p'],
            [null, null, null, 'q', null, null, null, null],
            [null, null, null, null, null, null, null, null],
            ['P', null, null, 'Q', null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, 'P', 'P', null, null, 'P', 'P', 'P'],
            ['R', 'N', 'B', null, null, 'R', 'K', null],
        ];
        const actualBoard2 = new Chessboard(
            'r1b1kb1r/ppp2ppp/3q4/8/P2Q4/8/1PP2PPP/RNB2RK1'
        ).board.map((row) =>
            row.map((square: Square) => square && square.letter)
        );
        expect(actualBoard2).toEqual(berlinDraw);
    });

    it('Can flip board orientation', () => {
        const chessboard = new Chessboard(STARTING_POSITION);
        expect(chessboard.board[7][3]?.letter).toBe('Q');
        expect(chessboard.board[0][3]?.letter).toBe('q');
        expect(chessboard.board[7][4]?.letter).toBe('K');
        expect(chessboard.board[0][4]?.letter).toBe('k');

        chessboard.flip();
        expect(chessboard.board[7][3]?.letter).toBe('k');
        expect(chessboard.board[0][3]?.letter).toBe('K');
        expect(chessboard.board[7][4]?.letter).toBe('q');
        expect(chessboard.board[0][4]?.letter).toBe('Q');

        chessboard.flip();
        expect(chessboard.board[7][3]?.letter).toBe('Q');
        expect(chessboard.board[0][3]?.letter).toBe('q');
        expect(chessboard.board[7][4]?.letter).toBe('K');
        expect(chessboard.board[0][4]?.letter).toBe('k');
    });
});

describe.skip('Valid moves', () => {
    it('Reports valid moves for piece if not blocked by anything', () => {
        const chessboard = new Chessboard(STARTING_POSITION);

        const a2PawnMoves = chessboard.getValidMoves(RANK[2], FILE.a);
        expect(a2PawnMoves).toEqual([
            [RANK[3], FILE.a],
            [RANK[4], FILE.a],
        ]);

        const f7PawnMoves = chessboard.getValidMoves(RANK[7], FILE.f);
        expect(f7PawnMoves).toEqual([
            [RANK[6], FILE.f],
            [RANK[5], FILE.f],
        ]);
    });

    it('Filters out squares off the board', () => {
        const chessboard = new Chessboard(STARTING_POSITION);

        const e1KingMoves = chessboard.getValidMoves(RANK[1], FILE.e);
        [
            [8, FILE.d],
            [8, FILE.e],
            [8, FILE.f],
        ].forEach((square) => {
            expect(e1KingMoves).not.toContainEqual(square);
        });

        const g1KnightMoves = chessboard.getValidMoves(RANK[1], FILE.e);
        [
            [9, FILE.f], // f-1
            [9, FILE.h], // h-1
            [8, FILE.e], // e0
            [8, 8], // i0
            [RANK[2], 8], // i2
        ].forEach((square) => {
            expect(g1KnightMoves).not.toContainEqual(square);
        });
    });

    it('Filters out squares occupied by piece of same colour', () => {
        const chessboard = new Chessboard(STARTING_POSITION);

        const c8BishopMoves = chessboard.getValidMoves(RANK[8], FILE.c);
        [
            [RANK[7], FILE.b],
            [RANK[7], FILE.d],
        ].forEach((square) => {
            expect(c8BishopMoves).not.toContainEqual(square);
        });

        const h1RookMoves = chessboard.getValidMoves(RANK[1], FILE.h);
        [
            [RANK[1], FILE.g],
            [RANK[2], FILE.h],
        ].forEach((square) => {
            expect(h1RookMoves).not.toContainEqual(square);
        });

        // Put white pawn on e3 - should not be capturable by white d2 pawn
        chessboard.board[RANK[3]][FILE.e] = chessboard.board[RANK[2]][FILE.e];
        const d2PawnMoves = chessboard.getValidMoves(RANK[2], FILE.d);
        expect(d2PawnMoves).not.toContainEqual([RANK[3], FILE.e]);
    });

    it('Does not filter out squares occupied by piece of opposite colour (capture available)', () => {
        const chessboard = new Chessboard(STARTING_POSITION);

        // Put white rook on h7 attacking black's g7 pawn and h8 rook
        chessboard.board[RANK[7]][FILE.h] = chessboard.board[RANK[1]][FILE.h];
        // Put black pawn on e3 - capturable by white d2 pawn
        chessboard.board[RANK[3]][FILE.e] = chessboard.board[RANK[7]][FILE.e];

        const rookMoves = chessboard.getValidMoves(RANK[8], FILE.c);
        [
            [RANK[7], FILE.g], // black g7 pawn
            [RANK[8], FILE.h], // black h8 rook
        ].forEach((square) => {
            expect(rookMoves).toContainEqual(square);
        });

        const d2PawnMoves = chessboard.getValidMoves(RANK[2], FILE.d);
        expect(d2PawnMoves).toContainEqual([RANK[3], FILE.e]);
    });
});
