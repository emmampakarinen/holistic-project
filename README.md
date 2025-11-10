# Holistic-project: ChargeMate
Smart EV charging recommendation system based on routes, preferences, and nearby amenities.

## Prerequisites
Before starting, make sure you have:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running  
- [Git](https://git-scm.com/downloads) installed  
- (Optional) Node.js 18+ and npm if you want to run the frontend directly outside Docker

## Repository structure
holistic-project/    
├── client/ # React + Vite frontend    
├── server/ # Flask backend    
├── ai/ # ML module     
├── db/ # MySQL schema & seed data     
├── infra/ # Docker Compose & environment files     
└── README.md    

## Quick start for local development (with Docker)

### 1. Clone the repo

```bash
git clone https://github.com/emmampakarinen/holistic-project
cd holistic-project
```
### 2. Create a local environment file
Copy the example .env file:
```bash
cd infra
cp .env.example .env
```

### 3. Verify .env contents
Your .env should look like this:
```bash
# Frontend
VITE_API_URL=http://localhost:5000/api

# MySQL (local Docker-only credentials)
MYSQL_DATABASE=holistic
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_ROOT_PASSWORD=root
MYSQL_HOST=db
MYSQL_PORT=3306

# Flask / SQLAlchemy
DATABASE_URL=mysql+pymysql://root:root@db:3306/holistic
```

### 4. Start the stack
Run everything from the infra/ folder:
```bash
docker compose up --build
```
Which will start the following with related URLs
| Service   | Description                 | URL                                                                  |
| --------- | --------------------------- | -------------------------------------------------------------------- |
| `client`  | React frontend (Vite + HMR) | [http://localhost:3000](http://localhost:3000)                       |
| `server`  | Flask backend API           | [http://localhost:5000/api/health](http://localhost:5000/api/health) |
| `db`      | MySQL database              | port **3306**                                                        |
| `adminer` | DB management UI            | [http://localhost:8080](http://localhost:8080)                       |


## Git workflow & collaboration
- Always branch off from `main`
```bash
git checkout main
git pull origin main
git checkout -b feature-N
```

- Branch naming convention    
Use the issue number as an identifier when creating a new branch:

```bash
feature-<ID>
```

- Open PR's before merging to main and open PR from your branch --> main
```bash
git push -u origin feature-N
```
