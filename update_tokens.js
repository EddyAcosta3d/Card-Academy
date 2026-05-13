const fs = require('fs');
let content = fs.readFileSync('src/constants.ts', 'utf8');

content = content.replace(/(difficulty:\s*'Easy'.*?tokens:\s*)\d+(.*?})/g, '$125$2');
content = content.replace(/(difficulty:\s*'Medium'.*?tokens:\s*)\d+(.*?})/g, '$150$2');
content = content.replace(/(difficulty:\s*'Hard'.*?tokens:\s*)\d+(.*?})/g, '$1150$2');

fs.writeFileSync('src/constants.ts', content);
