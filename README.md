# Проект по предсказанию, где протопчут газон
![image](https://cs8.pikabu.ru/post_img/2016/11/10/8/og_og_1478781418237525707.jpg)

[![Vite Github Pages Deploy](https://github.com/Webring/antitrampling/actions/workflows/vite-github-pages-deploy.yml/badge.svg)](https://github.com/Webring/antitrampling/actions/workflows/vite-github-pages-deploy.yml)

Редактор доступен по ссылке: https://webring.github.io/antitrampling/

Чтобы разблокировать полный функционал, нужно запустить бэкэнд. Пока это можно сделать только локально по инструкции ниже.

# Запуск
### Клонировать репозиторий
```shell
git clone https://github.com/Webring/antitrampling.git
cd antitrampling
```

### Запуск бэкэнда
Установка зависимостей:
```shell
cd backend
pip install -r requirements.txt
```
Запуск:
```shell
python ./main.py
```

### Запуск фронтенда (локально)
Установка зависимостей:
```shell
cd frontend
npm install
```
Запуск:
```shell
npm run dev
```

