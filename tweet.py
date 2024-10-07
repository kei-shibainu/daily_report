import tweepy
import os
import glob

# Twitter APIのキーとトークンを環境変数から取得
ck = os.environ['TWITTER_CONSUMER_KEY']
cs = os.environ['TWITTER_CONSUMER_SECRET']
bt = os.environ['TWITTER_BEARER_TOKEN']
at = os.environ['TWITTER_ACCESS_TOKEN']
ats = os.environ['TWITTER_ACCESS_TOKEN_SECRET']

# Twitter APIのクライアントを初期化
client = tweepy.Client(
    bearer_token=bt,
    consumer_key=ck,
    consumer_secret=cs,
    access_token=at,
    access_token_secret=ats
)

# 最新の.mdファイルを取得
def get_latest_markdown_file():
    # カレントディレクトリ内のすべての.mdファイルを取得
    markdown_files = glob.glob('*.md')
    
    # ファイルが存在しない場合
    if not markdown_files:
        return None

    # 最新のファイルを取得
    latest_file = max(markdown_files, key=os.path.getmtime)
    return latest_file

# ツイート内容を取得
latest_md_file = get_latest_markdown_file()

if latest_md_file:
    with open(latest_md_file, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # ツイートを投稿
    client.create_tweet(text=content)
    print('Tweet sent successfully!')
else:
    print('No markdown files found.')