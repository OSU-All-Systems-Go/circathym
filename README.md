# Circadian Rhythm Timer

Owner: Emily Soh  
Contributing Developer: Taurean Newsome  

### Description

A lightweight REST microservice built in Node.js that manages scheduled circadian rhythm timers for external applications. The service exposes JSON-based API endpoints that allow client systems to create timers, retrieve active timers, and reset existing timers. Timers are stored in a NoSQL database where each timer is assigned a unique `timerId`, duration interval, and timestamp for scheduling and tracking purposes. The microservice is designed for easy integration with sleep-tracking applications, dashboards, reminder systems, and distributed applications without requiring additional messaging infrastructure.

---

## User Stories | Functional Requirements | Non-Functional Requirements| Quality Attributes 

## User Story 1: Set Timer

As a user, I want to set a timer for a scheduled interval so that my application can track when that interval should be reached.

### Functional Requirement

Given the tracker-service is running and connected to the database, when a POST request is sent to the `/setTimer` endpoint containing a valid app name, timer duration, and callback endpoint, then the microservice should return a 200 success response and store the timer as a new document in the active timer pool.

### Quality Attribute & Non-Functional Requirements

Reliability: When multiple valid timer requests are sent to the `/setTimer` endpoint, the microservice must successfully process and store all timer requests without dropping data or returning 500-level timeout errors.

---

## User Story 2: Get Timer

As a user, I want to retrieve an active timer so that my application can display the current scheduled interval.

### Functional Requirement

Given the tracker-service is running and there are existing timers stored in the database, when a GET request is sent to the `/getTimer` endpoint with a valid timer ID, then the microservice should return a 200 response containing the requested timer object.

### Quality Attribute & Non-Functional Requirement

Performance: When a valid GET request is sent to the `/getTimer` endpoint, the microservice must query the database and return the requested timer payload in under 200 milliseconds under normal load.

---

## User Story 3: Reset Timer

As a user, I want to reset an active timer so that outdated or incorrect scheduled intervals are removed.

### Functional Requirement

Given the tracker-service is running and has active timers stored in the database, when a POST request is sent to the `/resetTimer` endpoint with a specific valid `timerId`, then the microservice should return a 200 response and remove or reset only that matching timer from the database.

### Quality Attribute & Non-Functional Requirements

Data Integrity: When a specific `timerId` is reset via the endpoint, the microservice must modify only that matching timer record and must not affect unrelated timer records in the database.
