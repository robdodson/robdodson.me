const fs = require('fs');
const path = require('path');

function combineMarkdownFiles(inputDirectory, outputFile) {
  fs.readdir(inputDirectory, (err, files) => {
    if (err) {
      return console.error(`Unable to scan directory: ${err}`);
    }

    const markdownFiles = files.filter(file => path.extname(file) === '.md').sort();

    let combinedContent = '';
    markdownFiles.forEach(file => {
      const filePath = path.join(inputDirectory, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      combinedContent += fileContent + '\n\n';
    });

    fs.writeFileSync(outputFile, combinedContent, 'utf-8');
    console.log(`All markdown files from ${inputDirectory} have been combined into ${outputFile}.`);
  });
}

// Usage
const inputDirectory = '/Users/robdodson/Developer/robdodson.me/src/posts';
const outputFile = '/Users/robdodson/Developer/robdodson.me/combined_markdown.md';
combineMarkdownFiles(inputDirectory, outputFile);
