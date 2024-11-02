# GitLab Repositories Viewer with AI Chat

This project is a GitLab repository viewer that allows users to browse repositories, view detailed repository information, and interact with an AI chatbot that answers questions about each repository. Users can also edit and delete repository information, with changes simulated locally in a PostgreSQL database. Authentication is managed through GitLab OAuth, with a Redis-mocked cache to improve response times by caching repository data.

---

## Project Design Overview

This project was designed based on the latest project meeting, where we agreed on the functionality and direction. The main features include:
- **Repository Viewer**: Browse a list of GitLab repositories and select a repository to view more details.
- **AI Chatbot**: Ask questions about a repository, such as the number of branches, largest contributor, or a summary of the description.
- **Simulated Edits and Deletions**: Edit and delete repository details, which are simulated locally in PostgreSQL and not applied to GitLab.
- **Mocked Caching**: To minimize database requests, we use an in-memory cache service to store repository data temporarily, allowing for faster responses without repetitive database calls. I didn't go for a full redis implementation out of simplicity.

---

## Services and Components

### 1. **Mocked Cache**
- This project uses a custom, in-memory caching service that mimics Redis, storing repository data temporarily to avoid frequent database requests.
- Caches repository data when loaded and uses an expiration mechanism to clear old cache entries automatically.

### 2. **AI Chatbot**
- Powered by OpenAI, the chatbot is designed to answer questions specific to a repository. This includes questions about branches, contributors, and descriptions.
- Each question is contextual, answered based only on data related to the selected repository.

### 3. **Authentication Service**
- OAuth authentication with GitLab is implemented using GitLab’s OAuth API.
- GitLab access tokens are exchanged and stored in sessions to access the API securely.
- The service checks token validity and redirects to the login page if the token is invalid.

### 4. **Repository Viewer and Details Service**
- **Main Repository List**: Displays a list of repositories, supporting pagination and search.
- **Expanded Repository View**: Displays detailed repository information when a repository is selected. Users can delete branches, commits, or the repository itself and edit details like name and description.
- **Caching**: Repository details are cached when fetched, ensuring that only necessary database or GitLab API calls are made for updates.

---

## Installation Instructions

### 1. **Database Setup**
- Install PostgreSQL and create a database with the name `unframe`.
- Set up the schema by running the `schema.sql` file provided in the `config` directory, which creates tables for repositories, commits, and branches.

### 2. **Backend Setup**
- Clone the repository and navigate to the backend folder.
- Install dependencies:
  ```bash
  npm install
  ```
- Create a `.env` file in the backend directory and add the following environment variables:

  ```plaintext
  PORT=3000
  GITLAB_CLIENT_ID=<Your GitLab Client ID>
  GITLAB_CLIENT_SECRET=<Your GitLab Client Secret>
  GITLAB_REDIRECT_URI=http://localhost:3000/auth/gitlab/callback
  OPENAI_API_KEY=<Your OpenAI API Key>
  DB_HOST=<Your Database Host>
  DB_USER=<Your Database User>
  DB_PASSWORD=<Your Database Password>
  DB_DATABASE=unframe
  DB_PORT=5432
  SESSION_SECRET=<Your Session Secret>
  ```

- Start the backend server:
  ```bash
  node src/main.js
  ```

### 3. **Frontend Setup**
- Navigate to the frontend folder.
- Install dependencies:
  ```bash
  npm install
  ```
- Start the frontend development server:
  ```bash
  npm run dev
  ```

### 4. **Access the Application**
- Go to `http://localhost:5173` (frontend client) to access the application. You’ll be prompted to log in with GitLab.

---

## Testing the Project

Here are some example interactions to test the project:

1. **AI Questions**
    - Ask the AI questions about a repository:
        - “How many branches does this project have?”
        - “Who is the largest contributor?”
        - “Summarize the description for me.”

2. **Editing Repository Information**
    - Select a repository, edit details like name or description, and save changes. Note that these changes are simulated in the local PostgreSQL database.

3. **Deleting a Repository**
    - Select a repository and delete it. Confirm that the repository is removed from the list (though this action only affects local data).

4. **Testing Cache Performance**
    - Select a repository multiple times and observe that it loads faster due to caching.

---

## Future Improvements and Time Limitations

Due to time limitations, the following features are planned but not yet implemented:

- **Unit Tests for the Backend**: Add comprehensive tests for all backend functionalities.
- **Improved Pagination**: Save the initial page timestamp and ensure all pages show data created before that time for synchronized views.
- **Repository Search by ID**: Enable direct search by repository ID in addition to name.
- **Structured Commits and Branches**: Refine commit and branch data to support more structured views.
- **AI Chatbot History**: Save AI conversation history per repository for better user context.

---

## Conclusion

This project provides a user-friendly interface to interact with GitLab repositories, enriched by an AI chatbot for answering repository-specific questions. It employs efficient caching, authentication with GitLab, and a flexible simulated backend using PostgreSQL to simulate edits and deletions. Enjoy exploring your repositories with the help of AI!
