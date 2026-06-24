import * as fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { componentFactoryTemplate } from '../template';
import {
  ComponentFactoryPluginConfig,
  ComponentFactoryPlugin as ComponentFactoryPluginType,
} from '..';

export interface PackageDefinition {
  name: string;
  components: {
    moduleName: string;
    componentName: string;
  }[];
}

const componentFactoryPath = path.resolve('src/components/componentFactory.ts');
const componentRootPath = 'src/components';

function watchComponentFactory(config: ComponentFactoryPluginConfig) {
  console.log(`Watching for changes to React component factory sources in ${componentRootPath}...`);

  chokidar
    .watch(componentRootPath, { ignoreInitial: true, awaitWriteFinish: true })
    .on('add', writeComponentFactory.bind(null, config))
    .on('unlink', writeComponentFactory.bind(null, config));
}

function writeComponentFactory(config: ComponentFactoryPluginConfig) {
  const componentFactory = generateComponentFactory(config);

  console.log(`Writing component factory to ${componentFactoryPath}`);

  fs.writeFileSync(componentFactoryPath, componentFactory, { encoding: 'utf8' });
}

function generateComponentFactory(config: ComponentFactoryPluginConfig) {
  const imports: string[] = [];
  const registrations: string[] = [];
  const lazyRegistrations: string[] = [];
  const declarations: string[] = [];

  config.packages.forEach((p) => {
    const variables = p.components
      .map((c) => {
        registrations.push(`{ name: '${c.componentName}', type: ${c.moduleName} },`);
        config.components.push(c.componentName);

        return c.moduleName;
      })
      .join(', ');
    imports.push(`import { ${variables} } from '${p.name}'`);
  });

  if (fs.existsSync(componentRootPath)) {
    fs.readdirSync(componentRootPath).forEach((fileOrFolder) => {
      let componentName = '';
      let importPath = '';

      // 1. Resolve standard single TSX files
      if (fileOrFolder.endsWith('.tsx')) {
        componentName = fileOrFolder.replace('.tsx', '');
        importPath = `./${componentName}`;
      } 
      // 2. Resolve subfolder structures cleanly
      else if (!fileOrFolder.includes('.') && fileOrFolder !== '.gitignore') {
        const nestedFilePath = path.join(componentRootPath, fileOrFolder, `${fileOrFolder}.tsx`);
        
        if (fs.existsSync(nestedFilePath)) {
          componentName = fileOrFolder;
          importPath = `./${fileOrFolder}/${fileOrFolder}`;
        } else {
          return;
        }
      } else {
        return; 
      }

      // Safeguard core system filenames
      if (componentName === 'componentFactory' || componentName === 'index') return;

      console.log(`[VERIFY REGISTRATION] Mapping secure default export target for: ${componentName}`);
      config.components.push(componentName);

      // FORCE EXPLICIT DEFAULT EXPORT LOADING:
      // Pulls the component default export layout directly, shielding Next.js from processing auxiliary internal functions.
      imports.push(`import ${componentName}Component from '${importPath}';`);
      
      // Register the resolved primary component safely into the array
      registrations.push(
        `{ name: '${componentName}', type: ${componentName}Component },`
      );
    });
  }

  return componentFactoryTemplate({
    imports,
    components: config.components,
    registrations,
    lazyRegistrations,
    declarations,
  });
}

class ComponentFactoryPlugin implements ComponentFactoryPluginType {
  order = 9999;

  exec(config: ComponentFactoryPluginConfig) {
    if (config.watch) {
      watchComponentFactory(config);
    } else {
      writeComponentFactory(config);
    }

    return config;
  }
}

// --- SECURE SITECORE DEFAULT INSTANCE EXPORT ---
const pluginInstance = new ComponentFactoryPlugin();
export default pluginInstance;