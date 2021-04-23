# Flashpack Backend

This backend web server is directed toward teachers and students to produce flashcards for themselves or share in groups

## Technologies

![image](https://user-images.githubusercontent.com/37840393/115789346-fff91a00-a392-11eb-83cf-93367aa4f188.png)
![image](https://user-images.githubusercontent.com/37840393/115807053-dbfb0000-a3b5-11eb-91d5-1de16aa9c244.png)
![image](https://user-images.githubusercontent.com/37840393/115807129-fcc35580-a3b5-11eb-87bd-1ad0aea697d5.png)
![image](https://user-images.githubusercontent.com/37840393/115807536-cb975500-a3b6-11eb-903f-0c88b90dcf45.png)

- **TypeScript**: Superset of JavaScript that adds static type definitions
- **Node.js**: JavaScript runtime environment
- **NestJS**: Progressive Node.js framework for scalable server-side applications
- **PostgreSQL**: Open source relational database

## Installation

Install Postgresql (https://www.postgresql.org/)

Configure the database:
Create a database with a postgres user and at the required host (example 'localhost'). We call our database 'flashPack', however you can change this to whatever you like

Clone the repository:
```
git clone https://github.com/learnint/flashpack-backend.git
```
Change directory:
```
cd flashpack-backend
```
Add a .env file to the project root:
```
touch .env
```

Edit the .env file with the database connection details as keys like so:\
DATABASE_HOST=localhost\
DATABASE_PORT={port that the database runs on, postgres defaults to port 5432}\
DATABASE_USER={the postgres username}\
DATABASE_PASS={the password}\
DATABASE_SCHEMA={name of the database}\

Install dependencies:
```
npm i
```

## Usage

Run application:
```
npm start
```
