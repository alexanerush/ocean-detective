const SwaggerParser = require('@apidevtools/swagger-parser');
const path = require('node:path');

async function main() {
  const file = path.resolve(__dirname, '../docs/openapi.yaml');
  const api = await SwaggerParser.validate(file);

  console.log('OpenAPI specification is valid.');
  console.log('API:', api.info.title);
  console.log('Version:', api.info.version);
  console.log('OpenAPI:', api.openapi);
  console.log('Paths:', Object.keys(api.paths).length);
}

main().catch(error => {
  console.error('OpenAPI validation failed:', error.message);
  process.exit(1);
});
