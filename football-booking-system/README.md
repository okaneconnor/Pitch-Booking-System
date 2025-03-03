# ScheduleWise Deployment Documentation

This document provides a comprehensive guide on how the ScheduleWise React application was deployed to a production environment using NGINX, Let's Encrypt SSL, and Cloudflare CDN/DNS.

## Table of Contents

1. [Server Environment](#server-environment)
2. [Directory Structure](#directory-structure)
3. [Application Deployment](#application-deployment)
4. [NGINX Configuration](#nginx-configuration)
5. [SSL Configuration with Let's Encrypt](#ssl-configuration-with-lets-encrypt)
6. [Cloudflare Setup](#cloudflare-setup)
7. [Automated Deployment](#automated-deployment)
8. [Troubleshooting](#troubleshooting)

## Server Environment

The application is hosted on a Virtual Private Server (VPS) running Ubuntu with the following software:

- NGINX: Web server
- NodeJS & NPM: For building the React application
- Certbot: For Let's Encrypt SSL certificate management

## Directory Structure

The application follows this directory structure on the VPS:

```
/var/www/
└── schedulewise.org/
    ├── Pitch-Booking-System/             # Main repository folder
    │   ├── .git/                         # Git repository metadata
    │   └── football-booking-system/      # React application folder
    │       ├── build/                    # Production build (served by NGINX)
    │       ├── node_modules/             # NPM dependencies
    │       ├── public/                   # Public assets
    │       ├── src/                      # Source code
    │       ├── package.json              # NPM package configuration
    │       └── package-lock.json         # NPM lock file
    └── deploy.sh                         # Deployment script
```

## Application Deployment

The React application was deployed using the following steps:

1. Created the web directory:
   ```bash
   sudo mkdir -p /var/www/schedulewise.org
   ```

2. Cloned the repository from GitHub:
   ```bash
   cd /var/www/schedulewise.org
   git clone git@github.com:okaneconnor/Pitch-Booking-System.git
   ```

3. Navigated to the React application directory:
   ```bash
   cd /var/www/schedulewise.org/Pitch-Booking-System/football-booking-system
   ```

4. Installed Node.js dependencies:
   ```bash
   npm install
   ```

5. Built the production version of the application:
   ```bash
   npm run build
   ```

This created the optimized `build` directory which contains static files to be served by NGINX.

## NGINX Configuration

NGINX was configured to serve the React application with the following steps:

1. Created a new site configuration:
   ```bash
   sudo nano /etc/nginx/sites-available/schedulewise.org
   ```

2. Added the following configuration:
   ```nginx
   server {
       listen 80;
       listen 443 ssl;
       server_name schedulewise.org www.schedulewise.org;

       # SSL configuration
       ssl_certificate /etc/letsencrypt/live/schedulewise.org/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/schedulewise.org/privkey.pem;
       
       # SSL parameters
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_prefer_server_ciphers on;
       
       # Root directory for your React app
       root /var/www/schedulewise.org/Pitch-Booking-System/football-booking-system/build;
       index index.html;

       # React router configuration
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location /static/ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # Security headers
       add_header X-Content-Type-Options "nosniff";
       add_header X-Frame-Options "SAMEORIGIN";
   }
   ```

   Note: The important part of this configuration is the `try_files $uri $uri/ /index.html;` directive, which ensures that all routes are handled by React Router.

3. Created a symbolic link to enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/schedulewise.org /etc/nginx/sites-enabled/
   ```

4. Tested the NGINX configuration:
   ```bash
   sudo nginx -t
   ```

5. Restarted NGINX to apply changes:
   ```bash
   sudo systemctl restart nginx
   ```

## SSL Configuration with Let's Encrypt

SSL certificates were obtained and configured using Let's Encrypt's Certbot:

1. Installed Certbot and the NGINX plugin:
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```

2. Obtained SSL certificates:
   ```bash
   sudo certbot --nginx -d schedulewise.org -d www.schedulewise.org
   ```

3. Verified certificate installation:
   ```bash
   sudo ls -la /etc/letsencrypt/live/schedulewise.org/
   ```

4. Certbot automatically configured NGINX for SSL and added the necessary directives to the configuration file.

5. The renewal of certificates is handled automatically by a systemd timer:
   ```bash
   sudo systemctl status certbot.timer
   ```

## Cloudflare Setup

Cloudflare was used for DNS management, CDN, and security. The setup included:

1. **DNS Configuration**:
   - Added the domain to Cloudflare's dashboard
   - Set up the following DNS records:
     - A record: `schedulewise.org` → `157.90.241.121`
     - CNAME record: `www` → `schedulewise.org`

2. **SSL Configuration**:
   - Set SSL/TLS encryption mode to "Full (Strict)"
   - This ensures end-to-end encryption while validating the origin certificate

3. **Page Rules**:
   - Created HTTP to HTTPS redirect rule:
     - URL pattern: `http://*schedulewise.org/*`
     - Setting: Forwarding URL (301 Permanent Redirect)
     - Target: `https://$1`

   - Created WWW to root domain redirect rule:
     - URL pattern: `https://www.schedulewise.org/*`
     - Setting: Forwarding URL (301 Permanent Redirect)
     - Target: `https://schedulewise.org/$1`

4. **Nameservers**:
   - Updated the domain's nameservers at the registrar (Hostinger) to use Cloudflare's nameservers:
     - dara.ns.cloudflare.com
     - toby.ns.cloudflare.com

## Automated Deployment

A deployment script was created to simplify future updates:

1. Created the deployment script:
   ```bash
   nano /var/www/schedulewise.org/deploy.sh
   ```

2. Added the following content:
   ```bash
   #!/bin/bash
   echo "Starting deployment process..."

   # Go to the repository directory and pull latest changes
   cd /var/www/schedulewise.org/Pitch-Booking-System
   git pull

   # Navigate to the React app directory
   cd /var/www/schedulewise.org/Pitch-Booking-System/football-booking-system

   # Install dependencies and build
   npm install
   npm run build

   echo "Build completed. Reloading NGINX..."
   sudo systemctl reload nginx

   echo "Deployment finished successfully!"
   ```

3. Made the script executable:
   ```bash
   chmod +x /var/www/schedulewise.org/deploy.sh
   ```

To deploy future updates, simply run:
```bash
/var/www/schedulewise.org/deploy.sh
```

## File Permissions

Proper permissions were set to ensure security and functionality:

1. Set ownership for web files:
   ```bash
   sudo chown -R www-data:www-data /var/www/schedulewise.org
   ```

2. Set appropriate permissions:
   ```bash
   sudo find /var/www/schedulewise.org -type d -exec chmod 755 {} \;
   sudo find /var/www/schedulewise.org -type f -exec chmod 644 {} \;
   sudo chmod +x /var/www/schedulewise.org/deploy.sh
   ```

## Troubleshooting

When troubleshooting is needed, here are key locations and commands:

1. **NGINX logs**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   sudo tail -f /var/log/nginx/access.log
   ```

2. **Certificate locations**:
   ```bash
   sudo ls -l /etc/letsencrypt/live/schedulewise.org/
   ```

3. **NGINX configuration test**:
   ```bash
   sudo nginx -t
   ```

4. **Application build directory check**:
   ```bash
   ls -la /var/www/schedulewise.org/Pitch-Booking-System/football-booking-system/build
   ```

5. **DNS verification**:
   ```bash
   dig schedulewise.org
   dig www.schedulewise.org
   ```

6. **Service status**:
   ```bash
   sudo systemctl status nginx
   ```

## Summary

The ScheduleWise React application is now successfully deployed at https://schedulewise.org with:
- NGINX serving the static files
- HTTPS encryption via Let's Encrypt
- DNS management, CDN, and additional security via Cloudflare
- Automated deployment process for future updates

The setup provides a secure, performant, and easily maintainable production environment for the application.
