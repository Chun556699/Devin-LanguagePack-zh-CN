const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const EXT_ID = 'ms-ceintl.vscode-language-pack-zh-hans';
const EXT_VERSION = '1.126.0';
const EXT_UUID = 'e4ee7651-60b4-4739-adb6-d6cfe051f6aa';
const RUNTIME_START = '/* DEVIN_ZH_CN_RUNTIME_START */';
const RUNTIME_END = '/* DEVIN_ZH_CN_RUNTIME_END */';

function computeChecksum(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('base64').replace(/=+$/, '');
}

function normalizeAppCandidate(dir) {
  if (!dir) return null;
  const cleaned = dir.replace(/^["']|["']$/g, '').trim();
  if (!cleaned) return null;
  const subCandidates = [
    cleaned,
    path.join(cleaned, 'resources', 'app'),
    path.join(cleaned, 'Contents', 'Resources', 'app')
  ];
  for (const sub of subCandidates) {
    if (fs.existsSync(path.join(sub, 'product.json')) && fs.existsSync(path.join(sub, 'out', 'nls.keys.json'))) {
      return sub;
    }
  }
  return null;
}

function getCandidateDirs() {
  const folderNames = ['Devin', 'Devin Next', 'Devin - Next'];
  const candidates = [
    path.resolve(__dirname, '..', '..', '..'),
    path.resolve(__dirname, '..', '..', '..', '..')
  ];

  for (const name of folderNames) {
    candidates.push(
      path.join(process.env.LOCALAPPDATA || '', 'Programs', name),
      path.join(process.env.LOCALAPPDATA || '', name),
      path.join(process.env.PROGRAMFILES || '', name),
      path.join(process.env['PROGRAMFILES(X86)'] || '', name),
      '/Applications/' + name + '.app',
      path.join(os.homedir(), 'Applications', name + '.app')
    );
  }

  candidates.push(
    '/usr/share/devin',
    '/usr/share/devin-next',
    '/usr/share/devin-desktop',
    '/usr/share/devin-desktop-next',
    '/opt/devin',
    '/opt/Devin',
    '/opt/devin-next',
    '/opt/Devin Next',
    '/opt/Devin - Next'
  );

  if (process.platform === 'win32') {
    for (let code = 67; code <= 90; code++) {
      const drive = String.fromCharCode(code) + ':\\';
      for (const name of folderNames) {
        candidates.push(path.join(drive, name));
        candidates.push(path.join(drive, 'Program Files', name));
        candidates.push(path.join(drive, 'Programs', name));
      }
    }
    const pathDirs = (process.env.PATH || '').split(path.delimiter);
    for (const p of pathDirs) {
      if (p && p.toLowerCase().includes('devin')) {
        candidates.push(path.resolve(p, '..'));
      }
    }
  }
  return candidates;
}

function detectDevinAppRoot(explicitAppRoot) {
  const fromExplicit = normalizeAppCandidate(explicitAppRoot || process.env.DEVIN_APP_ROOT || process.env.DEVIN_PATH);
  if (fromExplicit) return fromExplicit;

  for (const c of getCandidateDirs()) {
    const resolved = normalizeAppCandidate(c);
    if (resolved) return resolved;
  }
  throw new Error(
    '未自动找到 Devin / Devin Next 安装目录 (resources/app)。请在命令行传入安装路径，例如: node install-zh-cn.js "D:\\Devin" 或 "D:\\Devin Next"'
  );
}

function detectAllDevinAppRoots(explicitAppRoot) {
  if (explicitAppRoot && explicitAppRoot !== '--all') {
    const single = normalizeAppCandidate(explicitAppRoot);
    if (single) return [single];
    throw new Error('指定的路径不是有效的 Devin / Devin Next 安装目录: ' + explicitAppRoot);
  }

  if (explicitAppRoot !== '--all') {
    const envRoot = normalizeAppCandidate(process.env.DEVIN_APP_ROOT || process.env.DEVIN_PATH);
    if (envRoot) return [envRoot];

    // If the plugin directory itself is placed inside a specific Devin / Devin Next installation, target that installation
    const parentCandidate =
      normalizeAppCandidate(path.resolve(__dirname, '..', '..', '..')) ||
      normalizeAppCandidate(path.resolve(__dirname, '..', '..', '..', '..'));
    if (parentCandidate) {
      return [parentCandidate];
    }
  }

  const found = [];
  const seen = new Set();
  for (const c of getCandidateDirs()) {
    const resolved = normalizeAppCandidate(c);
    if (resolved) {
      const key = process.platform === 'win32' ? resolved.toLowerCase() : resolved;
      if (!seen.has(key)) {
        seen.add(key);
        found.push(resolved);
      }
    }
  }
  if (found.length === 0) {
    throw new Error(
      '未自动找到 Devin / Devin Next 安装目录 (resources/app)。请在命令行传入安装路径，例如: node install-zh-cn.js "D:\\Devin" 或 "D:\\Devin Next"'
    );
  }
  return found;
}

function getDefaultAppDataDir(userHome, appNameLong = 'Devin') {
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(userHome, 'AppData', 'Roaming'), appNameLong);
  }
  if (process.platform === 'darwin') {
    return path.join(userHome, 'Library', 'Application Support', appNameLong);
  }
  return path.join(process.env.XDG_CONFIG_HOME || path.join(userHome, '.config'), appNameLong);
}

function getPaths(options = {}) {
  const appRoot = detectDevinAppRoot(options.appRoot);
  const productJsonPath = path.join(appRoot, 'product.json');
  let product = {};
  if (fs.existsSync(productJsonPath)) {
    try {
      product = JSON.parse(fs.readFileSync(productJsonPath, 'utf8'));
    } catch (e) {}
  }
  const appNameLong = product.nameLong || product.nameShort || 'Devin';
  const dataFolderName = product.dataFolderName || '.devin';
  const appVersion = product.version || EXT_VERSION;

  const userHome = options.userHome || os.homedir();
  const appDataDir = options.appDataDir || getDefaultAppDataDir(userHome, appNameLong);
  const dotDevinDir = options.dotDevinDir || path.join(userHome, dataFolderName);
  const extensionsDir = path.join(dotDevinDir, 'extensions');
  const installedExtDir = path.join(extensionsDir, EXT_ID + '-' + EXT_VERSION);
  return {
    appRoot,
    appNameLong,
    dataFolderName,
    appVersion,
    userHome,
    appDataDir,
    dotDevinDir,
    extensionsDir,
    installedExtDir,
    productJsonPath,
    workbenchJsPath: path.join(appRoot, 'out', 'vs', 'code', 'electron-browser', 'workbench', 'workbench.js'),
    sessionsJsPath: path.join(appRoot, 'out', 'vs', 'sessions', 'electron-browser', 'sessions.js'),
    chatClientDir: path.join(appRoot, 'out', 'vs', 'workbench', 'windsurf-chat-client'),
    webappHostDir: path.join(appRoot, 'out', 'vs', 'workbench', 'devin-webapp-host'),
    builtinExtsDir: path.join(appRoot, 'extensions')
  };
}

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function stripRuntimeBlock(code) {
  const startIdx = code.indexOf(RUNTIME_START);
  const endIdx = code.indexOf(RUNTIME_END);
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    return code.slice(0, startIdx) + code.slice(endIdx + RUNTIME_END.length).replace(/^\r?\n/, '');
  }
  return code;
}

function translateManifestObject(obj, dict) {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    if (['title', 'description', 'markdownDescription', 'displayName', 'label', 'name', 'category'].includes(k) && typeof v === 'string') {
      if (dict[v]) {
        obj[k] = dict[v];
      }
    } else if (typeof v === 'object') {
      translateManifestObject(v, dict);
    }
  }
}

function clearBuiltinExtensionCaches(appDataDir) {
  const profilesDir = path.join(appDataDir, 'CachedProfilesData');
  if (!fs.existsSync(profilesDir)) return;
  for (const entry of fs.readdirSync(profilesDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const cacheFile = path.join(profilesDir, entry.name, 'extensions.builtin.cache');
      if (fs.existsSync(cacheFile)) {
        try { fs.unlinkSync(cacheFile); } catch (e) {}
      }
    }
  }
}

function updateArgvLocale(dotDevinDir, localeValue) {
  fs.mkdirSync(dotDevinDir, { recursive: true });
  const argvPath = path.join(dotDevinDir, 'argv.json');
  let content = '{\n\t"locale": "' + localeValue + '"\n}\n';
  if (fs.existsSync(argvPath)) {
    const raw = fs.readFileSync(argvPath, 'utf8');
    if (/"locale"\s*:\s*"[^"]*"/.test(raw)) {
      content = raw.replace(/"locale"\s*:\s*"[^"]*"/, '"locale": "' + localeValue + '"');
    } else {
      const lastBrace = raw.lastIndexOf('}');
      if (lastBrace !== -1) {
        const before = raw.slice(0, lastBrace).trimEnd();
        const needsComma = !before.endsWith('{') && !before.endsWith(',');
        content = before + (needsComma ? ',\n' : '\n') + '\t"locale": "' + localeValue + '"\n}\n';
      }
    }
  }
  fs.writeFileSync(argvPath, content, 'utf8');
}

function ensureExtensionRegistered(paths, sourceExtDir) {
  fs.mkdirSync(paths.extensionsDir, { recursive: true });
  const resolvedSrc = path.resolve(sourceExtDir);
  const resolvedDest = path.resolve(paths.installedExtDir);
  if (resolvedSrc.toLowerCase() !== resolvedDest.toLowerCase()) {
    copyDirRecursive(resolvedSrc, resolvedDest);
  }

  const extJsonPath = path.join(paths.extensionsDir, 'extensions.json');
  let list = [];
  if (fs.existsSync(extJsonPath)) {
    try { list = JSON.parse(fs.readFileSync(extJsonPath, 'utf8')); } catch (e) { list = []; }
    if (!Array.isArray(list)) list = [];
  }

  const existing = list.find(item => item && item.identifier && item.identifier.id && item.identifier.id.toLowerCase() === EXT_ID);
  const uuid = (existing && existing.identifier && existing.identifier.uuid) || EXT_UUID;
  const version = (existing && existing.version) || EXT_VERSION;
  const activeExtDir = (existing && existing.location && existing.location.fsPath && fs.existsSync(existing.location.fsPath))
    ? existing.location.fsPath
    : paths.installedExtDir;

  if (!existing) {
    const fsPathNormalized = paths.installedExtDir;
    const isWin = process.platform === 'win32' && /^[a-zA-Z]:/.test(fsPathNormalized);
    const fsPathFinal = isWin ? fsPathNormalized[0].toLowerCase() + fsPathNormalized.slice(1) : fsPathNormalized;
    const slashPath = isWin ? '/' + fsPathFinal.replace(/\\/g, '/') : fsPathFinal;
    const externalUri = isWin
      ? 'file:///' + encodeURIComponent(fsPathFinal.slice(0, 2)) + fsPathFinal.slice(2).replace(/\\/g, '/')
      : 'file://' + slashPath;
    const locationObj = {
      $mid: 1,
      fsPath: fsPathFinal,
      external: externalUri,
      path: slashPath,
      scheme: 'file'
    };
    if (isWin) locationObj._sep = 1;
    list.push({
      identifier: { id: EXT_ID, uuid: EXT_UUID },
      version: EXT_VERSION,
      location: locationObj,
      relativeLocation: EXT_ID + '-' + EXT_VERSION,
      metadata: {
        id: EXT_UUID,
        publisherId: 'ms-ceintl',
        publisherDisplayName: 'Microsoft',
        targetPlatform: 'undefined',
        installedTimestamp: Date.now(),
        isPreReleaseVersion: false,
        hasPreReleaseVersion: false
      }
    });
    fs.writeFileSync(extJsonPath, JSON.stringify(list), 'utf8');
  }

  return { uuid, version, activeExtDir };
}

function buildLanguagePackAndClpCache(paths, extInfo) {
  const { uuid, version, activeExtDir } = extInfo;
  const pkg = JSON.parse(fs.readFileSync(path.join(activeExtDir, 'package.json'), 'utf8'));
  const loc = pkg.contributes.localizations[0];
  const translations = {};
  for (const t of loc.translations) {
    translations[t.id] = path.join(activeExtDir, t.path.replace(/^\.\//, ''));
  }

  const hash = crypto.createHash('md5').update(uuid || EXT_ID).update(version).digest('hex');
  fs.mkdirSync(paths.appDataDir, { recursive: true });
  const lpFilePath = path.join(paths.appDataDir, 'languagepacks.json');
  let lpData = {};
  if (fs.existsSync(lpFilePath)) {
    try { lpData = JSON.parse(fs.readFileSync(lpFilePath, 'utf8')); } catch (e) { lpData = {}; }
  }
  lpData['zh-cn'] = {
    hash,
    extensions: [
      {
        extensionIdentifier: { id: EXT_ID, uuid },
        version
      }
    ],
    translations,
    label: '中文(简体)'
  };
  fs.writeFileSync(lpFilePath, JSON.stringify(lpData, null, 2), 'utf8');

  const product = JSON.parse(fs.readFileSync(paths.productJsonPath, 'utf8'));
  const commit = product.commit;
  if (commit) {
    const clpRoot = path.join(paths.appDataDir, 'clp', hash + '.zh-cn');
    const clpCommitDir = path.join(clpRoot, commit);
    fs.mkdirSync(clpCommitDir, { recursive: true });

    const nlsKeys = JSON.parse(fs.readFileSync(path.join(paths.appRoot, 'out', 'nls.keys.json'), 'utf8'));
    const nlsDefaultMsgs = JSON.parse(fs.readFileSync(path.join(paths.appRoot, 'out', 'nls.messages.json'), 'utf8'));
    const mainI18n = JSON.parse(fs.readFileSync(translations['vscode'], 'utf8'));

    const compiledMsgs = [];
    let idx = 0;
    for (const [modName, keys] of nlsKeys) {
      const modTrans = mainI18n.contents[modName];
      for (const k of keys) {
        compiledMsgs.push((modTrans && modTrans[k]) || nlsDefaultMsgs[idx]);
        idx++;
      }
    }

    fs.writeFileSync(path.join(clpCommitDir, 'nls.messages.json'), JSON.stringify(compiledMsgs), 'utf8');
    fs.writeFileSync(
      path.join(clpCommitDir, 'nls.messages.js'),
      'globalThis._VSCODE_NLS_MESSAGES=' + JSON.stringify(compiledMsgs) + ';',
      'utf8'
    );
    fs.writeFileSync(path.join(clpRoot, 'tcf.json'), JSON.stringify(translations), 'utf8');
  }
  return hash;
}

function patchFilesAndChecksums(paths, sourceExtDir) {
  const runtimeFile = path.join(sourceExtDir, 'runtime', 'devin-zh-cn-runtime.js');
  const pkgDictFile = path.join(sourceExtDir, 'runtime', 'windsurf-pkg-zh.json');
  const runtimeContent = fs.readFileSync(runtimeFile, 'utf8');
  const pkgDict = JSON.parse(fs.readFileSync(pkgDictFile, 'utf8'));

  // 1. Copy runtime to windsurf-chat-client and devin-webapp-host directories for reference
  for (const dir of [paths.chatClientDir, paths.webappHostDir]) {
    if (dir && fs.existsSync(dir)) {
      fs.writeFileSync(path.join(dir, 'devin-zh-cn-runtime.js'), runtimeContent, 'utf8');
    }
  }

  // 2. Inject runtime into workbench.js and sessions.js
  for (const targetJs of [paths.workbenchJsPath, paths.sessionsJsPath]) {
    if (!fs.existsSync(targetJs)) continue;
    const bakPath = targetJs + '.zh-bak';
    const currentCode = fs.readFileSync(targetJs, 'utf8');
    if (!fs.existsSync(bakPath)) {
      fs.writeFileSync(bakPath, stripRuntimeBlock(currentCode), 'utf8');
    }
    const cleanCode = stripRuntimeBlock(currentCode);
    const patchedCode = runtimeContent.trim() + '\n' + cleanCode;
    fs.writeFileSync(targetJs, patchedCode, 'utf8');
  }

  // 3. Localize built-in windsurf* extension package.json manifests
  if (fs.existsSync(paths.builtinExtsDir)) {
    const dirs = fs.readdirSync(paths.builtinExtsDir).filter(d => d.startsWith('windsurf'));
    for (const d of dirs) {
      const pkgPath = path.join(paths.builtinExtsDir, d, 'package.json');
      if (!fs.existsSync(pkgPath)) continue;
      const bakPath = pkgPath + '.zh-bak';
      if (!fs.existsSync(bakPath)) {
        fs.copyFileSync(pkgPath, bakPath);
      }
      const origManifest = JSON.parse(fs.readFileSync(bakPath, 'utf8'));
      translateManifestObject(origManifest, pkgDict);
      fs.writeFileSync(pkgPath, JSON.stringify(origManifest, null, 2) + '\n', 'utf8');
    }
  }
  clearBuiltinExtensionCaches(paths.appDataDir);

  // 4. Synchronize product.json checksums
  const prodBakPath = paths.productJsonPath + '.zh-bak';
  if (!fs.existsSync(prodBakPath)) {
    fs.copyFileSync(paths.productJsonPath, prodBakPath);
  }
  const product = JSON.parse(fs.readFileSync(paths.productJsonPath, 'utf8'));
  if (product.checksums && typeof product.checksums === 'object') {
    for (const relPath of Object.keys(product.checksums)) {
      const absFile = path.join(paths.appRoot, 'out', ...relPath.split('/'));
      if (fs.existsSync(absFile)) {
        product.checksums[relPath] = computeChecksum(absFile);
      }
    }
    fs.writeFileSync(paths.productJsonPath, JSON.stringify(product, null, '\t') + '\n', 'utf8');
  }
}

function isPatchComplete(options = {}) {
  try {
    const paths = getPaths(options);
    if (!fs.existsSync(paths.workbenchJsPath)) return false;
    const wbCode = fs.readFileSync(paths.workbenchJsPath, 'utf8');
    if (!wbCode.includes(RUNTIME_START)) return false;
    const lpFilePath = path.join(paths.appDataDir, 'languagepacks.json');
    if (!fs.existsSync(lpFilePath)) return false;
    const lp = JSON.parse(fs.readFileSync(lpFilePath, 'utf8'));
    if (!lp['zh-cn'] || !lp['zh-cn'].hash) return false;
    const argvPath = path.join(paths.dotDevinDir, 'argv.json');
    if (!fs.existsSync(argvPath)) return false;
    const argvRaw = fs.readFileSync(argvPath, 'utf8');
    if (!/"locale"\s*:\s*"zh-cn"/i.test(argvRaw)) return false;
    return true;
  } catch (e) {
    return false;
  }
}

function applyZhCnPatch(options = {}) {
  const paths = getPaths(options);
  const sourceExtDir = options.sourceExtDir || path.resolve(__dirname, '..');
  const extInfo = ensureExtensionRegistered(paths, sourceExtDir);
  const hash = buildLanguagePackAndClpCache(paths, extInfo);
  updateArgvLocale(paths.dotDevinDir, 'zh-cn');
  patchFilesAndChecksums(paths, extInfo.activeExtDir);
  return { paths, hash, extInfo };
}

function removeZhCnPatch(options = {}) {
  const paths = getPaths(options);
  for (const targetJs of [paths.workbenchJsPath, paths.sessionsJsPath]) {
    if (!fs.existsSync(targetJs)) continue;
    const bakPath = targetJs + '.zh-bak';
    if (fs.existsSync(bakPath)) {
      fs.copyFileSync(bakPath, targetJs);
      fs.unlinkSync(bakPath);
    } else {
      const cleaned = stripRuntimeBlock(fs.readFileSync(targetJs, 'utf8'));
      fs.writeFileSync(targetJs, cleaned, 'utf8');
    }
  }

  for (const dir of [paths.chatClientDir, paths.webappHostDir]) {
    if (!dir) continue;
    const runtimeRef = path.join(dir, 'devin-zh-cn-runtime.js');
    if (fs.existsSync(runtimeRef)) {
      try { fs.unlinkSync(runtimeRef); } catch (e) {}
    }
  }

  if (fs.existsSync(paths.builtinExtsDir)) {
    const dirs = fs.readdirSync(paths.builtinExtsDir).filter(d => d.startsWith('windsurf'));
    for (const d of dirs) {
      const pkgPath = path.join(paths.builtinExtsDir, d, 'package.json');
      const bakPath = pkgPath + '.zh-bak';
      if (fs.existsSync(bakPath)) {
        fs.copyFileSync(bakPath, pkgPath);
        fs.unlinkSync(bakPath);
      }
    }
  }

  const prodBakPath = paths.productJsonPath + '.zh-bak';
  if (fs.existsSync(prodBakPath)) {
    fs.copyFileSync(prodBakPath, paths.productJsonPath);
    fs.unlinkSync(prodBakPath);
  } else {
    const product = JSON.parse(fs.readFileSync(paths.productJsonPath, 'utf8'));
    if (product.checksums && typeof product.checksums === 'object') {
      for (const relPath of Object.keys(product.checksums)) {
        const absFile = path.join(paths.appRoot, 'out', ...relPath.split('/'));
        if (fs.existsSync(absFile)) {
          product.checksums[relPath] = computeChecksum(absFile);
        }
      }
      fs.writeFileSync(paths.productJsonPath, JSON.stringify(product, null, '\t') + '\n', 'utf8');
    }
  }

  updateArgvLocale(paths.dotDevinDir, 'en');
  clearBuiltinExtensionCaches(paths.appDataDir);
  return { paths };
}

module.exports = {
  detectDevinAppRoot,
  detectAllDevinAppRoots,
  getPaths,
  isPatchComplete,
  applyZhCnPatch,
  removeZhCnPatch,
  computeChecksum
};
