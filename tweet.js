const Twitter = require('twitter-lite');
const { execSync } = require('child_process');

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

let latestFile;
let commitMessage;

try {
    // 最新のMarkdownファイルを取得
    latestFile = execSync('git log --name-only --pretty=format: | grep ".md" | sort -u | tail -n 1').toString().trim();
    
    // 最新のファイルのコミットメッセージを取得
    commitMessage = execSync(`git log -1 --pretty=format:"%s" -- ${latestFile}`).toString();
} catch (error) {
    console.error('Error retrieving file or commit message:', error);
    process.exit(1);
}

// ツイート内容を設定
const tweetText = `New commit for ${latestFile}: ${commitMessage}`;

client.post("statuses/update", { status: tweetText })
    .then(result => {
        console.log("Tweeted successfully!", result);
    })
    .catch(error => {
        console.error("Error posting tweet:", error);
    });