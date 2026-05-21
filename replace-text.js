import fs from 'node:fs';
import path from 'node:path';

const files = [
  'src/components/app-header.tsx',
  'src/components/app-sidebar.tsx',
  'src/components/mobile-shell.tsx',
  'src/components/work-order-page.tsx',
  'src/lib/pickup-store.ts',
  'src/routes/index.tsx',
  'src/routes/m.animals.$id.tsx',
  'src/routes/m.barns.$id.tsx',
  'src/routes/m.health.$id.tsx',
  'src/routes/m.health.index.tsx',
  'src/routes/m.index.tsx',
  'src/routes/m.me.tsx',
  'src/routes/m.notifications.tsx',
  'src/routes/m.pickup.$id.tsx',
  'src/routes/m.report.tsx',
  'src/routes/m.workspace.tsx',
  'src/routes/organization.role.tsx',
  'src/routes/production.deworm.tsx',
  'src/routes/production.disease.tsx',
  'src/routes/production.drying.tsx',
  'src/routes/production.general.tsx',
  'src/routes/production.hoof.tsx',
  'src/routes/settings.index.tsx',
  'src/routes/settings.rules.tsx',
  'src/routes/warehouse.dispense.tsx',
  'src/routes/workspace.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const updatedContent = content.replace(/工单/g, '工作');
    if (content !== updatedContent) {
      fs.writeFileSync(file, updatedContent);
      console.log(`Updated ${file}`);
    }
  }
});
