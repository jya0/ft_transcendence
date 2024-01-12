
all:
	@sh ./script.sh
	@docker-compose -f ./docker-compose.yml up

build:
	@sh ./script.sh
	@docker-compose -f ./docker-compose.yml up -d --build

only:
	@sh ./script.sh
	@docker-compose -f ./docker-compose-without-pdAdmin.yml up --build
	
down:
	@docker-compose -f ./docker-compose.yml down

up:x
	@docker-compose -f ./docker-compose.yml up -d

re: fclean all

stop:
	@docker-compose -f ./docker-compose.yml stop
	
clean: down
	@docker system prune -a

# !! will stop all containers, remove all images even valgrind !!
fclean:
	@if [ ! -z "$$(docker ps -aq)" ]; then \
		docker stop $$(docker ps -aq); \
	fi
	@docker system prune --all --force --volumes
	@if [ ! -z "$$(docker volume ls -q)" ]; then \
		docker volume rm $$(docker volume ls -q); \
	fi	

.PHONY	: all build down re clean fclean