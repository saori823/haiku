#!/usr/bin/env ruby
# encoding: utf-8
require 'cgi'
require 'sqlite3'

begin
cgi = CGI.new


print cgi.header("type" => "text/html", "charset" => "utf-8")

print <<EOB
<html><body>
<h1>Web投句箱</h1>
<form action="https://cgi.u.tsukuba.ac.jp/~s2411752/local_only/wp/Lecture9/posted_haiku.rb" method="post">

<p>題を選択してください
<select name = "theme">
<option selected = "selected"> 旅 </option>
<option>自然</option>
<option>家族</option>
<option>音楽</option>
<option>食べ物</option>
</select>
</p>

<p>季節を選択してください
<select name = "season">
<option selected = "selected"> 春 </option>
<option>夏</option>
<option>秋</option>
<option>冬</option>
</select>
</p>

<p>俳号:<input type="text" name="haigou"></p>
<p>俳句:<input type="text" name="haiku"></p>
<p>俳句に用いた季語:<input type ="text" name = "kigo"></p>
<p>俳句に関する解説(200字以内でお願いします。)
<br>
<textarea name="comments" rows="5" cols="40"></textarea> 
</p>
<input type="submit" value="投稿する">
</form>

<br>
<a href="https://cgi.u.tsukuba.ac.jp/~s2411752/local_only/wp/Lecture9/view_haiku.rb">投稿された俳句一覧を見る</a>
</body></html>
EOB



#例外処理

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
