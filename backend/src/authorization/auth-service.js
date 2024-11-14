import axios from 'axios';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

/**
 * Exchanges an authorization code for a GitLab access token.
 *
 * @param {string} code - The authorization code received from GitLab during OAuth.
 * @returns {Promise<string>} - The access token for accessing GitLab APIs.
 * @throws {Error} - Throws an error if the token exchange request fails.
 */
async function getGitlabToken(code) {
  try {
    const tokenResponse = await axios.post('https://gitlab.com/oauth/token', null, {
      params: {
        client_id: process.env.GITLAB_CLIENT_ID,
        client_secret: process.env.GITLAB_CLIENT_SECRET,
        redirect_uri: process.env.GITLAB_REDIRECT_URI,
        grant_type: 'authorization_code',
        code,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return tokenResponse.data.access_token;
  } catch (error) {
    console.error('Error fetching GitLab token:', error.response?.data || error.message);
    throw new Error('Failed to exchange code for GitLab access token');
  }
}

/**
 * Checks the validity of the access token stored in the session.
 *
 * @param {object} session - The session object, expected to contain the access token.
 * @returns {object} - An object indicating whether the token is valid (`{ valid: true }`) or not (`{ valid: false }`).
 */
function checkToken(session) {
  return session && session.access_token ? { valid: true } : { valid: false };
}

/**
 * Registers a new user in the database.
 *
 * @param {string} username - The desired username.
 * @param {string} password - The user's password.
 * @param {string|null} imageUrl - The URL/path of the uploaded image, if any.
 * @returns {Promise<Object>} - The registered user's information.
 * @throws {Error} - Throws an error if registration fails.
 */
async function register(username, password, imageUrl) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, password, image_url)
       VALUES ($1, $2, $3)
       RETURNING id, username, image_url`,
      [username, hashedPassword, imageUrl]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error registering user:', error);
    throw new Error('Registration failed');
  }
}

/**
 * Logs in an existing user.
 *
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise<Object|null>} - The logged-in user's information or `null` if authentication fails.
 * @throws {Error} - Throws an error if the login process fails.
 */
async function login(username, password) {
  try {
    const result = await pool.query(`SELECT * FROM users WHERE username = $1`, [username]);
    const user = result.rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      return { id: user.id, username: user.username, image_url: user.image_url };
    }
    return null;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw new Error('Login failed');
  }
}

export {
  getGitlabToken,
  checkToken,
  register,
  login,
};

export default {
  getGitlabToken,
  checkToken,
  register,
  login,
};
