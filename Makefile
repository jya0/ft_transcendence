
all:
	@docker-compose -f ./docker-compose.yml up -d

build:
	@docker-compose -f ./docker-compose.yml up -d --build

down:
	@docker-compose -f ./docker-compose.yml down

up:
	@docker-compose -f ./docker-compose.yml up -d

re: fclean all

clean: down
	@docker system prune -a

fclean:
	@if [ ! -z "$$(docker ps -aq)" ]; then \
		docker stop $$(docker ps -aq); \
	fi
	@docker system prune --all --force --volumes
	@if [ ! -z "$$(docker volume ls -q)" ]; then \
		docker volume rm $$(docker volume ls -q); \
	fi	

.PHONY	: all build down re clean fclean