Backend Configuration:

For backend project, create a .env file in server folder.
And configure it with following variables:

- MONGO_URI = mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority  

- PORT = 3000
- JWT_SECRET
- JWT_EXPIRATION_TIME
- JWT_REFRESH_SECRET
- JWT_REFRESH_EXPIRATION_TIME
