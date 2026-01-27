#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


  // Funció per obrir selector de carpetes
function selectFolder() {
  return new Promise((resolve, reject) => {
    const script = `
      tell application "Finder"
        set theFolder to choose folder with prompt "Selecciona la carpeta amb les imatges PNG:"
        return POSIX path of theFolder
      end tell
    `;
    
    exec(`osascript -e '${script}'`, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

// Funció principal
async function main() {
  try {
    console.log('Seleccionant carpeta...');
    const folderPath = await selectFolder();
    console.log(`Carpeta seleccionada: ${folderPath}`);
    
function findImageFiles(dir) {
  const files = [];
  const supportedFormats = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.bmp', '.tiff', '.tif', '.webp', '.ico'];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath); // Buscar en subdirectoris
      } else {
        const ext = path.extname(item).toLowerCase();
        if (supportedFormats.includes(ext)) {
          files.push(fullPath);
        }
      }
    });
  }
  
  scanDirectory(dir);
  return files;
}

const files = findImageFiles(folderPath);

console.log(`Trobats ${files.length} fitxers d'imatge`);

// Agrupar per disseny (colors blanc/negre)
const designs = new Map();


files.forEach(file => {
  const filePath = file; // ja té la ruta completa
  
// Analitzar el nom de la carpeta per extreure colors
const dirName = path.dirname(file);
const folderName = path.basename(dirName).toLowerCase();
let designColor;

// Buscar colors al nom de la carpeta
if (folderName.includes('blanc-negre') || folderName.includes('white-black')) {
  designColor = 'blanc-negre';
} else if (folderName.includes('blanc') || folderName.includes('white')) {
  designColor = 'blanc';
} else if (folderName.includes('negre') || folderName.includes('black')) {
  designColor = 'negre';
} else if (folderName.includes('vermell') || folderName.includes('red')) {
  designColor = 'vermell';
} else if (folderName.includes('blau') || folderName.includes('blue') || folderName.includes('navy')) {
  designColor = 'blau';
} else if (folderName.includes('verd') || folderName.includes('green')) {
  designColor = 'verd';
} else if (folderName.includes('groc') || folderName.includes('yellow')) {
  designColor = 'groc';
} else if (folderName.includes('gris') || folderName.includes('gray')) {
  designColor = 'gris';
} else if (folderName.includes('royal')) {
  designColor = 'royal';
} else if (folderName.includes('forest')) {
  designColor = 'forest';
} else if (folderName.includes('military')) {
  designColor = 'military';
} else {
  designColor = 'altres';
}
  
  if (!designs.has(designColor)) {
  designs.set(designColor, []);
}
designs.get(designColor).push(file);
});

// Renombrar fitxers
for (const [designColor, imageFiles] of designs) {
  const designName = designColor; // ja té el nom correcte
  
  imageFiles.forEach(file => {
    const oldPath = file; // ja té la ruta completa
    const shirtColor = ['blanc', 'negre', 'gris', 'vermell', 'blau', 'verd', 'groc'][Math.floor(Math.random() * 7)];
    const newName = `${designName}-${designColor}-${shirtColor}.png`;
    const newPath = path.join(path.dirname(file), newName); // mateix directori, nou nom
    
    fs.renameSync(oldPath, newPath);
    console.log(`Renombrat: ${file} -> ${newName}`);
  });
}

console.log(`Processat completat! ${designs.size} dissenys.`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
  }
}

main();