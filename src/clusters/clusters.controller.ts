import * as express from 'express';
var settings = require('../config/index').vcenter
var util = require('../util/util')
const sql = require('mssql')
var config = require('../config/index').staging;

class ClustersController {
  public path = '/clusters';
  public cluserdetails = '/clusters/:clustername';
  public router = express.Router();
 
  constructor() {
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    this.router.get(this.path, this.getClusters);
    this.router.get(this.cluserdetails, this.getClusterDetails);
  }
 
  getClusters = async(request: express.Request, response: express.Response) => {

    try {        

      const apiPath = '/rest/vcenter/cluster';
      const cUrl = settings.host + apiPath;
      
      var clusters = await util.get(cUrl); 

      this.createData(clusters);
      
      response.send(clusters);

    } catch (error) {
      console.log('error from getClusters', error)
      response.send(error);
    }   

  }
  
  getClusterDetails = async(request: express.Request, response: express.Response) => {  

    try {        

      const apiPath = '/rest/vcenter/cluster/';
      const url = settings.host + apiPath + request.params.clustername;
      
      var clusters = await util.get(url);  

      response.send(clusters);
    } catch (error) {
      console.log('error from getClusterDetails', error);
      response.send(error);
    }   

  }
  

createData = async(cd) => {      
    try {
        let pool = await sql.connect(config)
        var data = JSON.stringify(cd);
        let result = await pool.request()
            .input('objecttype', sql.VarChar(50), 'clusters')
            .input('details', sql.VarChar(sql.MAX), data)
            .query('insert into dbo.vCenterStaging (objecttype, details) values (@objecttype, @details)')
            
        return result;
    } catch (err) {
      return err;
    }
  } 

}
 
export default ClustersController;