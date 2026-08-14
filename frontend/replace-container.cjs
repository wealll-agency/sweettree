const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    // We only want to replace standalone "container" class.
    let newContent = content.replace(/className="container"/g, 'className="container-fluid px-4 px-lg-5"');
    newContent = newContent.replace(/className="container /g, 'className="container-fluid px-4 px-lg-5 ');
    newContent = newContent.replace(/className='container'/g, 'className="container-fluid px-4 px-lg-5"');
    newContent = newContent.replace(/className='container /g, 'className="container-fluid px-4 px-lg-5 ');
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
