# Cubing Time Standard

![Tools Used](https://skillicons.dev/icons?i=react&theme=light)&nbsp;&nbsp;<img src="client/public/mantine.svg" alt="Tools Used" style="width: 48px;"/>&nbsp;&nbsp;![Tools Used](https://skillicons.dev/icons?i=express,mysql,docker&theme=light)

This project was inspired by the annual posts on cubing time standards from Reddit
(i.e. [2024](https://www.reddit.com/r/Cubers/comments/1939bgr/2024_cubing_time_standards/)
[2023](https://www.reddit.com/r/Cubers/comments/100hbbs/2023_cubing_time_standards/)
[2022](https://www.reddit.com/r/Cubers/comments/v8ecv9/cubing_time_standards_revisited_for_2022/)
[2019](https://www.reddit.com/r/Cubers/comments/a2tvsv/2019_cubing_time_standards/)
[2017](https://www.reddit.com/r/Cubers/comments/7hqhhm/cubing_time_standards_information_in_comments/)).

## Current Features

- Time Distribution Tables – View distributions for both single solves and average times
- Relative PR Visualizer – Displays how your personal records rank compared to other participants
- Head-to-Head Calculator – Analyze how two cubers stack up against each other based on their times

## Getting started

Before proceeding with the steps below, ensure that Node.js is installed and a MySQL database is set up locally.

1. Clone the project.
    ```bash
    git clone https://github.com/jwnle31/Cubing-Time-Standard.git
    ```
2. Navigate to the server directory and install the dependencies. Then, create a .env file and use the sample.env file as a reference.
    ```bash
    cd Cubing-Time-Standard/server
    npm install
  
    cp sample.env .env
    # open .env and add your variables
    ```
3. Navigate to the client directory and do the same.
    ```bash
    cd ../client
    npm install
  
    cp sample.env .env
    # open .env and add your variables
    ```
3. Navigate to the root directory. Then, create a .env file and use the sample.env file as a reference.
    ```bash
    cd ..
  
    cp sample.env .env
    # open .env and add your variables
    ```
4. Spin up the containers.
    ```bash
    docker compose up
    ```
5. Update your host file to point cts.localhost and api.cts.localhost to 127.0.0.1.
    ```bash
    # add these 2 lines
    127.0.0.1 cts.localhost
    127.0.0.1 api.cts.localhost
    ```
6. Add the root.crt file from the Local Caddy Authority to your trust store (so your browser will trust the self-signed TLS certificate). When the containers are running, open the caddy container in Docker desktop, and navigate to the container's file browser. Find the root.crt under the path: /data/caddy/pki/authorities/local/root.crt. Download this file to your desktop, import it into your trust store, then manually trust this certificate. You may need to restart your browser for the changes to take effect.

## Build commands

To build and test the frontend, run the following commands from the client directory:
```bash
npm run build
npm run preview
```

For the backend, run the following from the server directory:
```bash
npm run build
cp .env build/.env
npm run start
```
