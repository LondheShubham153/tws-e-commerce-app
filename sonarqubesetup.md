
# PostgreSQL Setup for SonarQube on your Jenkins Server. You need to install sonar scanner plugin and configure it Jenkins UI. The following steps to be performed on the server.

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

## 2. Locate the `pg_hba.conf` file. It’s usually in the same directory as `postgresql.conf`. Typical location is `•	/etc/postgresql/<version>/main/pg_hba.conf`

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
