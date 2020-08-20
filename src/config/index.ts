module.exports = {
    staging: {
        domain: '',
        user: '',
        password: '',
        server: '',
        database: '',    
        options: {
          enableArithAbort: true
        },
        requestTimeout : 60000
    },
    it_cmdb: {
        domain: '',
        user: '',
        password: '',
        server: '',
        database: '',    
        options: {
          enableArithAbort: true
        },
        requestTimeout : 60000
    },    
    vcenter: {
        host: 'https://your.vshpere.server', //No default! Please provide a valid host URL.
        username: '', //username. No default! Please provide a value.
        password: '', // password. No default! Please provide a value.
        ssl: false, // use strict ssl or not.. false allows you to accept all certs.
                    // NOTE: SSL should be set to true in a production environment.
        cleanup: false, // true to clean up any data a sample created, false to leave it,       
    }       
};  