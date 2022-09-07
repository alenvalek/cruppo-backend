# Cruppo - Backend ![GitHub package.json version](https://img.shields.io/github/package-json/v/alenvalek/cruppo-backend) ![GitHub](https://img.shields.io/github/license/alenvalek/cruppo-backend) ![GitHub last commit](https://img.shields.io/github/last-commit/alenvalek/cruppo-backend) ![Maintenance](https://img.shields.io/maintenance/yes/2022) ![GitHub repo size](https://img.shields.io/github/repo-size/alenvalek/cruppo-backend) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/alenvalek/cruppo-backend)
Cruppo is a team management app built as a final year project at Faculty Of Informatics in Pula. The app itself is built using MongoDB as a database, ReactJS as a frontend library and express as a server solution. Cruppo's goal is to ease the pain of team work and team workflow in IT by making it easier to manage teams and their projects. It also helps HR department of any company by implementing a versitile ATS which can be customized to their needs. It helps narrow down applicants to only those relevant enough. 
***
## Demo
* Demo link: https://cruppo.netlify.app/
* Demo accounts: 

**[SUPER USER ACCOUNT]**<br>
**Email:** cruppo.noreply@gmail.com <br>
**Password:** test123

## Installation
Generate two separate folders, one for the client and one for the server
```
$ mkdir client server
```

Download or clone the frontend project into the client folder: 
```
$ git clone https://github.com/alenvalek/cruppo-frontend.git
```

Download or clone the backend project into the server folder:
```
$ git clone https://github.com/alenvalek/cruppo-backend.git
```

Create a .env file inside the server folder and fill it up with required values:
```
MONGO_URI = {your_mongo_uri}
SECRET_KEY = {your_secret_key}
PORT(optional) = {your_desired_port}
FRONTEND_URL = {your_frontend_url}
[FOR USE OF EMAIL NOTIFICATIONS AND CONFIRMATIONS]
COMPANY_GMAIL = {your_company_gmail}
GMAIL_APP_PASSWORD = {your_gmail_app_password}
```

Inside both server and client install the required modules: 
```
$ npm install
```

Run the server:
```
$ npm run dev
```

Run the client:
```
$ npm start
```
## Technologies
+ [React](https://reactjs.org/)
+ [MUI](https://mui.com)
+ [MongoDB](https://www.mongodb.com)
+ [Node.js](https://nodejs.org/)
+ [Express](https://expressjs.com)

## Useful links
+ [Cruppo frontend](https://github.com/alenvalek/cruppo-frontend)

## License
Cruppo is licensed under **MIT License** (https://www.mit.edu/~amini/LICENSE.md)

## More information coming soon..
