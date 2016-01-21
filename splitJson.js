//node dependencies
var fs = require('fs');
var oboe = require('oboe');
var mkdirp = require("mkdirp");
var getDirName = require("path").dirname;
var program = require('commander');
//config command line variable
program
  .version('0.0.1')
  .option('-n, --file-name [type]', 'Input file name')
  .option('-d, --directory [type]', 'Output Directory')
  .parse(process.argv);
//
var outputFolder = program.directory || 'result';
outputFolder = '/' + outputFolder + '/';
var currentFolder = __dirname;
//
var name = 'response';
var part = 'part';
var partCount = 1;
var responseCount = 1;
var extension = '.json';
var outputFileName = '';
var inputFileName = program.fileName || 'data.json';
//
function splitJson() {
  //create readable stream from file
  var readStream = fs.createReadStream(inputFileName);
  //use oboe to parse readable stream
  oboe(readStream)
    .done(function (data) {
      var customerUsages = data.response.customerUsages;
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