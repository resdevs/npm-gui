var exec = require('child_process').exec;
var fs = require('fs');
var helpers = require('../../helpers/helpers.js');
var consoleSocket = require('../console/console.controller.js');

function whenPut(req, res) {
    var saveArg = helpers.isDevModules(req.originalUrl) ? '-D' : '-S';

    consoleSocket.send('start npm install ' + saveArg + ' ' + req.body.key + '\n');

    var output = '';
    var child = exec('npm install ' + saveArg + ' ' + req.body.key,
        function(error, stdout, stderr) {
            output = output + '\n' + stdout + '\n' + stderr;
            if (error !== null) {
                //output = output + error;
            }
        });

    helpers.bindChildStdToConsole(child);

    child.on('close', function() {
        res.status(200).send('<textarea style="width:800px;height:400px;">' + output + '</textarea>');
    });
}

function whenDelete(req, res) {
    var saveArg = helpers.isDevModules(req.originalUrl) ? '-D' : '-S';

    consoleSocket.send('start npm rm ' + saveArg + ' ' + req.params.name + '\n');

    var output = '';
    var child = exec('npm uninstall --save ' + req.params.name,
        function(error, stdout, stderr) {
            output = output + '\n' + stdout + '\n' + stderr;
            if (error !== null) {
                //output = output + error;
            } else {
                ///bugfix
                var packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
                if (helpers.isDevModules(req.originalUrl)) {
                    delete packageJson.devDependencies[req.params.name];
                } else {
                    delete packageJson.dependencies[req.params.name];
                }
                fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
            }
        });

    helpers.bindChildStdToConsole(child);

    child.on('close', function() {
        res.status(200).send('<textarea style="width:800px;height:400px;">' + output + '</textarea>');
    });
}

function whenGetInstall(req, res) {
    consoleSocket.send('start npm install' + '\n');

    var output = '';
    var child = exec('npm install',
        function(error, stdout, stderr) {
            output = output + '\n' + stdout + '\n' + stderr;
            if (error !== null) {
                //output = output + error;
            }
        });

    helpers.bindChildStdToConsole(child);

    child.on('close', function() {
        res.status(200).send('<textarea style="width:800px;height:400px;">' + output + '</textarea>');
    });
}


function whenGet(req, res) {
    var packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
    var arrayOfModules = [];
    helpers.buildArrayFromObject((helpers.isDevModules(req.originalUrl) ? packageJson.devDependencies : packageJson.dependencies), arrayOfModules, 'key', 'value');
    res.status(200).send(JSON.stringify(arrayOfModules, null, 2));
}

module.exports.whenGet = whenGet;
module.exports.whenPut = whenPut;
module.exports.whenDelete = whenDelete;
module.exports.whenGetInstall = whenGetInstall;