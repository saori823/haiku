#!/usr/bin/env ruby
# encoding: utf-8
require 'cgi'
require 'sqlite3'

cgi = CGI.new
db  = SQLite3::Database.new("haiku.db")


search_theme  = cgi["theme"]
search_season = cgi["season"]

print cgi.header("type" => "text/html", "charset" => "utf-8")

begin
  print <<~HTML
  <html>
  <body>
  <h1>検索結果</h1>
  HTML


  conditions = []
  params     = []

  if search_theme != ""
    conditions << "theme = ?"
    params << search_theme
  end

  if search_season != ""
    conditions << "season = ?"
    params << search_season
  end

  sql = "SELECT * FROM haikus"
  sql += " WHERE " + conditions.join(" AND ") unless conditions.empty?
  sql += " ORDER BY id DESC"

  haikus = db.execute(sql, params)
  db.close

  if haikus.empty?
    print "<p>該当する俳句はありません。</p>"
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
  end

  print <<~HTML
  <br>
  <a href="https://cgi.u.tsukuba.ac.jp/~s2411752/local_only/wp/Lecture9/view_haiku.rb">投稿された俳句一覧にもどる</a>
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
