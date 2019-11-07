module.exports = {
    apps: [{
        name: 'light-server',
        script: 'index.js',

        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production'
        }
    }],

    deploy: {
        production: {
            user: 'appuser',
            host: '172.105.92.200',
            // ref: 'origin/master',
            // repo: 'git@github.com:repo.git',
            path: '/var/www/light-server',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
        }
    }
};