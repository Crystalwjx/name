# 安装 Centos 7.4

## 选择安装 
Install Centos 7

## 选择语言 
English->English(United States)，点击“Continue”

## 选择硬盘 
一般是最大的那个，如果原有的硬盘格式不符合，直接“Delete all”

## 设置密码,比如：ccbti1008

## 重启登录

## 连接网线，查看网络 
```bash
ping www.baidu.com
```

## 如果没有网络,自动获取一个ip
```bash
# 查看ip
ifconfig
# 没有网络自动获取ip
dhclient
```

# 登录上传面密key
```bash
# 登录
ssh root@192.168.31.109
# 如果没有创建
cd ~
mkdir .ssh
# 退出
logout
# 上传key
scp ~/.ssh/id_rsa.pub root@192.168.31.109:~/.ssh/
# 再次登录
ssh root@192.168.31.109
# 
cd ~/.ssh
touch authorized_keys
cat id_rsa.pub > authorized_keys
# 退出重试
```


# 安装 mysql,php,nginx,redis

### 安装工具，如果是阿里云，默认有不需要自己安装
```bash
yum install net-tools
yum install wget
```

### 创建用户组和用户 www
```bash
groupadd www
useradd -g www -d /home/www -m www
```

### 安装 mysql
```bash
wget http://repo.mysql.com/mysql-community-release-el7-5.noarch.rpm
rpm -ivh mysql-community-release-el7-5.noarch.rpm
ls -1 /etc/yum.repos.d/mysql-community*
# 安装
yum install mysql-server
# 启动服务
service mysqld start
# 登录
mysql -uroot -p
```

### 设定mysql字符集，支持utf8mb4
```mysql
mysql> -- 设定字符集;
mysql> show variables like 'character%';
-- 如果不是 utf8mb4，设定
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_database = utf8mb4;
SET character_set_results = utf8mb4;
SET character_set_server = utf8mb4;
```

### 安装 php7.2
```bash
# 设定yum源
rpm -Uvh https://mirror.webtatic.com/yum/el7/epel-release.rpm
rpm -Uvh https://mirror.webtatic.com/yum/el7/webtatic-release.rpm
# 安装 php7.2
yum install php72w-common php72w-fpm php72w-opcache php72w-gd php72w-mysqlnd php72w-mbstring php72w-pecl-redis php72w-pecl-memcached php72w-devel php72w-bcmath php72w-soap
```

### 修改php时区
```bash
vim /etc/php.ini
#  date.timezone = "Asia/Shanghai"
```

### 修改php-fpm配置，修改用户和组
```bash
vim /etc/php-fpm.d/www.conf
# 将 user = apache 和 group = apache 改为:
#  user = www
#  group = www
```

### 给php设置session目录，后台用
```bash
cd /var/lib;
mkdir /var/lib/php/session;
chown -R www:www /var/lib/php/session;
chown -R www:www php;
chmod -R 777 php;
# 重启php-fpm
service php-fpm restart
```

### 安装 redis
```bash
yum install redis
# 修改 redis.conf 文件 
# 禁止外网访问 Redis，添加或修改，如果绑定的是127.0.0.1则不需要修改，
# 一般不用修改，但是要检查一下
#  bind 127.0.0.1
vim /etc/redis.conf
## 启动redis
redis-server /etc/redis.conf &
```

### 安装 nginx
```bash
yum install nginx
nginx -t
nginx

# 使用ip:port测试，比如本机ip 192.168.31.109，在浏览器中输入 192.168.31.109
# 如果无法访问 可能是80端口问开启 开启
firewall-cmd --zone=public --add-port=80/tcp --permanent
systemctl restart firewalld.service

firewall-cmd --zone=public --add-port=8080/tcp --permanent
systemctl restart firewalld.service

# 重启nginx 再次浏览器测试
nginx -s reload
```

# 代码部署

### 创建数据库
```bash
mysql -uroot -p
```
```mysql
show databases;
drop database ccbti;
create database ccbti;
quit;
```

### 导入数据库
```bash
cd ~
scp root@47.96.118.164:~/ccbti.sql.tar.gz ./
tar -zxvf ccbti.sql.tar.gz
mysql -uroot -p ccbti < ~/ccbti.sql
```

### 安装git
```bash
yum install git
```

### clone代码
```bash
cd /home/www
mkdir /home/www/webroot
mkdir /home/www/webroot/ccbti
cd /home/www/webroot/ccbti
git clone http://gitlab.zilpn.com:19522/cbti/backend.git
# 输入代码库的用户名和密码
```

### 初始化代码
```bash
cd /home/www/webroot/ccbti/backend
php init
# 选择 0 开发模式
```

### 配置-数据库
```bash
vim /home/www/webroot/ccbti/backend/common/config/main-local.php
```
```php
 ## 修改数据库名称
 'dsn' => 'mysql:host=localhost;dbname=ccbti',
```

### 配置-api访问参数格式
```bash
vim /home/www/webroot/ccbti/backend/api/config/main-local.php
```
```php
<?php

$config = [
    'components' => [
        'request' => [
            // !!! insert a secret key in the following (if it is empty) - this is required by cookie validation
            'cookieValidationKey' => 'cf559d2f7225eeb6f64f29bf77e4b627',
            'parsers' => [
                'application/json' => 'yii\web\JsonParser'
            ],
        ],
    ],
];

if (!YII_ENV_TEST) {
    // configuration adjustments for 'dev' environment
    $config['bootstrap'][] = 'debug';
    $config['modules']['debug'] = [
        'class' => 'yii\debug\Module',
    ];

    $config['bootstrap'][] = 'gii';
    $config['modules']['gii'] = [
        'class' => 'yii\gii\Module',
    ];
}

return $config;

```

### 配置-api生成二维码地址
```bash
vim /home/www/webroot/ccbti/backend/api/config/params-local.php
```
```php
<?php
return [
  'base_urls' => [
    'qrcode' => 'http://192.168.31.109/',
  ],
];
```

### 配置-后台访问二维码地址
```bash
vim /home/www/webroot/ccbti/backend/backend/config/params-local.php
```
```php
<?php
return [
  'base_urls' => [
    'qrcode' => 'http://192.168.31.109/',
  ],
];
```

### 修改目录所属权限
```bash
cd /home/www/
chown -R www:www webroot/
```

### 配置-nginx
```bash
vim /etc/nginx/nginx.conf
```
``` 
user www;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

include /usr/share/nginx/modules/*.conf;

events {
    worker_connections 1024;
}

http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile            on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 2048;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;

    include /etc/nginx/conf.d/*.conf;
}
```

### 配置-nginx-server
```bash
vim /etc/nginx/conf.d/ccbti.conf
```
```
server {
    listen       80;
    server_name  localhost;

    root   /home/www/webroot/ccbti/backend/api/web;
    index  index.html index.htm index.php;

    location / {
        try_files $uri $uri/ /index.php$is_args$args;
    }

    location ~ \.php$ {
        fastcgi_pass   127.0.0.1:9000;
        fastcgi_index  index.php;
        fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
        include        fastcgi_params;
    }

    location ~* /\. {
        deny all;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   html;
    }
}

server {
    listen 8080;
    server_name localhost;

    root   /home/www/webroot/ccbti/backend/backend/web;
    index  index.html index.htm index.php;

    location / {
        try_files $uri $uri/ /index.php$is_args$args;
    }

    location ~ \.php$ {
        fastcgi_pass   127.0.0.1:9000;
        fastcgi_index  index.php;
        fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
        include        fastcgi_params;
    }

    location ~* /\. {
        deny all;
    }
}
```

### 添加定时任务
```bash
crontab -e
# 添加内容 "/home/www/webroot/cbti/cbti_server"部分根据安装的目录有不同
# 每天早上4点统计患者完成情况
0 4 * * * /home/www/webroot/cbti/cbti_server/yii stat-evaluation/index >> /home/www/webroot/cbti/cbti_server/console/runtime/stat_task.log
```

### 重启nginx
```bash
nginx -t
nginx -s reload
```

### 设置重启后自动启动php-fpm，nginx，redis
```bash
systemctl start php-fpm.service
systemctl start nginx.service
systemctl start redis.service
# 可以使用下面相关命令查看状态
systemctl status php-fpm.service
systemctl status nginx.service
systemctl status redis.service
```

### 如果访问浏览器出现“Access denied.”，可能需要关闭防火墙
#### 临时方法
```bash
setenforce 0
```
#### 永久方法
```bash
vim /etc/selinux/config
# 将SELINUX=enforcing，改为 SELINUX=disabled
# 重启
reboot
```