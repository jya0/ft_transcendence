FROM node:20.5.1


COPY . /app/

WORKDIR /app/frontend

RUN apt-get -y update && apt-get -y upgrade
RUN npm install && npm install -g typescript && npm install react-icons
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
RUN apt-get install -y iproute2
RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v1.1.5/zsh-in-docker.sh)" && chsh -s $(which zsh); echo "exec zsh" >> ~/.bashrc

EXPOSE 3000

ENTRYPOINT ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
