default: build down up logs-new

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

logs-new:
	docker-compose logs -f --tail 0

test-up: down
	docker-compose -f docker-compose.test.yml up --build -d db-test

test:
	docker-compose -f docker-compose.test.yml up --build api-test

test-down:
	docker-compose -f docker-compose.test.yml down

backup-ls:
	docker exec -it tally_db-backup_1 ls -lA

backup-now:
	docker exec -it tally_db-backup_1 backup

backup-last:
	docker exec -it tally_db-backup_1 sh -c 'cat $$(ls -t * | head -1)'

backup-print:
	@docker exec -it tally_db_1 sh -c 'mysqldump -u$$MYSQL_USER -p$$MYSQL_PASSWORD -B $$MYSQL_DATABASE'

volume-rm: down
	docker volume rm tally_tally-data

db-shell:
	docker exec -it tally_db_1 sh -c 'mysql -u$$MYSQL_USER -p$$MYSQL_PASSWORD $$MYSQL_DATABASE'
