import tweepy
import os
import glob
from datetime import datetime

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
    # サブフォルダ内のすべての.mdファイルを再帰的に取得
    markdown_files = glob.glob('**/*.md', recursive=True)
    
    if not markdown_files:
        return None

    latest_file = None
    latest_date = None

    for file in markdown_files:
        # ディレクトリ名とファイル名から日付を取得
        # 例: 2024/09/20.md から "2024-09-20" を抽出
        path_parts = file.split('/')
        if len(path_parts) >= 3:
            date_str = f"{path_parts[-3]}-{path_parts[-2]}-{path_parts[-1][:-3]}"  # YYYY-MM-DD
            try:
                date = datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                continue  # 日付が無効な場合はスキップ

            # 最新の日付を更新
            if latest_date is None or date > latest_date:
                latest_date = date
                latest_file = file

    return latest_file

# ツイート内容を取得
latest_md_file = get_latest_markdown_file()

if latest_md_file:
    with open(latest_md_file, 'r', encoding='utf-8') as file:
        content = file.read()

    # ツイート内容をトリミング
    if len(content) > 280:
        content = content[:277] + '...'  # トリミングして「...」を追加

    # ツイートを投稿
    try:
        client.create_tweet(text=content)
        print('Tweet sent successfully!')
    except tweepy.errors.Forbidden as e:
        print('Error posting tweet: Forbidden', e)
    except Exception as e:
        print('Error posting tweet:', e)
else:
    print('No markdown files found.')