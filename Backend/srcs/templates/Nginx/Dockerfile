FROM nginx

ARG SSL_CERTIFICATE SSL_CERTIFICATE_KEY
# Copy your script into the container
COPY certs.sh /usr/src/app/certs.sh

# Make the script executable
RUN chmod +x /usr/src/app/certs.sh

COPY nginx.conf /etc/nginx/nginx.conf
# Run the script during the build
RUN /usr/src/app/certs.sh

CMD ["nginx", "-g", "daemon off;"]