# Instalar o django

    mkdir backend && cd backend
    python3.9 -m venv env
    source env/bin/activate
    touch requirements.txt

## Apenas executar o django

    source env/bin/activate
    python manage.py runserver

# Instalar o React

    npx create-react-app frontend
    cd frontend
    npm add axios dayjs jwt-decode react-router-dom@5.2.0
    npm start

## depois de clonar o React executar

    npm i
    npm update
    export NODE_OPTIONS=--openssl-legacy-provider
    npm start

## Apenas executar o React

    npm start
    ou
    export NODE_OPTIONS=--openssl-legacy-provider
    npm start