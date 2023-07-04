# redis-practice
A simple project to learn how to use Redis for session-mgt, an in-memory data store, rate-limiter, distributed caching, and as a message-queue

## Completed
- A user can signup (username, email, password, first name, and last name) and the data will be persisted on Redis Data Store
- A user can signing (email and password), the account is validated and a user session is created and managed using Redis
- A user can ping the application on `/ping` but is limited to 3 requests within 60 seconds
- A user can send an email on `/send-email` which is added to the queue, processed, and notifies users on completion or failure
- A user gets a unique id that is calculated and cached using Redis on `/` route
- A user can logout which destroys the users session
