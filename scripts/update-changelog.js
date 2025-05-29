const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 変更履歴を更新する関数
function updateChangelog(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const today = new Date().toISOString().split('T')[0];
  
  // 変更履歴セクションを探す
  const changelogRegex = /## 変更履歴\n\n\| 日付 \| バージョン \| 変更内容 \| 担当者 \|\n\|------\|------------\|----------\|--------\|/;
  const match = content.match(changelogRegex);
  
  if (match) {
    // 最新のコミット情報を取得
    const lastCommit = execSync('git log -1 --pretty=format:"%an"').toString();
    const commitMessage = execSync('git log -1 --pretty=format:"%s"').toString();
    
    // 新しい変更履歴エントリを作成
    const newEntry = `| ${today} | ${getNextVersion(content)} | ${commitMessage} | ${lastCommit} |`;
    
    // 変更履歴を更新
    const updatedContent = content.replace(
      changelogRegex,
      `## 変更履歴\n\n| 日付 | バージョン | 変更内容 | 担当者 |\n|------|------------|----------|--------|\n${newEntry}`
    );
    
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated changelog in ${filePath}`);
  }
}

// 次のバージョン番号を取得する関数
function getNextVersion(content) {
  const versionRegex = /\| \d{4}-\d{2}-\d{2} \| (\d+\.\d+\.\d+) \|/;
  const match = content.match(versionRegex);
  
  if (match) {
    const [major, minor, patch] = match[1].split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }
  
  return '1.0.0';
}

// メイン処理
const docsDir = path.join(__dirname, '..', 'docs');
const aiDir = path.join(__dirname, '..', 'ai');

// docsディレクトリ内のMarkdownファイルを処理
fs.readdirSync(docsDir, { recursive: true })
  .filter(file => file.endsWith('.md'))
  .forEach(file => {
    updateChangelog(path.join(docsDir, file));
  });

// aiディレクトリ内のMarkdownファイルを処理
fs.readdirSync(aiDir, { recursive: true })
  .filter(file => file.endsWith('.md'))
  .forEach(file => {
    updateChangelog(path.join(aiDir, file));
  }); 