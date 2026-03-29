# BSMW Insurance Brokers — Client Portal
### Net Zero Hosting | Project B | Full-Stack Rescue

A full-stack web application built as a digital rescue for Barber Stewart McVittie & Wallace Insurance Brokers, a Kingston, Ontario brokerage operating since 1880. The original site was a static brochure with no client interaction, no quote system, and no online presence worth speaking of. This app replaces it with a dynamic, database-driven platform.


## What the App Does

**Public-facing site:**
- Home, About, Services, FAQ, Testimonials, and Contact pages
- Online quote request form that saves submissions to PostgreSQL

**Client Portal (login required):**
- Clients log in to view their active policies and renewal dates
- Renewal alert banner if any policy renews within 30 days
- View assigned broker name, specialization, and contact info
- Message thread with their broker
- Send new messages directly from the portal

**Admin Panel (login required):**
- Dashboard with summary stats
- View all quote requests and update their status (Submitted → In Review → Quoted → Closed)
- Add and delete clients
- Send messages to any client
- Manage policies — add and delete policies per client
- Manage brokers — add and delete brokers


## Tech Stack

Layer       | Technology     
----------------------------                   
Runtime     | Node.js v24.13.0                       
Framework   | Express.js v5.2.1                    
Templating  | EJS v5.0.1                              
Database    | PostgreSQL 16                     
Auth        | express-session + bcryptjs        
Styling     | Custom CSS (no frameworks)        
Deployment  | Localhost    


## Installation

### 1. Clone the repository
git clone https://github.com/NishilSailor/netzero-project-b-sailor.git
cd netzero-project-b-sailor

### 2. Install dependencies
npm install
(dependencies specific version in package.json as well)

### 3. Set up the database
- Create a PostgreSQL database named `bsmw_portal`
- Open pgAdmin or psql and run the contents of `database.sql`
- This will create all tables and insert sample data

### 4. Create your .env file
Create a file named `.env` in the project root (see Environment Variables section below)

## Environment Variables

Create a `.env` file in the project root with the following variables:

DB_USER=your_postgres_username
DB_HOST=localhost
DB_NAME=bsmw_portal
DB_PASSWORD=your_postgres_password
DB_PORT=5432
SESSION_SECRET=any_random_string_here
ADMIN_PASSWORD=your_chosen_admin_password


### 5. Seed the admin user and hash client passwords
node seed.js
Then delete `seed.js` — it is not needed after this step.

### 6. Start the app
node index.js

Open your browser and go to: http://localhost:3000


## Default Login Credentials (after running seed.js)

**Admin login** — `http://localhost:3000/admin/login`
- Username: `admin`
- Password: *(whatever you set as ADMIN_PASSWORD in .env)*

**Client login** — `http://localhost:3000/client/login`
- Email: `tom@email.com`
- Password: `client123`


## Folder Structure
netzero-project-b-sailor/
├── index.js              # Main server file, all routes
├── database.sql          # Schema and sample data
├── README.md             # This file
├── seed.js               # Generate real bcrypt hashes for client passwords
├── .env                  # Local credentials (not in repo)
├── package.json
├── public/
│   └── style.css
└── views/
    ├── partials/
    │   ├── header.ejs
    │   └── footer.ejs
    ├── home.ejs
    ├── about.ejs
    ├── services.ejs
    ├── faq.ejs
    ├── testimonials.ejs
    ├── quote.ejs
    ├── quote-success.ejs
    ├── contact.ejs
    ├── 404.ejs
    ├── admin/
    │   ├── login.ejs
    │   ├── dashboard.ejs
    │   ├── policies.ejs
    │   └── brokers.ejs
    └── client/
        ├── login.ejs
        └── dashboard.ejs

## Notes for Ops Team

- All credentials are loaded from environment variables — no hardcoded passwords exist in the codebase
- Run `database.sql` first, then `seed.js`, then `node index.js` in the project folder
- The app runs on port 3000 by default 
- A `.gitignore` should be in place to exclude `node_modules/` and `.env`

