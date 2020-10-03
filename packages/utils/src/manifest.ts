interface BreakPointData {
  language: string;
}

interface ColorData {
  id: string;
  description: string;
  defaults?: Record<string, string>;
}

interface CommandData {
  command: string;
  title: string;
  category?: string;
  icon?: {
    light?: string;
    dark?: string;
  };
}

interface CustomEditorData {
  viewType: string;
  displayName: string;
  selector: {
    filenamePattern: string[];
  }[];
  priority?: 'default' | 'option';
}

interface GrammarData {
  language: string;
  scopeName: string;
  path: string;
  embeddedLanguages: Record<string, string>;
}

interface MenuData {
  when?: string;
  command: string;
  alt?: string;
  group?: string;
}

interface LanguageData {
  id: string;
  extensions: string[];
  aliases?: string[];
  filenames?: string[];
  firstLine?: string;
  configuration?: string;
}

interface JsonValidationData {
  fileMatch: string;
  url: string;
}

interface ContributeData {
  breakpoints?: BreakPointData[];
  colors?: ColorData[];
  commands?: CommandData[];
  configuration?: any;
  configurationDefaults?: any;
  customEditors?: CustomEditorData[];
  debuggers?: any;
  grammars?: GrammarData[];
  iconThemes?: any;
  jsonValidation?: JsonValidationData[];
  keybindings?: any;
  languages?: LanguageData[];
  menus?: Record<string, MenuData[]>;
  problemMatchers?: any;
  problemPatterns?: any;
  productIconThemes?: any;
  resourceLabelFormatters?: any;
  snippets?: any;
  submenus?: any;
  taskDefinitions?: any;
  themes?: any;
  typescriptServerPlugins?: any;
  views?: any;
  viewsContainers?: any;
  viewsWelcome?: any;
  walkthroughs?: any;
}

/**
 * 插件配置数据
 * @link: https://code.visualstudio.com/api/references/extension-manifest
 */
export interface Manifest {
  name: string;
  version: string;
  publisher: string;
  engines: Record<string, string>;
  main: string;
  icon?: string;
  type?: 'module' | 'commonjs',
  license?: string;
  description?: string;
  displayName?: string;
  author?: string;
  categories?: string[];
  keywords?: string[];
  activationEvents?: string[];
  contributes?: ContributeData;
  extensionDependencies?: string[];
}
