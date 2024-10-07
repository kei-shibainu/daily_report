const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// GitHub SecretsからTwitter APIの情報を取得
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// 最新のコミットで変更されたMarkdownファイルのパスを取得
const getLatestMarkdownFilePath = () => {
  const output = execSync('git diff --name-only HEAD^ HEAD').toString();
  const files = output.split('\n').filter(Boolean);
  return files.find(file => file.endsWith('.md')); // .mdファイルを探す
};

(async () => {
  try {
    const latestFilePath = getLatestMarkdownFilePath();
    if (!latestFilePath) {
      console.log('No markdown file changed in the latest commit.');
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