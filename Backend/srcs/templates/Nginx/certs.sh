#!/bin/sh

mkdir -p /etc/nginx/ssl/;
openssl req -x509 -newkey rsa:4096 -keyout $SSL_CERTIFICATE_KEY \
	-out $SSL_CERTIFICATE -sha256 -days 3650 -nodes \
	-subj "/C=AD/ST=ahassan/L=AD/O=42/OU=NA/CN=pongos42@gmail.com";

sed -i -e "s|SSL_CERTIFICATE|${SSL_CERTIFICATE}|" \
       -e "s|SSL_KEY|${SSL_CERTIFICATE_KEY}|" /etc/nginx/nginx.conf