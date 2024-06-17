import jwt from 'jsonwebtoken';
import { IncomingMessage } from 'node:http';
import { WebSocket } from 'ws';
import { Config } from '../types';

export const generateToken = (secretKey: string, payload: any = {}) => {
    return jwt.sign({...payload}, secretKey);
}

type AuthCallback = (err: Error | null, client: WebSocket | undefined) => void;

export const authenticateToken = (config: Config) => (req: IncomingMessage, callback: AuthCallback = () => { }) => {
    const token = req.headers['sec-websocket-protocol'];

    if (typeof token === 'string') {
        jwt.verify(token, config.secretKey, (err, decoded) => {
            if (err) {
                return callback(new Error('Unauthorized'), undefined);
            }
            (req as any).user = decoded;
            callback(null, undefined);
        });
    } else {
        callback(new Error('No token provided'), undefined);
    }
};