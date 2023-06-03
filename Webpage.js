const http = require('http');
const formidable = require('formidable');

const server = http.createServer(function (req, res) {
    if (req.url == '/fileupload' && req.method.toLowerCase() === 'post') {
        var form = new formidable.IncomingForm();
        var success = true;
        var fileName = "";
        var fileType = "";

        form.on('fileBegin', function (name, file) {
            fileName = file.originalFilename;
            fileType = fileName.split('.').pop();
            if (fileType != 'xlsx' && fileType != 'csv' && fileType != 'gsheet') {
                console.log('incorrect file type: ' + fileType);
                success = false;
            }
        });

        form.parse(req, function (err, fields, files) {
            if (err) {
                res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
                res.end(String(err));
                return;
            }
            if (success) {
                console.log(fileType);
                console.log(fileName);
                console.log(fields);

                if (fields.column1 === '') {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write('<div class="error">Please enter a column 1</div>');
                    res.end();
                } else if (fields.column2 === '') {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write('<div class="error">Please enter a column 2</div>');
                    res.end();
                } else {
                    var pythonData = fileName + " " + fields.column1 + " " + fields.column2 + " " + fields.columnCS;
                    var graph = '3D.py';

                    if (fields.column3 === '') {
                        if (fields.graphType === 'bar') {
                            graph = 'Bar.py';
                        } else if (fields.graphType === 'scatter') {
                            graph = 'Scatter.py';
                        } else {
                            graph = 'Line.py';
                        }
                    } else {
                        pythonData += " " + fields.column3;
                    }

                    console.log(graph);
                    console.log(pythonData);

                    // Call child process here?
                    const { spawn } = require('child_process');
                    const childPython = spawn('python3', [graph]);

                    childPython.stdout.on('data', (data) => {
                        console.log(`stdout: ${data}`);
                    });

                    childPython.stderr.on('data', (data) => {
                        console.error(`stderr: ${data}`);
                    });

                    childPython.stdin.write(`${pythonData}\n`);
                    childPython.stdin.end();

                    childPython.on('close', (code) => {
                        console.log(`child process exited with code ${code}`);
                    });

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write('<div class="success">File successfully uploaded</div>');
                    res.end();
                }
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write('<div class="error">Unsupported file type</div>');
                res.end();
            }
        });
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<!DOCTYPE html>');
        res.write('<html>');
        res.write('<head>');
        res.write('<style>');
        res.write('body {');
        res.write('  font-family: Arial, sans-serif;');
        res.write('  background-color: #f2f2f2;');
        res.write('  padding: 20px;');
        res.write('}');

        res.write('form {');
        res.write('  max-width: 500px;');
        res.write('  margin: 0 auto;');
        res.write('  background-color: #fff;');
        res.write('  padding: 20px;');
        res.write('  border-radius: 5px;');
        res.write('  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);');
        res.write('}');

        res.write('input[type="text"], input[type="file"], input[type="submit"] {');
        res.write('  width: 100%;');
        res.write('  padding: 10px;');
        res.write('  margin-bottom: 10px;');
        res.write('  border: 1px solid #ccc;');
        res.write('  border-radius: 4px;');
        res.write('}');

        res.write('input[type="radio"] {');
        res.write('  margin-right: 5px;');
        res.write('}');

        res.write('label {');
        res.write('  display: block;');
        res.write('  margin-top: 10px;');
        res.write('  font-weight: bold;');
        res.write('}');

        res.write('.error {');
        res.write('  color: #f00;');
        res.write('  font-weight: bold;');
        res.write('  margin-bottom: 10px;');
        res.write('}');

        res.write('.success {');
        res.write('  color: #0f0;');
        res.write('  font-weight: bold;');
        res.write('  margin-bottom: 10px;');
        res.write('}');

        res.write('input[type="submit"]:hover {');
        res.write('  background-color: #4CAF50;');
        res.write('  color: white;');
        res.write('}');

        res.write('input[type="submit"]:focus {');
        res.write('  outline: none;');
        res.write('  box-shadow: 0 0 5px rgba(81, 203, 238, 1);');
        res.write('}');

        res.write('input[type="file"]:hover {');
        res.write('  background-color: #f2f2f2;');
        res.write('  cursor: pointer;');
        res.write('}');

        res.write('input[type="file"]::-webkit-file-upload-button {');
        res.write('  background-color: #4CAF50;');
        res.write('  color: white;');
        res.write('  padding: 10px;');
        res.write('  border: none;');
        res.write('  border-radius: 4px;');
        res.write('  cursor: pointer;');
        res.write('}');

        res.write('input[type="file"]::-webkit-file-upload-button:hover {');
        res.write('  background-color: #45a049;');
        res.write('}');

        res.write('</style>');
        res.write('</head>');
        res.write('<body>');
        res.write('<h1>GraphIT</h1>');
        res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
        res.write('<label for="column1">Column 1:</label><br>');
        res.write('<input type="text" name="column1"><br>');
        res.write('<label for="column2">Column 2:</label><br>');
        res.write('<input type="text" name="column2"><br>');
        res.write('<label for="column3">Column 3 (for 3D, optional):</label><br>');
        res.write('<input type="text" name="column3"><br>');
        res.write('<label for="columnCS">ColorScale Column:</label><br>');
        res.write('<input type="text" name="columnCS"><br>');
        res.write('<label>Graph Type:</label><br>');
        res.write('<input type="radio" name="graphType" value="bar">Bar Graph<br>');
        res.write('<input type="radio" name="graphType" value="scatter">Scatter Plot<br>');
        res.write('<input type="radio" name="graphType" value="line">Line Graph<br>');
        res.write('<label for="filetoupload">Select File:</label><br>');
        res.write('<input type="file" name="filetoupload"><br>');
        res.write('<input type="submit" value="Upload">');
        res.write('</form>');
        res.write('</body>');
        res.write('</html>');
        res.end();
    }
});

server.listen(8080, function () {
    console.log('Server is running on port 8080');
});
