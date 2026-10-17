const vscode = require('vscode');
const path = require('path');
const { isPatchComplete, applyZhCnPatch, removeZhCnPatch } = require('./runtime/patcher.js');

function activate(context) {
  const appRoot = vscode.env.appRoot;
  const sourceExtDir = context.extensionPath || __dirname;

  // Automatically ensure Chinese patch + language pack cache are applied on first install
  try {
    if (!isPatchComplete({ appRoot })) {
      applyZhCnPatch({ appRoot, sourceExtDir });
      vscode.window.showInformationMessage(
        'Devin 简体中文语言包及全量界面汉化补丁已配置完成，重新加载窗口即可完全生效。',
        '立即重新加载 (Reload Window)'
      ).then(selection => {
        if (selection) {
          vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
      });
    }
  } catch (err) {
    console.error('[Devin zh-CN] Auto-patch error:', err);
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('devin-zh-cn.enable', () => {
      try {
        applyZhCnPatch({ appRoot, sourceExtDir });
        vscode.window.showInformationMessage(
          'Devin 简体中文及全量 UI 汉化已启用！是否立即重新加载窗口？',
          '立即重新加载'
        ).then(sel => {
          if (sel) vscode.commands.executeCommand('workbench.action.reloadWindow');
        });
      } catch (e) {
        vscode.window.showErrorMessage('启用简体中文失败: ' + e.message);
      }
    }),
    vscode.commands.registerCommand('devin-zh-cn.disable', () => {
      try {
        removeZhCnPatch({ appRoot });
        vscode.window.showInformationMessage(
          '已恢复 Devin 英文原版设置！是否立即重新加载窗口？',
          '立即重新加载'
        ).then(sel => {
          if (sel) vscode.commands.executeCommand('workbench.action.reloadWindow');
        });
      } catch (e) {
        vscode.window.showErrorMessage('恢复英文原版失败: ' + e.message);
      }
    }),
    vscode.commands.registerCommand('devin-zh-cn.repair', () => {
      try {
        applyZhCnPatch({ appRoot, sourceExtDir });
        vscode.window.showInformationMessage(
          'Devin 中文补丁及校验和已重新同步完成！是否立即重新加载窗口？',
          '立即重新加载'
        ).then(sel => {
          if (sel) vscode.commands.executeCommand('workbench.action.reloadWindow');
        });
      } catch (e) {
        vscode.window.showErrorMessage('修复中文补丁失败: ' + e.message);
      }
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
