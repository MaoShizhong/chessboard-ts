import { Bishop } from '../pieces/bishop';
import { King } from '../pieces/king';
import { Knight } from '../pieces/knight';
import { Pawn } from '../pieces/pawn';
import { Queen } from '../pieces/queen';
import { Rook } from '../pieces/rook';
import { CastlingRights, Colour, PieceLetter, Row } from '../types';

const PIECES = {
    P: Pawn,
    p: Pawn,
    R: Rook,
    r: Rook,
    N: Knight,
    n: Knight,
    B: Bishop,
    b: Bishop,
    Q: Queen,
    q: Queen,
    K: King,
    k: King,
};

function isWhite(char: string): boolean {
    return char === char.toUpperCase();
}

export class FEN {
    static toChessRow(FENRow: string): Row {
        const chars = FENRow.split('');
        const row = chars.map((char) => {
            const colour = isWhite(char) ? 'w' : 'b';
            return Number(char)
                ? Array(Number(char)).fill(null)
                : new PIECES[char as PieceLetter](colour);
        });
        return row.flat();
    }

    static split(FENString: string): [string, Colour, CastlingRights] {
        const segments = FENString.split(' ');

        // throws if invalid FEN
        FEN.#validate(FENString, segments);

        const [position, activePlayer, castling] = segments;
        const castlingRights = {
            w: { short: false, long: false },
            b: { short: false, long: false },
        };

        if (castling.includes('K')) castlingRights.w.short = true;
        if (castling.includes('Q')) castlingRights.w.long = true;
        if (castling.includes('k')) castlingRights.b.short = true;
        if (castling.includes('q')) castlingRights.b.long = true;

        return [position, activePlayer as Colour, castlingRights];
    }

    static #validate(
        FENString: string,
        [position, activePlayer, castling]: string[]
    ): void {
        const ValidityError = new TypeError(
            `${FENString} is not a valid FEN string.`
        );

        // https://regexr.com/8at8b to test position regex
        const isPositionSegment =
            /^([rnbqkp1-8]{1,8}\/){7}[rnbqkp1-8]{1,8}$/i.test(position);
        // https://regexr.com/8at9u to test active player regex
        const isActivePlayer = /^(w|b)$/.test(activePlayer);
        // https://regexr.com/8at90 to test castling regex
        const isCastlingSegment = /^(-|K?Q?k?q?)$/.test(castling);

        if (!isPositionSegment || !isActivePlayer || !isCastlingSegment) {
            throw ValidityError;
        }

        // Checking if every row accounts for 8 squares exactly
        const rows = position.split('/');
        for (const row of rows) {
            const squares = row
                .split('')
                .map((char) =>
                    // convert single number to actual spaces
                    Number(char) ? Array(Number(char)).fill('') : char
                )
                .flat();

            if (squares.length !== 8) {
                throw ValidityError;
            }
        }
    }
}
