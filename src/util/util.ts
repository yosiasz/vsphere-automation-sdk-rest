import got from 'got';
var auth = require('../auth/auth')
var settings = require('../config/index').vcenter

export const get = async(url, session) => {  
  try {        
    
    console.log('util.get session', session);

    const options = {
      https: { rejectUnauthorized: settings.ssl },
      headers: {
        'Accept': 'application/json',
        'vmware-api-session-id': session,              
        }          
    }

    var c = await got.get(url, options);

    var data = JSON.parse(c.body).value;
    
    return data;
    
  } catch (error) {
    console.log('util.get', error)
      //=> 'Internal server error ...'
  }      
  
}