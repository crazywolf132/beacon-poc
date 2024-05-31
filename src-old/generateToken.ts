import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your_secret_key';
const user = { id: 1, name: "exampleUser" };

const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
console.log('Generated token: ', token);