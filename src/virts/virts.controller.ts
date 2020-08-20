import * as express from 'express';
import got from 'got';
const sql = require('mssql')

var staging = require('../config/index').staging;
var it_cmdb = require('../config/index').it_cmdb;
var settings = require('../config/index').vcenter;
var auth = require('../auth/auth')
var util = require('../util/util')
var db = require('../db/db')

var session;


class VirtsController {
  public virts = '/virts';
  
  public router = express.Router();

  constructor() {
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    this.router.get(this.virts, this.getVirts);    
  }
  getVirts = async(request: express.Request, response: express.Response) => {    
    try {        

      session = await auth.login();

     const hosts =  await db.getAllHosts();
     
     var virts = [];
     
     for (let step = 0; step < hosts.length; step++) {
      
      var v = await this.getVirtsByHost(hosts[step].host, session.value);    
      
      virts.push(v);      
      /* if (step == 2)
        break */
    }

    virts.forEach( async(virt) =>{
       await db.createVirts(virt);
     })     
     
     await auth.logout(session);

      response.send('{New Virt Captured}');
    } catch (error) {
      console.log('error from getVirts error');
      response.send(error)
    }       
  } 
  getVirtsByHost = async(hostname: string, session) => {
    
    try {
      
      const apiPath = '/rest/vcenter/vm';
      const url = settings.host + apiPath + '?filter.hosts.1=' + hostname;

      var data = await util.get(url, session);

      console.log(data);

      return data;  

    } catch (error) {
      console.log('getVirtsByHost Error')
      return {'getVirtsByHost Error': 'Error'};
    }
    
  }


}
 
export default VirtsController;