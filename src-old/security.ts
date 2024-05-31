import { IncomingMessage } from "http";
import jwt from 'jsonwebtoken';
import WebSocket from 'ws';

const SECRET_KEY = 'your_secret_key';

export function authenticateToken(req: IncomingMessage, callback: (err: Error | null, client: WebSocket | undefined) => void) {
    const token = req.headers['sec-websocket-protocol'];

    if (typeof token === 'string') {
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return callback(new Error('Unauthorized'), undefined);
            }
            (req as any).user = user;
            callback(null, undefined);
        });
    } else {
        callback(new Error('No token provided'), undefined)
    }
}