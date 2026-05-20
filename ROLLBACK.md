# デプロイ失敗時の戻し方

## コードを戻す

```bash
# main ブランチに移動
git checkout main

# 直前のコミットに戻す（変更を取り消す）
git revert HEAD
git push
```

これで Amplify Hosting が自動的に旧バージョンを再デプロイします。

## Amplify Console から戻す（コードを触らずに戻す方法）

1. AWS コンソール → Amplify → アプリを開く
2. 左メニュー「Hosting」→「デプロイ履歴」
3. 成功していた古いデプロイの「再デプロイ」をクリック

## AWS リソース（Cognito・DynamoDB）を全部消してやり直す

1. AWS コンソール → Amplify → アプリを開く
2. 「バックエンド環境」→「削除」
3. 再度 push するとゼロから作り直される
   ※ ユーザーデータは全部消えるので注意

## 元の localStorage バージョンに完全に戻す

```bash
git checkout main
git reset --hard b5060d4   # localStorage 版の最後のコミット
git push --force
```
