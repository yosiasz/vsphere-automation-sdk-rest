import * as express from 'express';
import got from 'got';

import Host from './folders.interface';

var settings = require('../config/index').vcenter
var folderstructure;
var session;
var folders;

class FoldersController {
  public path = '/folders';
  public pathbyfoldername = '/folders/:foldername';
  public pathdefaultfolder = '/folder';
  public pathbyparentfolder = '/folders/:parentfoldername'  
  public pathlogin = '/login'
  public pathlogout = '/logout'
  public pathsession = '/session'
  
  public router = express.Router();
 
  constructor() {
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    this.router.get(this.path, this.getFolders);
    this.router.get(this.pathdefaultfolder, this.getRootFolder);
    this.router.get(this.pathbyparentfolder, this.getFoldersByParent);
    this.router.get(this.pathbyparentfolder, this.getFoldersByParent);
    this.router.get(this.pathsession, this.getSession);    
    
    this.router.get(this.pathlogin,this.login);
    this.router.get(this.pathlogout,this.logout);
  }
 
  getFolders = async(request: express.Request, response: express.Response) => {       

    try {        

      session = await this.login();
      
      const apiPath = '/rest/vcenter/folder';
      const url = settings.host + apiPath + '?filter.parent_folders.1=group-v3';
      
      const options = {
        https: { rejectUnauthorized: settings.ssl },
        headers: {
          'Accept': 'application/json',
          'vmware-api-session-id': session.value,              
          }          
      }
      
      const data = await got.get(url, options);
      
      const folders = JSON.parse(data.body).value;
      console.log(session.value, folders,data );
      /* folders.forEach( async(item) =>{
        folderstructure += '/' + item.name;
        console.log('getSubFolders', folderstructure);
        var subfolder = await this.getSubFolders(item.folder, session.value);
        if (subfolder === undefined || subfolder.length == 0) {
          console.log('End of folder path', subfolder)
          folderstructure = '';
        }        
      }) */
      
      await this.logout(session.value);
      
      response.send(folders);

      //=> '<!doctype html> ...'
    } catch (error) {
      console.log('error from getFolders', error)
        //=> 'Internal server error ...'
    }   

  }

  getSubFolders = async(foldername: string, sessionid: string) => {       
    try {        

      const apiPath = '/rest/vcenter/folder';
      const url = settings.host + apiPath + '?filter.parent_folders.1=' + foldername;
      
      const options = {
        https: { rejectUnauthorized: settings.ssl },
        headers: {
          'Accept': 'application/json',
          'vmware-api-session-id': sessionid,              
          }          
      }
      const data = await got.get(url, options);

      folders = JSON.parse(data.body).value;

      folders.forEach( async(item) =>{
        folderstructure += '/' + item.name;
        console.log('getSubFolders', folderstructure);

        var subfolder = await this.getSubFolders(item.folder, session.value);
        if (subfolder === undefined || subfolder.length == 0) {
          folderstructure = '';
        }        
      })

      return folders;
    } catch (error) {
      console.log('error from getFolders', error)
        //=> 'Internal server error ...'
    }   

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
      
  getFoldersByParent = async(request: express.Request, response: express.Response) => {       

    try {        

      session = await this.login();      

      const apiPath = '/rest/vcenter/folder';
      const url = settings.host + apiPath + '?filter.parent_folders.1=' + request.params.parentfoldername;
      
      const options = {
        https: { rejectUnauthorized: settings.ssl },
        headers: {
          'Accept': 'application/json',
          'vmware-api-session-id': session.value,              
          }          
      }
      
      const folders = await got.get(url, options);

      response.send(JSON.parse(folders.body).value);

      //=> '<!doctype html> ...'
    } catch (error) {
      console.log('error from getFolders', error)
        //=> 'Internal server error ...'
    }   

  }
  getRootFolder = async(request: express.Request, response: express.Response) => {  
      

    try {        

      session = await this.login();      

      const apiPath = '/rest/vcenter/folder';
      const url = settings.host + apiPath + '?filter.names.1=vm';
      const options = {
        https: { rejectUnauthorized: settings.ssl },
        headers: {
          'Accept': 'application/json',
          'vmware-api-session-id': session.value,              
          }          
      }

      
      const defaultfolder = await got.get(url, options);

      response.send(JSON.parse(defaultfolder.body).value);

      //=> '<!doctype html> ...'
    } catch (error) {
      console.log('error from getDefaultFolder', error)
        //=> 'Internal server error ...'
    }   

  }

  login = async() => {  
      try {        

        console.log('We are in login!');
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
          console.log(options);
          const response = await got.post(url, options).json();

          return response;

          //=> '<!doctype html> ...'
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
  logout = async(sessionid) => {  
    try {        

      session = await this.login(); 
      var apiPath = '/rest/com/vmware/cis/session';
      const url = settings.host + apiPath;

      const options = {
        https: { rejectUnauthorized: settings.ssl },
        headers: {
          'Accept': 'application/json',
          'vmware-api-session-id': sessionid,              
          }          
      }
      const response = await got.delete(url, options);

      //const response = await got.get(url);

      return response;

      //=> '<!doctype html> ...'
    } catch (error) {
      console.log(error)
        //=> 'Internal server error ...'
    }      
    
  }
}
 
export default FoldersController;