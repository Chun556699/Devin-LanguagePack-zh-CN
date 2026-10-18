const path = require('path');
const { detectAllDevinAppRoots, applyZhCnPatch } = require('./extension/runtime/patcher.js');

const appRootArg = process.argv[2] || undefined;
try {
  console.log('====================================================');
  console.log('  Devin / Devin Next 简体中文 (zh-CN) 全量汉化安装程序');
  console.log('====================================================');
  const appRoots = detectAllDevinAppRoots(appRootArg);
  for (const appRoot of appRoots) {
    const res = applyZhCnPatch({
      appRoot,
      sourceExtDir: path.join(__dirname, 'extension')
    });
    console.log('\n>>> 目标版本: ' + res.paths.appNameLong + ' (' + res.paths.appRoot + ')');
    console.log('[√] 已安装扩展至:', res.extInfo.activeExtDir);
    console.log('[√] 已生成语言包配置与 CLP 缓存 (Hash: ' + res.hash + ') -> ' + res.paths.appDataDir);
    console.log('[√] 已设置 ~/' + res.paths.dataFolderName + '/argv.json 显示语言为: zh-cn');
    console.log('[√] 已注入 Devin / Devin Next / Cascade / Sessions 界面汉化运行时');
    console.log('[√] 已汉化内置扩展清单并同步 product.json 校验和');
  }
  console.log('----------------------------------------------------');
  console.log('安装成功！请启动或重启 Devin / Devin - Next 即可体验完整简体中文界面。');
} catch (err) {
  console.error('[×] 安装失败:', err.message);
  process.exit(1);
}
