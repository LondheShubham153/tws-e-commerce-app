# SONARQUBE & POSTGRESQL SETUP FOR INCLUSING SONAR SCANNING IN YOUR JENKINS PIPELINE


## PostgreSQL Setup for SonarQube on your Jenkins Server. You need to install sonar scanner plugin and configure it Jenkins UI. The following steps to be performed on the server.

Follow the steps below to set up a PostgreSQL database for SonarQube.

## 1. Log in to the PostgreSQL Database Server

Log in to the PostgreSQL database server as the `postgres` user. This will take you into the PostgreSQL terminal.

```bash
sudo -u postgres psql
```

## 2. Create a New PostgreSQL Role

Create a new `sonaruser` PostgreSQL role with a strong password to use with SonarQube. Replace `your_password` with your desired password.

```sql
CREATE ROLE sonaruser WITH LOGIN ENCRYPTED PASSWORD 'your_password';
```

## 3. Create a New SonarQube Database

Create a new database called `sonarqube`.

```sql
CREATE DATABASE sonarqube;
```

## 4. Grant Full Privileges to the SonarQube Database

Grant the `sonaruser` role full privileges to the `sonarqube` database.

```sql
GRANT ALL PRIVILEGES ON DATABASE sonarqube TO sonaruser;
```

## 5. Switch to the SonarQube Database

Switch to the `sonarqube` database.

```sql
\c sonarqube
```

## 6. Grant Full Privileges to the Public Schema

Grant the `sonaruser` role full privileges to the public schema.

```sql
GRANT ALL PRIVILEGES ON SCHEMA public TO sonaruser;
```

## 7. Exit the PostgreSQL Console

Exit the PostgreSQL database console.

```sql
\q
```
## After exiting from postgresql terminal, follow the below steps to change the postgres configuration

## 1. Open the PostgreSQL `postgresql.conf` file (usually located in `/etc/postgresql/<version>/main/postgresql.conf`

Check the listen_addresses setting: Find the following line in the postgresql.conf file:
#listen_addresses = 'localhost'  # what IP address(es) to listen on;

Uncomment it and change it to
```bash
listen_addresses = '*' or  listen_addresses = 'your_ip'
```

## 2. Locate the `pg_hba.conf` file. It’s usually in the same directory as `postgresql.conf`. Typical location is `	/etc/postgresql/<version>/main/pg_hba.conf`

add the following line to allow connections from any IP address (replace 0.0.0.0/0 with a more specific range if needed):
```bash
host    all             all             0.0.0.0/0            md5
```
This allows all remote IP addresses to connect using password-based authentication.

## 3. Reload PostgreSQL to apply changes:
```bash
sudo systemctl reload postgresql
```

With these steps, you will have successfully set up a PostgreSQL database and user for SonarQube.

# SonarQube Configuration Guide

## Configuring the Sonar Scanner

1. Open the `sonar-scanner.properties` configuration file:
    ```bash
    sudo nano /opt/sonarscanner/conf/sonar-scanner.properties
    ```
2. Find the following `sonar.host.url` directive and uncomment && change the default https://mycompany.com/sonarqube value to `http://your_ip_address`
    ```properties
    ...
    sonar.host.url=http://your_ip_address
    ...
    ```
    The above Sonar Host directive specifies the SonarQube server URL to use while performing code scans. Save and Close the File.
3. Enable execute permissions on the SonarScanner binary:
    ```bash
    sudo chmod +x /opt/sonarscanner/bin/sonar-scanner
    ```
4. Link the sonar-scanner binary to the /usr/local/bin directory to enable it as a system-wide command.
   ```bash
   sudo ln -s /opt/sonarscanner/bin/sonar-scanner /usr/local/bin/sonar-scanner
   ```
5. Check the installed SonarScanner version:
   ```bash
    sonar-scanner -v
   ```
  Example output:
  ```
  13:33:31.946 INFO  SonarScanner CLI 7.0.1.4817
  13:33:31.950 INFO  Java 17.0.13 Eclipse Adoptium (64-bit)
  13:33:31.951 INFO  Linux 6.8.0-51-generic amd64
  ```
---

## Configure SonarQube

SonarQube requires specific configurations for optimal performance, including database connections, Java runtime options, system resource limits, and user permissions. Follow the steps below to configure SonarQube to run on your server.

1. Open the main SonarQube configuration file:
    ```bash
    sudo nano /opt/sonarqube/conf/sonar.properties
    ```
    Add Add the following configurations at the end of the file. Replace `sonaruser` and `your_password` with actual PostgreSQL database user details.
    ```properties
    sonar.jdbc.username=sonaruser
    sonar.jdbc.password=your_password
    sonar.jdbc.url=jdbc:postgresql://youripaddress:5432/sonarqube
    sonar.web.javaAdditionalOpts=-server
    sonar.web.host=0.0.0.0
    sonar.web.port=9000
    ```
    Save and close the file.
   The above custom configuration directives enable SonarQube to access the PostgreSQL database, and listen for connections on the TCP port `9000` from all network addresses `0.0.0.0`.
2. Open the system memory configuration file:
    ```bash
    sudo nano /etc/sysctl.conf
    ```
    Add the following settings:
    ```conf
    vm.max_map_count=524288
    fs.file-max=131072
    ```
   Save and close the file.
    Within the configuration:
      * `vm.max_map_count=524288`: Increases the number of memory maps Elasticsearch can use, allowing it to handle large datasets
      *	`fs.file-max=131072`: Increases the maximum number of files Elasticsearch can open, allowing it to run efficiently.

SonarQube uses Elasticsearch to store indices in a memory-mapped file system. Adjusting the system limits for virtual memory mapping and file handling ensures better stability and performance for SonarQube.

4. Create a new /etc/security/limits.d/99-sonarqube.conf file to create a resource limits configuration for SonarQube.
    ```bash
    sudo nano /etc/security/limits.d/99-sonarqube.conf
    ```
    Add the following lines:
    ```conf
    sonarqube   -   nofile   131072
    sonarqube   -   nproc    8192
    * soft nofile 65535
    * hard nofile 65535
    ```
    Save and close the file.
    Within the configuration:
      * nofile=131072: Increases the number of open file descriptors, allowing SonarQube to handle large workloads.
      *	nproc=8192: Raises the process limit to prevent failures under high concurrency.

---

## Set Up SonarQube as a System Service

Follow the steps below to set up a new system service for SonarQube to manage the application processes on your server.

1. Create a systemd service file:
    ```bash
    sudo nano /etc/systemd/system/sonarqube.service
    ```
2. Add the following content:
    ```ini
    [Unit]
    Description=SonarQube service
    After=syslog.target network.target

    [Service]
    Type=forking
    ExecStart=/opt/sonarqube/bin/linux-x86-64/sonar.sh start
    ExecStop=/opt/sonarqube/bin/linux-x86-64/sonar.sh stop
    User=sonarqube
    Group=sonarqube
    PermissionsStartOnly=true
    Restart=always
    StandardOutput=syslog
    LimitNOFILE=131072
    LimitNPROC=8192
    TimeoutStartSec=5
    SuccessExitStatus=143

    [Install]
    WantedBy=multi-user.target
    ```
    Save and close the file.
    The above configuration creates a new SonarQube system service to monitor and manage the application processes.
3. Reload systemd and enable the service:
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable sonarqube
    ```
4. Start and check the status of SonarQube:
    ```bash
    sudo systemctl start sonarqube
    sudo systemctl status sonarqube
    ```
5. Reboot the server:
    ```bash
    sudo reboot now
    ```
---


## Access SonarQube

1. Open a browser and navigate to `http://your_ip_address:9000`
2. Log in with the following credentials:
    - **Username:** admin
    - **Password:** admin
