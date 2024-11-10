[Unit]
Description=SvelteKit Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/laila.icu/my-app
ExecStart=/usr/bin/node /var/www/laila.icu/my-app/start.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
