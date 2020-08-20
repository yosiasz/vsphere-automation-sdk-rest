const sql = require('mssql')

var staging = require('../config/index').staging;
var it_cmdb = require('../config/index').it_cmdb;

export const getAllHosts = async() => {
    try {
      let pool2 = await sql.connect(it_cmdb)
      let result = await pool2.request()
          .query('select * from dbo.vCenterHosts')
      
      pool2.close();

      return result.recordsets[0];
    } catch (err) {
      return err;
    }
}

export const createVirts = async(virts) => {       
  try {
    
    let pool2 = await sql.connect(staging)
    var data = JSON.stringify(virts);
    
    let result = await pool2.request()
        .input('objecttype', sql.VarChar(50), 'virts')
        .input('details', sql.VarChar(sql.MAX), data)
        .query('insert into dbo.vCenterStaging (objecttype, details) values (@objecttype, @details)');
    
  } catch (err) {
    return err;
  }
}