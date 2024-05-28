import jwt from 'jsonwebtoken';
const secretKey = '12dce25ed336afe45cdaf6e4b044bbbdfec2020bfac1483fdf9ac783fdbecaaa94c938d371e12fdfc2be0ca5794f51a8c58f1da027e2a0f21c4f8291c3b789e6'; // Replace with your actual secret key

export function generateToken(payload: string) {
    return jwt.sign(payload, secretKey);
}

export async function verifyToken(token: string) {
    try {
        return jwt.verify(token, secretKey);
    } catch (error) {
        return null;
    }
}
