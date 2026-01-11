## 1. Port Configuration Documentation
- [x] 1.1 Document all project port assignments in `scripts/ports.md`
- [x] 1.2 List backend ports for each project
- [x] 1.3 List frontend ports for each project
- [x] 1.4 Resolve any port conflicts (admin-edu and mentis/frontend both use 3002, frontend-edu and edu/frontend both use 3001)

## 2. Port Management Utilities
- [x] 2.1 Create `scripts/utils/port-utils.sh` with port checking and killing functions
- [x] 2.2 Implement `kill_port_process()` function to kill processes on a given port
- [x] 2.3 Implement `check_port_available()` function to verify port availability
- [x] 2.4 Add error handling for port management operations

## 3. Individual Project Startup Scripts
- [x] 3.1 Create `scripts/start-backend.sh` for main backend (port 8081)
- [x] 3.2 Create `scripts/start-frontend.sh` for main frontend (port 3000)
- [x] 3.3 Create `scripts/start-edu-backend.sh` for edu backend (port 8084)
- [x] 3.4 Create `scripts/start-edu-frontend.sh` for edu frontend (port 3001)
- [x] 3.5 Create `scripts/start-admin-backend.sh` for admin backend (port 8085)
- [x] 3.6 Create `scripts/start-admin-frontend.sh` for admin frontend (port 3005)
- [x] 3.7 Create `scripts/start-mentis-backend.sh` for mentis backend (port 8082)
- [x] 3.8 Create `scripts/start-mentis-frontend.sh` for mentis frontend (port 3002)
- [x] 3.9 Create `scripts/start-company-backend.sh` for company backend (port 8083)
- [x] 3.10 Create `scripts/start-company-frontend.sh` for company frontend (port 3003)
- [x] 3.11 Each script should kill existing processes on the target port before starting

## 4. Unified Startup Script
- [x] 4.1 Create `scripts/start-all.sh` to start all services
- [x] 4.2 Create `scripts/stop-all.sh` to stop all services
- [ ] 4.3 Add project selection menu for selective startup
- [ ] 4.4 Add status checking for running services

## 5. Validation and Testing
- [ ] 5.1 Test port killing functionality
- [ ] 5.2 Test startup scripts for each project
- [ ] 5.3 Verify no port conflicts after startup
- [ ] 5.4 Test unified startup script
- [ ] 5.5 Document usage instructions
