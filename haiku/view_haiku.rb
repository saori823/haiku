#!/usr/bin/env ruby
# encoding: utf-8
require 'cgi'
require 'sqlite3'

cgi = CGI.new
db=SQLite3::Database.new("haiku.db")



print cgi.header("type" => "text/html", "charset" => "utf-8")

begin
print <<~HTML
<html>
<body>
<h1>投稿された俳句一覧</h1>


<form action="https://cgi.u.tsukuba.ac.jp/~s2411752/local_only/wp/Lecture9/search_haiku.rb" method="get">
  題：
  <select name="theme">
    <option value="">すべて</option>
    <option>旅</option>
    <option>自然</option>
    <option>家族</option>
    <option>音楽</option>
    <option>食べ物</option>
  </select>

  季節：
  <select name="season">
    <option value="">すべて</option>
    <option>春</option>
    <option>夏</option>
    <option>秋</option>
    <option>冬</option>
  </select>

  <input type="submit" value="検索">
</form>

<hr>
HTML

haikus = db.execute("SELECT * FROM haikus ORDER BY id DESC")
kigos = db.execute("SELECT DISTINCT season, kigo FROM kigo ORDER BY season")
db.close

if haikus.empty?
  print "<p>まだ俳句が投稿されていません。</p>"
else
  print "<ul>"
  haikus.each do |row|
    print "<li>"
    print "<a href='https://cgi.u.tsukuba.ac.jp/~s2411752/local_only/wp/Lecture9/haiku_detail.rb?id=#{row[0]}'>"
    print CGI.escapeHTML(row[4])
    print "</a>（#{row[1]}・#{row[2]}）"
    print "</li>"
  end
  print "</ul>"
  print"<h2>収集された季語</h2>"
  print"<ul>"
    kigos.each do |row|
      print"<li>#{row[0]}："
      print CGI.escapeHTML(row[1]) 
      print"</li>"
    end
  print"</ul>"

end
print <<~HTML
<br>
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
