const { removeZhCnPatch } = require('./extension/runtime/patcher.js');

const appRootArg = process.argv[2] || undefined;
try {
  console.log('====================================================');
  console.log('  Devin Desktop 简体中文 (zh-CN) 卸载与恢复原版程序');
  console.log('====================================================');
  const res = removeZhCnPatch({ appRoot: appRootArg });
  console.log('[√] 已恢复 workbench.js / sessions.js / product.json 原始文件');
  console.log('[√] 已恢复内置扩展清单并清理缓存');
  console.log('[√] 已将 ~/.devin/argv.json 恢复为英文 (en)');
  console.log('----------------------------------------------------');
  console.log('恢复完成！请重启 Devin Desktop。');
} catch (err) {
  console.error('[×] 恢复失败:', err.message);
  process.exit(1);
}
