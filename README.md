
# Classroom and Purchase Applications

This repository contains two applications: Classroom and Purchase. The Classroom application is responsible for managing courses and user interactions, while the Purchase application handles purchases and transactions.

## Getting Started

To get started with these applications, follow the steps below:

### Prerequisites

Make sure you have the following software installed on your machine:

- Docker
- Docker Compose

### Installation

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/iamrosada/bot-telegram
   ```

2. Navigate to the project directory:

   ```bash
   cd bot-telegram
   ```

3. Create `.env` files for each application (`classroom` and `purchase`) based on the provided `.env.example` files and fill in the required environment variables.

### Running the Applications

To run both applications and their dependencies (RabbitMQ and PostgreSQL databases), you can use Docker Compose.

1. Start the Docker containers:

   ```bash
   docker-compose up -d
   ```

2. Navigate to the project directory:

   ```bash
   cd bot-telegram
   ```

3. Install dependencies for each application by running:

   ```bash
   cd classroom
   npm install
   ```

   ```bash
   cd ../purchase
   npm install
   ```

4. Set up environment variables by creating a `.env` file based on the provided `.env.example` file in each application directory (`classroom` and `purchase`) and fill in the required environment variables.

### Running the Applications second step

To start each application in development mode, run the following commands:

1. For the Classroom application:

   ```bash
   cd classroom
   npm run start:dev
   ```

2. For the Purchase application:

   ```bash
   cd ../purchase
   npm run start:dev
   ```

After running these commands, both applications should be up and running, and you can access them at `http://localhost:3000` for Classroom and `http://localhost:3333` for Purchase.

### Stopping the Applications

To stop the running containers, use the following command:

```bash
docker-compose down
```

## Services

### Classroom

- **Port**: 3000
- **Description**: Manages courses and user interactions.
- **Dependencies**:
  - RabbitMQ
  - PostgreSQL database (classroom_db)

### Purchase

- **Port**: 3333
- **Description**: Handles purchases and transactions.
- **Dependencies**:
  - PostgreSQL database (purchase_db)

### RabbitMQ

- **Port**: 5672 (AMQP), 15672 (Management UI)
- **Description**: Message broker used for communication between the Classroom and Purchase applications.



# Classroom Application

The Classroom Application is a platform designed to facilitate online education and course management. It includes features for purchasing courses, managing users, and sending email notifications.

## Installation

1. Clone this repository to your local machine.
2. Install dependencies by running `npm install`.
3. Set up environment variables by creating a `.env` file based on the provided `.env.example` file.
4. Start the application by running `npm run start:dev` for each application cd purchase and cd classroom after that run the command.

## Usage

### Creating Products

To create programming courses automatically, run the `createProgrammingCourses` function. This function creates 10 programming courses when the application is started.

### Handling Purchases

Use the `/purchases` endpoint to handle purchases. Send a POST request with the `productId`, `name`, and `email` in the request body to initiate a purchase.

### Sending Emails

The application sends email notifications to users upon purchase. It uses Nodemailer to send emails with Handlebars templates. Ensure that SMTP credentials are provided in the environment variables.

## Dependencies

- Express.js: For building the web server.
- Prisma: ORM for interfacing with the database.
- RabbitMQ: For messaging between components.
- Telegraf: Telegram bot framework for handling bot messages.
- Nodemailer: For sending email notifications.
- Handlebars: For email template rendering.







