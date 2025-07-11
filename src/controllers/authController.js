import jwt from 'jsonwebtoken';
import axios from 'axios';
import settings from '../config/settings.js';
import logger from '../utils/logger.js';

export const authenticateUser = async (req, res) => {
    try {
        const { socket_id, channel_name } = req.body;

        // In production, verify with Laravel backend
        const response = await axios.post(`${settings.app.laravelUrl}/api/broadcasting/auth`, {
            socket_id,
            channel_name
        }, {
            headers: {
                'Authorization': req.headers.authorization,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        logger.error(`Authentication error: ${error.message}`);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

export const generateToken = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const token = jwt.sign(
            { id: userId },
            settings.app.secret,
            { expiresIn: settings.jwt.expiresIn, issuer: settings.jwt.issuer }
        );

        res.json({ token });
    } catch (error) {
        logger.error(`Token generation error: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};