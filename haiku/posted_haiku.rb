#!/usr/bin/env ruby
# encoding: utf-8
require 'cgi'
require 'sqlite3'

cgi = CGI.new

theme   = cgi["theme"]
season  = cgi["season"]
haigou  = cgi["haigou"]
haiku   = cgi["haiku"]
kigo    = cgi["kigo"]
comments = cgi["comments"]
errors =[]



print cgi.header("type" => "text/html", "charset" => "utf-8")

begin

if haigou !~ /\S/ || haiku !~ /\S/ || kigo !~ /\S/ || comments !~ /\S/
  errors << "俳号、俳句、季語、解説のいずれかが入力されていませんでした。"
end

if comments.length >200
  errors << "解説は200字以内で入力してください。"
end

if haiku.length < 5
  errors << "俳句が短すぎます（5文字以上にしてください）"
elsif haiku.length > 30
  errors << "俳句が長すぎます（30文字以内にしてください）"
end


if errors.any?
  print "<html><body>"
  print "<h1>投稿できませんでした</h1>"
  print "<u1>"
  errors.each do |e|
    print "<li>#{CGI.escapeHTML(e)}</li>"
  end
  print "</u1>"
  print "<p>もう一度入力し直してください。</p>"
  print "<a href='https://cgi.u.tsukuba.ac.jp/~s2411752/local_only/wp/Lecture9/haiku.rb'>投稿画面に戻る</a>"
  print "</body></html>"
  exit
end





  db=SQLite3::Database.new("haiku.db")
  db.transaction(){
    db.execute("INSERT INTO haikus(theme, season, haigou, haiku, comments, kigo)
    VALUES(?,?,?,?,?,?);",
    theme, season, haigou, haiku, comments, kigo)
    db.execute("INSERT INTO kigo(season, kigo)
    VALUES(?,?);",
    season, kigo)

  }
  db.close




  print <<~HTML
  <html>
  <body>
  <h1>投稿完了</h1>

  <p>俳句の投稿が完了しました。ありがとうございました。</p>

  <a href="https://cgi.u.tsukuba.ac.jp/~s2411752/local_only/wp/Lecture9/view_haiku.rb">投稿された俳句一覧を見る</a>
  <a href="https://cgi.u.tsukuba.ac.jp/~s2411752/local_only/wp/Lecture9/haiku.rb">新しい句をさらに投稿する</a>
  </body>
  </html>
  HTML


rescue => ex
  print <<-EOB
  <html>
    <head>
      <meta charset="UTF-8" />
    </head>
    <body>
      <h1>#{ex.message}</h1>
      <pre>
#{CGI.escapeHTML(ex.backtrace.join("\n"))}
      </pre>
    </body>
  </html>
  EOB
end

