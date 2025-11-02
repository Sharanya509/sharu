Clone the repo.
1. Goto directory "server", then run command "npm install"
2. Goto directory "sharu", then run command "npm install"
3. Run command "ng build", you will see .angular and dist folders generated.
4. Run "ng serve" inside sharu folder.
5. Create .env file inside server with parameters - 
MONGO_URI, 
PORT, 
JWT_SECRET,
JWT_REFRESH_SECRET,
ACCESS_TOKEN_EXPIRY,
REFRESH_TOKEN_EXPIRY.
6. "npm start" inside server folder. (Can be done by Split terminal)

// Code Optimization done. Mobile UI UX done. Added PWA feature of offline indexing.

Build with production: "ng build --configuration=production"

Run - "npx http-server -c-1 dist/sharu/browser -P http://localhost:8080?"

Steps to run on live server:

a. Create a split terminal
b. Build sharu
c. "npm start" in server folder.
d. "npx http-server -c-1 dist/sharu/browser -P http://localhost:8080?" in sharu folder

Hosted the PWA on Render (for backend) and Netlify (Angular frontend)

Backend link: "https://sharu.onrender.com"
WebApp link: "https://sharu-pwa.netlify.app/"

Lighthouse report is attached.

Performance: 99
Accessbility: 100
Best Practice: 100
SEO : 100
PWA : 100% Confirmed
