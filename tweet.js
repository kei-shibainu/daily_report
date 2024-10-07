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
    console.error('Error fetching latest files:', error.message);
    output = ''; // 初回実行時のため空の出力
  }

  const files = output.split('\n').filter(Boolean);
  return files.find(file => file.endsWith('.md')); // .mdファイルを探す
};

(async () => {
  try {
    const latestFilePath = getLatestMarkdownFilePath();

    // 最新のMarkdownファイルが見つからない場合、全ての.mdファイルを取得
    if (!latestFilePath) {
      console.log('No markdown file changed in the latest commit. Trying to fetch all markdown files...');
      const allMarkdownFiles = execSync('git ls-files "*.md"').toString().split('\n').filter(Boolean);
      latestFilePath = allMarkdownFiles[0]; // 最初の.mdファイルを選択
    }

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