//node dependencies
var fs = require('fs');
var oboe = require('oboe');
var mkdirp = require("mkdirp");
var getDirName = require("path").dirname;
var program = require('commander');
var _ = require('lodash');
//config command line variable
program
  .version('0.0.1')
  .option('-n, --file-name [type]', 'Input file name')
  .option('-d, --directory [type]', 'Output Directory')
  .option('-t, --type [type]', 'Input file type, full or short')
  .option('-ext, --extenion [type]', 'Output file extention')
  .parse(process.argv);
//
var outputFolder = '/' + (program.directory || 'result') + '/';
var currentFolder = __dirname;
//
var name = 'response';
var part = 'part';
var partCount = 1;
var responseCount = 1;
var outputFileName = '';
var extension = '.' + (program.extension || 'json');
var inputFileName = program.fileName || 'data.json';
var dataPath = {
full: 'response.customerUsages',
f: 'response.customerUsages',
short:  'customerUsages',
s:  'customerUsages',
};

var _dataPath = dataPath[program.type] || dataPath.full;
//
function splitJson() {
  //create readable stream from file
  var readStream = fs.createReadStream(inputFileName);
  //use oboe to parse readable stream
  oboe(readStream)
    .done(function (data) {

      var customerUsages = _.get(data, _dataPath);
      var i, length = customerUsages.length;
      partCount = 0;
      for (i = 0; i < length; i++) {
        outputFileName = currentFolder + outputFolder + name + responseCount + part + partCount + extension;
        writeJsonToFile(outputFileName, customerUsages[i], writeFileComplete);
        partCount++;
      }
      responseCount++;
    })
    .fail(function (errorData) {
      console.log('Cannot read input file', errorData);
    });
}

function writeFileComplete(error) {
  if (error) {
    console.log('Cannot write data to file', error);
  } else {
    console.log('Write file: ' + outputFileName + ' success');
  }
}

function writeJsonToFile(path, jsonContent, cb) {
  //mkdirp create missing folder in file path
  mkdirp(getDirName(path), function (err) {
    if (err) {
      return cb(err);
    }
    //JSON.stringify(jsonContent, null, 4) return formatted json
    fs.writeFile(path, JSON.stringify(jsonContent, null, 4), 'utf8', cb);
  })
}

//split json
splitJson();
