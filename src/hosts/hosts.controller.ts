import * as express from 'express';
import got from 'got';
const sql = require('mssql')
var it_cmdb = require('../config/index').it_cmdb
var staging = require('../config/index').staging

import Host from './host.interface';
//import { openStdin } from 'process';
var settings = require('../config/index').vcenter
//var util = require('../common/utility');
var session;
var hosts;

class HostsController {
  public path = '/hosts';
  public pathbyhost = '/hosts/:hostname';  
  public pathsql = '/hostssql';
  
  public router = express.Router();
 
  constructor() {
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    this.router.get(this.path, this.getHosts);
    this.router.get(this.pathbyhost, this.getHostByName);
    this.router.get(this.pathsql, this.getAllHosts);
  }
 
  getHosts = async(request: express.Request, response: express.Response) => {  
      

    try {        

      session = await this.login();      

      const apiPath = '/rest/vcenter/host';
      const url = settings.host + apiPath + '?filter.connection_states=CONNECTED';
      
      const options = {
        https: { rejectUnauthorized: settings.ssl },
        headers: {
          'Accept': 'application/json',
          'vmware-api-session-id': session.value,              
          }          
      }

      
      var h = await got.get(url, options);

      var hosts = JSON.parse(h.body).value;

      this.createHostDetails(hosts);

      await this.logout(session);

      response.send(hosts);

      //=> '<!doctype html> ...'
    } catch (error) {
      console.log('error from getHosts', error)
        //=> 'Internal server error ...'
    }   

  }
  
  getAllHosts = async(request: express.Request, response: express.Response) => {
    try {
      let pool = await sql.connect(it_cmdb)
      let result = await pool.request()
          .query('select * from vCenterHosts')
      let hosts = result.recordsets[0];
    
      response.send(hosts);
    } catch (err) {
      return err;
    }
}   
//if you want to capture this data in a database
createHostDetails = async(hd) => {      
    try {
        let pool2 = await sql.connect(staging)
        var data = JSON.stringify(hd);
        let result = await pool2.request()
            .input('objecttype', sql.VarChar(50), 'hosts')
            .input('details', sql.VarChar(sql.MAX), data)
            .query('insert into dbo.vCenterStaging (objecttype, details) values (@objecttype, @details)')
        
        pool2.close()

        return result;
    } catch (err) {
      return err;
    }
  } 

  getHostByName = async(request: express.Request, response: express.Response) => {  
      

    try {        

      session = await this.login();      

      const apiPath = '/rest/vcenter/host';
      
      const url = settings.host + apiPath + '?filter.names.1=' + request.params.hostname;
      
      const options = {
        https: { rejectUnauthorized: settings.ssl },
        headers: {
          'Accept': 'application/json',
          'vmware-api-session-id': session.value,              
          }          
      }

      
      const hosts = await got.get(url, options);

      response.send(JSON.parse(hosts.body).value);

      //=> '<!doctype html> ...'
    } catch (error) {
      console.log('error from getAllHosts', error)
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

      //const response = await got.get(url);

      return response;

      //=> '<!doctype html> ...'
    } catch (error) {
      console.log(error)
        //=> 'Internal server error ...'
    }      
    
  }


}
 
export default HostsController;