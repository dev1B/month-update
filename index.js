const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'input');
const outPath = path.join(__dirname, 'output');

const MM = ("0" + (new Date().getMonth() + 1)).slice(-2);

fs.readdir(inputPath, async (err, files) => {

  if (err) {
    return wrapLog('Unable to scan directory: ' + err);
  }

  if (files.length === 0) {
    return wrapLog('Don\'t have any files in the input directory');
  }

  const promises = files.map(function (fileName) {
    const arr = fileName.split('_');
    const lastElementIndex = arr.length - 1;
    arr[lastElementIndex] = arr[lastElementIndex].replace(/^[0-9]{2}/, MM);

    const newFileName = arr.join('_');

    const oldPath = path.join(inputPath, fileName);
    const newPath = path.join(outPath, newFileName);


    move(oldPath, newPath, newFileName);
  });
  await Promise.all(promises)
    .then(() => wrapLog('All files successful renamed!'))
    .catch(err => wrapLog('Error:', err))
});


function move(oldPath, newPath, fileName) {
  return new Promise((resolve, reject) => {
    fs.rename(oldPath, newPath, function (err) {
      console.log(`Renaming ${fileName}`);
      if (err) {
        if (err.code === 'EXDEV') {
          copy();
        } else {
          reject(err);
        }
        return;
      }
      resolve(fileName);
    });

    function copy() {
      const readStream = fs.createReadStream(oldPath);
      const writeStream = fs.createWriteStream(newPath);

      readStream.on('error', reject);
      writeStream.on('error', reject);

      readStream.on('close', function () {
        fs.unlink(oldPath, () => null);
        resolve(fileName);
      });

      readStream.pipe(writeStream);
    }
  })
};


function wrapLog(...args) {
  const count = 50;
  console.log('*'.repeat(count));
  console.log(...args);
  console.log('*'.repeat(count));
}
