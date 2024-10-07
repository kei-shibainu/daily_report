const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const twitterClient = new TwitterApi({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// 最新のコミットで変更されたMarkdownファイルのパスを取得
const getLatestMarkdownFilePath = () => {
  let output;

  // 最新のコミットで変更されたファイルを取得
  try {
    output = execSync('git diff --name-only HEAD~1 HEAD').toString();
  } catch (error) {
    console.error('Error fetching latest files, may be first commit:', error.message);
    output = ''; // エラーの場合は空にする
  }

  const files = output.split('\n').filter(Boolean);
  const latestMarkdownFile = files.find(file => file.endsWith('.md'));

  // 最新のMarkdownファイルが見つからなかった場合、全ての.mdファイルを取得
  if (!latestMarkdownFile) {
    console.log('No markdown file changed in the latest commit. Trying to fetch all markdown files...');
    const allMarkdownFiles = execSync('git ls-files "*.md"').toString().split('\n').filter(Boolean);
    return allMarkdownFiles[0]; // 最初の.mdファイルを選択
  }

  return latestMarkdownFile;
};

(async () => {
  try {
    const latestFilePath = getLatestMarkdownFilePath();

    if (!latestFilePath) {
      console.log('No markdown files found.');
      process.exit(0);
    }

    const fileContent = fs.readFileSync(path.join(__dirname, latestFilePath), 'utf8');

    // ツイートを送信
    await twitterClient.v1.tweet(fileContent);
    console.log('Tweet sent successfully!');
  } catch (error) {
    console.error('Error sending tweet:', error);
  }
})();