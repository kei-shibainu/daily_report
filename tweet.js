import { execSync } from 'child_process';
import axios from 'axios';

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

axios.post('https://api.twitter.com/2/tweets', {
    text: tweetText
}, {
    headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
    }
})
.then(response => {
    console.log('Tweeted successfully!', response.data);
})
.catch(error => {
    console.error('Error posting tweet:', error.response ? error.response.data : error.message);
});