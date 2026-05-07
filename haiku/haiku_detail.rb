#!/usr/bin/env ruby
# encoding: utf-8
require 'cgi'
require 'sqlite3'

cgi = CGI.new
db  = SQLite3::Database.new("haiku.db")

print cgi.header("type" => "text/html", "charset" => "utf-8")

begin
  id = cgi["id"]

  row = db.get_first_row(
    "SELECT * FROM haikus WHERE id = ?",
    id
  )

  db.close

  print "<html><body>"

  if row
    print "<h1>俳句の詳細</h1>"
    print "<p><b>題：</b>#{row[1]}</p>"
    print "<p><b>季節：</b>#{row[2]}</p>"
    print "<p><b>俳号：</b>#{row[3]}</p>"
    print "<p><b>俳句：</b><br>#{CGI.escapeHTML(row[4])}</p>"
    print "<p><b>季語：</b>#{row[6]}</p>"
    print "<p><b>解説：</b><br>#{CGI.escapeHTML(row[5].to_s)}</p>"
  else
    print "<p>指定された俳句は存在しません。</p>"
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
