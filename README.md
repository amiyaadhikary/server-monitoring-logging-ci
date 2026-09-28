# DevOps Batch 14 — Server Monitoring, Logging & CI Pipeline

A complete DevOps practice environment built on **Ubuntu Linux** using Prometheus, Node Exporter, Grafana, Loki, Grafana Alloy, and GitHub Actions.

This project uses a small **Student Registration System** as the application for the CI pipeline.

---

## 📌 Project Overview

The purpose of this assignment is to build a basic DevOps environment that demonstrates:

* Server monitoring
* System metrics collection
* Metrics visualization
* Centralized log collection
* Log visualization
* Continuous Integration using GitHub Actions

### Application Stack

* **Frontend:** React + Vite
* **Backend:** Node.js + Express
* **Database:** PostgreSQL
* **Operating System:** Ubuntu Linux

### DevOps Stack

* **Prometheus** — Metrics monitoring
* **Node Exporter** — Linux system metrics
* **Grafana** — Metrics and log visualization
* **Loki** — Log aggregation
* **Grafana Alloy** — Log collection and forwarding
* **GitHub Actions** — Continuous Integration

---

# 🏗️ Architecture

```text
                         GitHub Repository
                                │
                                │ Push / Pull Request
                                ▼
                      ┌─────────────────────┐
                      │   GitHub Actions    │
                      │      CI Pipeline     │
                      └──────────┬──────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
              Backend CI                 Frontend CI
              Node.js/Express            React/Vite
                    │                         │
                    ▼                         ▼
               PostgreSQL                 npm build
                    │
                    │
                    ▼
              Ubuntu Server
                    │
        ┌───────────┼────────────┐
        │           │            │
        ▼           ▼            ▼
   Node Exporter  Prometheus    Alloy
      :9100         :9090         │
        │             │            │
        │             │            ▼
        │             │          Loki
        │             │          :3100
        │             │            │
        └─────────────┴────────────┤
                                   ▼
                               Grafana
                                :3001
```

---

# 📁 Project Structure

```text
server-monitoring-logging-ci/
│
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       └── ...
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       └── ...
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .gitignore
└── README.md
```

> `backend/.env` contains local configuration and is excluded from Git using `.gitignore`.

---

# 1. Prometheus

Prometheus was manually installed and configured as a **systemd service** on Ubuntu.

### Prometheus

```text
Port: 9090
Service: prometheus.service
Configuration: /etc/prometheus/prometheus.yml
Data Directory: /var/lib/prometheus
```

### Prometheus Configuration

The Prometheus configuration contains two scrape targets:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]

  - job_name: "node_exporter"
    static_configs:
      - targets: ["localhost:9100"]
```

### Verify Prometheus

```bash
sudo systemctl status prometheus
```

Prometheus targets can be checked from:

```text
http://localhost:9090/targets
```

Both Prometheus and Node Exporter targets should show:

```text
UP
```

---

# 2. Node Exporter

Node Exporter was manually installed and configured as a systemd service.

Node Exporter collects Linux server hardware and operating system metrics.

### Node Exporter

```text
Port: 9100
Service: node_exporter.service
Binary: /usr/local/bin/node_exporter
```

### Service Verification

```bash
sudo systemctl status node_exporter
```

### Metrics Verification

```bash
curl http://localhost:9100/metrics
```

Node Exporter metrics are scraped by Prometheus.

---

# 3. Grafana

Grafana is used to visualize the metrics collected by Prometheus.

### Grafana

```text
Port: 3001
Service: grafana-server.service
```

The default port `3000` was already being used by Nginx, so Grafana was configured to use port `3001`.

### Grafana URL

```text
http://localhost:3001
```

### Prometheus Data Source

Grafana was configured with the following Prometheus data source:

```text
http://localhost:9090
```

---

# 4. Grafana Monitoring Dashboard

A dashboard named:

```text
DevOps Server Monitoring
```

was created to monitor the Ubuntu server.

The dashboard contains the following panels:

### CPU Usage

```promql
100 * (1 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])))
```

### Memory Usage

```promql
100 * (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)
```

### Disk Usage

```promql
100 * (
  1 -
  node_filesystem_avail_bytes{mountpoint="/",fstype!~"tmpfs|overlay"}
  /
  node_filesystem_size_bytes{mountpoint="/",fstype!~"tmpfs|overlay"}
)
```

### Network Receive

```promql
rate(node_network_receive_bytes_total{device!="lo"}[5m])
```

### Network Transmit

```promql
rate(node_network_transmit_bytes_total{device!="lo"}[5m])
```

---

# 5. Loki

Loki was installed as the centralized log aggregation system.

### Loki

```text
Port: 3100
Service: loki.service
Configuration: /etc/loki/loki-config.yaml
Data Directory: /var/lib/loki
```

### Loki Health Check

```bash
curl http://localhost:3100/ready
```

Expected response:

```text
ready
```

---

# 6. Grafana Alloy

Grafana Alloy is used as the log collector and forwards Ubuntu system logs to Loki.

The following log files are collected:

```text
/var/log/syslog
/var/log/auth.log
```

### Log Flow

```text
Ubuntu System Logs
       │
       ▼
Grafana Alloy
       │
       ▼
Loki :3100
       │
       ▼
Grafana Explore
```

### Alloy Service

```bash
sudo systemctl status alloy
```

The Alloy service is configured to start automatically with the system.

### Alloy Configuration

```text
/etc/alloy/config.alloy
```

The configuration forwards collected logs to:

```text
http://localhost:3100/loki/api/v1/push
```

---

# 7. Grafana Loki Data Source

Loki was added to Grafana as a data source.

### Loki URL

```text
http://localhost:3100
```

Logs can be viewed from:

```text
Grafana → Explore → Loki
```

Example LogQL query:

```logql
{job="system"}
```

Authentication logs can be viewed using:

```logql
{job="auth"}
```

---

# 8. GitHub Actions CI Pipeline

GitHub Actions is used to automatically validate the application whenever code is pushed to the repository or a Pull Request is created.

### Repository

```text
amiyaadhikary/server-monitoring-logging-ci
```

The repository contains the Student Registration System source code.

---

## CI Pipeline

```text
Git Push / Pull Request
          │
          ▼
   GitHub Actions
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
Backend CI   Frontend CI
    │           │
    ▼           ▼
 Node.js      Node.js
    │           │
    ▼           ▼
 npm ci       npm ci
    │           │
    ▼           ▼
PostgreSQL   Vite Build
    │           │
    └─────┬─────┘
          ▼
      CI Passed
```

---

# 9. Backend CI

The backend uses:

* Node.js
* Express
* PostgreSQL
* `pg`
* dotenv

The GitHub Actions workflow:

1. Checks out the repository
2. Sets up Node.js
3. Starts a temporary PostgreSQL service
4. Installs backend dependencies using `npm ci`
5. Performs a Node.js syntax check

### PostgreSQL CI Configuration

```text
Database: student_registration
User: studentapp
Port: 5432
```

A temporary PostgreSQL service is used only during the CI job.

---

# 10. Frontend CI

The frontend uses:

* React
* Vite
* Node.js

The GitHub Actions workflow:

1. Checks out the repository
2. Sets up Node.js
3. Installs dependencies using `npm ci`
4. Builds the production frontend using:

```bash
npm run build
```

A successful build confirms that the frontend can be compiled successfully.

---

# 11. GitHub Actions Workflow

Workflow file:

```text
.github/workflows/ci.yml
```

The workflow runs on:

```text
push → main/master
pull_request → main/master
```

The pipeline contains two jobs:

```text
Backend CI
Frontend CI
```

Both jobs completed successfully with a green status.

---

# 12. Useful Service Commands

### Prometheus

```bash
sudo systemctl start prometheus
sudo systemctl stop prometheus
sudo systemctl restart prometheus
sudo systemctl status prometheus
```

### Node Exporter

```bash
sudo systemctl start node_exporter
sudo systemctl stop node_exporter
sudo systemctl restart node_exporter
sudo systemctl status node_exporter
```

### Grafana

```bash
sudo systemctl start grafana-server
sudo systemctl stop grafana-server
sudo systemctl restart grafana-server
sudo systemctl status grafana-server
```

### Loki

```bash
sudo systemctl start loki
sudo systemctl stop loki
sudo systemctl restart loki
sudo systemctl status loki
```

### Grafana Alloy

```bash
sudo systemctl start alloy
sudo systemctl stop alloy
sudo systemctl restart alloy
sudo systemctl status alloy
```

---

# 13. Verification Commands

### Check Prometheus

```bash
curl http://localhost:9090/-/healthy
```

### Check Node Exporter

```bash
curl http://localhost:9100/metrics
```

### Check Loki

```bash
curl http://localhost:3100/ready
```

### Check Alloy

```bash
sudo systemctl status alloy
```

### Check Prometheus Targets

```text
http://localhost:9090/targets
```

### Grafana

```text
http://localhost:3001
```

---

# 14. Assignment Requirements Checklist

| Requirement              | Implementation                     | Status |
| ------------------------ | ---------------------------------- | ------ |
| Ubuntu Server            | Ubuntu Linux VM                    | ✅      |
| Prometheus               | Manual installation + systemd      | ✅      |
| Prometheus Configuration | Prometheus + Node Exporter targets | ✅      |
| Node Exporter            | Manual installation + systemd      | ✅      |
| Metrics Collection       | Prometheus scraping Node Exporter  | ✅      |
| Grafana                  | Installed and configured           | ✅      |
| CPU Monitoring           | Grafana PromQL panel               | ✅      |
| RAM Monitoring           | Grafana PromQL panel               | ✅      |
| Disk Monitoring          | Grafana PromQL panel               | ✅      |
| Network Monitoring       | Grafana PromQL panels              | ✅      |
| Loki                     | Installed + systemd                | ✅      |
| Log Collection           | Grafana Alloy                      | ✅      |
| System Logs              | syslog + auth.log                  | ✅      |
| Grafana Loki             | Loki data source configured        | ✅      |
| Log Visualization        | Grafana Explore                    | ✅      |
| GitHub Actions           | CI workflow                        | ✅      |
| Backend CI               | Node.js + PostgreSQL               | ✅      |
| Frontend CI              | React/Vite build                   | ✅      |

---

# 15. Final Result

The assignment successfully demonstrates a complete basic DevOps workflow:

```text
                    ┌──────────────────┐
                    │   GitHub Repo    │
                    │ Student System   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ GitHub Actions   │
                    │       CI         │
                    └──────────────────┘


┌──────────────── Ubuntu DevOps Lab ─────────────────┐

        Application
             │
        ┌────┴────┐
        │         │
      React     Node/Express
                  │
                  ▼
              PostgreSQL


        Monitoring
             │
             ▼
       Node Exporter
             │
             ▼
        Prometheus
             │
             ▼
          Grafana


        Logging
             │
             ▼
     /var/log/syslog
     /var/log/auth.log
             │
             ▼
      Grafana Alloy
             │
             ▼
            Loki
             │
             ▼
          Grafana

└─────────────────────────────────────────────────────┘
```

## 🎯 Assignment Completed

**DevOps Batch 14 — Server Monitoring, Logging & CI Pipeline**

Successfully implemented:

* Server Monitoring
* Metrics Collection
* Grafana Dashboard
* Centralized Logging
* Loki Log Aggregation
* Grafana Alloy Log Collection
* GitHub Actions Continuous Integration

**Status: ✅ Completed**
