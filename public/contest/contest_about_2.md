### How To Install

+ install node 9.5.0+
+ run `npm install` on this folder
+ run `npm install pm2 -g` to install pm2 and save it globally
+ run `pm2 start bin/init --name api --watch` on this folder
+ run `pm2 monit` or `pm2 log api` to monitor its state

### Other DEPENDENCY This Project May Use

+ postgres 10
+ redis 4.0.8+
+ A valid RSA key for encrypt and decrypt sensitive data
+ gcc 6.4.0+

  ( Configure them at `/config` )

### 在windows上的部署细节

+ 执行完install的命令后，还需要安装postgresql和redis，可以去官网查看安装配置方法 
+ config中主要需要对postgresql进行配置，填写设置好的密码，其他都是默认设置，可以不用更改
+ 使用webstorm可以下载sql插件，执行create.sql文件建立数据库
+ 访问http://localhost:8000/api/test/initproblems 可以加入一些用于测试的数据


