import authService from './auth-service.js';

/**
 * Initiates the GitLab OAuth authentication flow.
 * Redirects the user to GitLab's authorization URL to obtain an authorization code.
 *
 * @param {object} req - The request object, containing the query parameter `redirectUrl` for post-auth redirection.
 * @param {object} res - The response object used to redirect to GitLab's OAuth authorization URL.
 */
export function authenticateGitlabHandler(req, res, next) {
  try {
    let { redirectUrl } = req.query;
    if (!redirectUrl) {
      redirectUrl = `http://localhost:${process.env.PORT || 3000}/repositories`;
    }
    const gitlabAuthUrl = `https://gitlab.com/oauth/authorize?client_id=${process.env.GITLAB_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GITLAB_REDIRECT_URI)}&response_type=code&scope=read_api&state=${encodeURIComponent(redirectUrl)}`;
    res.redirect(gitlabAuthUrl);
  } catch (error) {
    next(error);
  }
}

/**
 * Handles the callback from GitLab after authentication.
 * Exchanges the authorization code for an access token and stores it in the session.
 * Redirects the user to the specified redirect URL or to the `/repositories` page by default.
 *
 * @param {object} req - The request object, containing the query parameters `code` (authorization code) and `state` (redirect URL).
 * @param {object} res - The response object, used to redirect to the appropriate page after authentication.
 */
export async function gitlabCallbackHandler(req, res, next) {
  const { code, state: redirectUrl } = req.query;

  try {
    if (!code) {
      throw new Error('Authorization code not provided');
    }

    req.session.access_token = await authService.getGitlabToken(code);
    res.redirect(redirectUrl || '/repositories');
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    next(error);
  }
}

/**
 * Checks the validity of the access token stored in the session.
 * Responds with a JSON object indicating whether the token is valid.
 *
 * @param {object} req - The request object, containing the session with the access token.
 * @param {object} res - The response object, used to send back a JSON result indicating token validity.
 */
export function checkTokenHandler(req, res, next) {
  try {
    const result = authService.checkToken(req.session);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Registers a new user.
 *
 * @param {object} req - The request object, containing `body` and `file`.
 * @param {object} res - The response object, used to send back the registered user.
 */
export async function registerHandler(req, res, next) {
  try {
    const { username, password } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const user = await authService.register(username, password, imageUrl);
    res.status(201).json(user);
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
}

/**
 * Logs in an existing user.
 *
 * @param {object} req - The request object, containing `body`.
 * @param {object} res - The response object, used to send back the logged-in user.
 */
export async function loginHandler(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await authService.login(username, password);

    if (user) {
      req.session.user = user;
      res.json(user);
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
}
