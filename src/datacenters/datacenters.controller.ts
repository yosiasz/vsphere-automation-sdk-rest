import * as express from 'express';
import got from 'got';
const sql = require('mssql')

var settings = require('../config/index').vcenter
var config = require('../config/index').staging;

var session;
var datacenters;

class DatacentersController {
  public path = '/datacenters';
  public pathbydatacenter = '/datacenters/:datacentername';
  
  public router = express.Router();
 
  constructor() {
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    this.router.get(this.path, this.getDataCenters);
    this.router.get(this.pathbydatacenter, this.getDataCenterDetails);
  }
 
  getDataCenters = async(request: express.Request, response: express.Response) => {  
      

    try {        

      session = await this.login();      

      const apiPath = '/rest/vcenter';
      const url = settings.host + apiPath + '/datacenter';
      
      const options = {
        https: { rejectUnauthorized: settings.ssl },
        headers: {
          'Accept': 'application/json',
          'vmware-api-session-id': session.value,              
          }          
      }

      //get Data Center
      const dc = await got.get(url, options);

      var dataCenters = JSON.parse(dc.body).value;
      
      //get Data Center Details
      const dcdUrl = settings.host + apiPath + '/datacenter/' + dataCenters[0].datacenter;
      
      const dcd = await got.get(dcdUrl, options);
      
      var dcdDetails = JSON.parse(dcd.body).value;
      
      dcdDetails["datacenter"] = datacenters[0].datacenter;
      
      this.createDataCenterDetails(dcdDetails);

      await this.logout(session);

      response.send(datacenters);

      //=> '<!doctype html> ...'
    } catch (error) {
      console.log('error from getAllHosts', error)
        //=> 'Internal server error ...'
    }   

  }

  getDataCenterDetails = async(request: express.Request, response: express.Response) => {  
      

    try {        

      session = await this.login();      

      const apiPath = '/rest/vcenter';
      const url = settings.host + apiPath + '/datacenter/' + request.params.datacentername;
      
      const options = {
        https: { rejectUnauthorized: settings.ssl },
        headers: {
          'Accept': 'application/json',
          'vmware-api-session-id': session.value,              
          }          
      }
            
      const datacenter = await got.get(url, options);
      
      await this.logout(session);

      response.send(JSON.parse(datacenter.body).value);

      //=> '<!doctype html> ...'
    } catch (error) {
      console.log('error from getDataCenterDetails', error)
      response.send(error);
        //=> 'Internal server error ...'
    }   

  }

  createDataCenterDetails = async(dc) => {      
    try {
        let pool = await sql.connect(config)
        var data = JSON.stringify(dc);
        let result = await pool.request()
            .input('data', sql.VarChar(2000), data)
            .query('insert into dbo.vCentersStaging (datacenterdetails) values (@data)')
            
        return result;
    } catch (err) {
      return err;
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
 
export default DatacentersController;