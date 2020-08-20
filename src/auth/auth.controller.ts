import * as express from 'express';
import got from 'got';

var settings = require('../config/index').vcenter

var session;

class AuthController {
  public pathlogin = '/login'
  public pathlogout = '/logout'
  public pathsession = '/session'
  
  public router = express.Router();
 
  constructor() {
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    this.router.get(this.pathlogin,this.login);    
    this.router.get(this.pathsession, this.getSession);
    this.router.get(this.pathlogout,this.logout);
  }

getCurrenSession = async() => {

  try {        

    var apiPath = '/rest/com/vmware/cis/session';
    const url = settings.host + apiPath ;

    const folders = await got.get(url);

    return JSON.parse(folders.body).value;

    //=> '<!doctype html> ...'
  } catch (error) {
    console.log('error from getFolders', error)
      //=> 'Internal server error ...'
  }     
}
    
login = async() => {  
  try {        

      const apiPath = '/rest/com/vmware/cis/session';
      const url = settings.host + apiPath;

      const options = {
          https: { rejectUnauthorized: settings.ssl },
          headers: {
            'Authorization': "Basic " + Buffer.from(settings.username + ':' + settings.password).toString("base64"),
            'Content-Type': 'application/json',
            'Accept': 'application/json'           
            }          
        }

      const response = await got.post(url, options).json();

      return response;

      //=> '<!doctype html> ...'
    } catch (error) {
      console.log(error)
        //=> 'Internal server error ...'
    }   
}

logout = async(session) => {  
  try {        

    var apiPath = '/rest/com/vmware/cis/session';
    const url = settings.host + apiPath;

    const options = {
      https: { rejectUnauthorized: settings.ssl },
      headers: {
        'Accept': 'application/json',
        'vmware-api-session-id': session.value,              
        }          
    }
    const response = await got.delete(url, options);
  } catch (error) {
    console.log(error)
      //=> 'Internal server error ...'
  }      
  
}

getSession = async() => {  
  try {        

    //
    //session = await this.login(); 
    var apiPath = '/rest/com/vmware/cis/session?~action=get';
    const url = settings.host + apiPath;

    const options = {
      https: { rejectUnauthorized: settings.ssl },
      headers: {
        'Accept': 'application/json',
        'vmware-api-session-id': undefined,              
        }          
    }
    const response = await got.post(url, options);

    //const response = await got.get(url);

    return response;

    //=> '<!doctype html> ...'
  } catch (error) {
    console.log(error)
      //=> 'Internal server error ...'
  }      
  
}

}
 
export default AuthController;