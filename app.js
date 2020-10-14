const express = require('express')
const app = express()
const PORT = 9999
const { mysqlUPH } = require('./config')
const path = require('path')
const fs = require('fs')
const { parse } = require('json2csv')

app.get('/uph', (req, res) => { // uph data para sa lahat ng files ni noee
  let process = req.query.process;

  if(process){
    getProcessUph(process).then((data) => {

      try {
        const csv = parse(data);
        res.send(csv);

      } catch (err) {
        console.error(err);
      }


      /*
      let ws = xlsx.utils.json_to_sheet(data);
      var wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "uph_export");

      xlsx.writeFile(wb, "uph_export.xls")

      if(__dirname + '/uph_export.xls'){

        console.log(data);

        res.download(__dirname + '/uph_export.xls', 'uph_exports.xls', { headers: {"Content-Type":"application/xls"} }, (err) => {

          console.log({message: err})

          console.log('deleting the file now...')

          fs.unlink(__dirname + '/uph_export.xls', (err) => {
            if (err) throw err;
            console.log(__dirname + '/uph_export.xls was deleted.');
          });

        })

        res.end('end.')
      } else {
        res.send(403, 'Sorry, cannot download the file...');
      }
      */
    })
  }

  function getProcessUph(toolset) {
    return new Promise((resolve, reject) => {
      mysqlUPH.getConnection((err, connection) => {
        if(err){return reject(err)}
        connection.query({
          sql: 'SELECT * FROM process WHERE toolset= ?',
          values: [ toolset ]
        }, (err, results) => {
          if(err){return reject(err)}
          if(results.length>0){
            let data = []
            for(let i=0; i<results.length;i++){
              data.push({
                OEE_Tool_Name: results[i].OEE_Tool_Name,
                uph: results[i].uph,
                line: results[i].line,
                toolset: results[i].toolset,
                target_oee: results[i].target_oee,
                MES_Name: results[i].MES_Name,
                fab_week: results[i].fab_week,
                last_updated: results[i].last_updated,
                updated_by: results[i].updated_by
              })
            }
            resolve(data)
          }else{
            resolve([])
          }
        })
        connection.release()
      })
    })
  }

})

app.listen(9999);
console.log('uph app running on port ' + PORT)