const fs = require('fs');
const path = require('path');

// Lista de templates disponibles
const templates = [
  { file: 'recordatorio_pago.html', name: 'emailTemplate' },
  { file: 'fiestas_patrias.html', name: 'fiestasPatriasTemplate' },
  { file: 'ano_nuevo.html', name: 'anoNuevoTemplate' },
  { file: 'navidad.html', name: 'navidadTemplate' },
  { file: 'primavera.html', name: 'primaveraTemplate' },
  { file: 'elegante.html', name: 'eleganteTemplate' }
];

let tsContent = '';

// Procesar cada template
templates.forEach(template => {
  try {
    const htmlPath = path.join(__dirname, template.file);
    if (fs.existsSync(htmlPath)) {
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      const escapedHtml = htmlContent.replace(/`/g, '\\`').replace(/\$/g, '\\$');
      
      tsContent += `export const ${template.name} = \`${escapedHtml}\`;\n\n`;
      console.log(`✅ ${template.name} generado desde ${template.file}`);
    } else {
      console.log(`⚠️  Archivo no encontrado: ${template.file}`);
    }
  } catch (error) {
    console.log(`❌ Error procesando ${template.file}:`, error.message);
  }
});

// Escribir el archivo TypeScript
const tsPath = path.join(__dirname, 'emailTemplate.ts');
fs.writeFileSync(tsPath, tsContent);

console.log('\n🎉 ¡Todos los templates generados exitosamente en emailTemplate.ts!');