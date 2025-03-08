# Bulk Action Platform

The Bulk Action Platform is a system designed to handle bulk operations on various entities such as contacts, companies, leads, opportunities, and tasks etc. It provides a convenient way to process large volumes of data efficiently.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Endpoints](#endpoints)
- [Live Version for Testing](#live-version)
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Database and Query Design](#database-and-query-design)
- [Queueing Service](#queueing-service)
- [Reconcilation Strategy](#reconcilation-strategy)

## Introduction

The Bulk Action Platform is built using Nest.js, MongoDB, BullMQ, and Redis. It offers a scalable solution for executing bulk actions on entities stored in a MongoDB database.

## Features

- Create bulk actions for processing multiple entities at once.
- Schedule bulk actions for future execution.
- Process jobs in batches to reduce system load
- Monitor the status of bulk actions.
- Retry failed bulk actions automatically.
- Handle rate limiting using Redis.
- Logs every request and response
- Ability to fetch logs along with filters
- Easily extensible to support more types of bulk action with minimal code changes
- Provide uniqueness checks on email id
- Robust error handling and input validations
- Supports pagination on Get APIs for desired page size

---

## Endpoints

### 1. Create Bulk Action

- **URL:** `/api/bulk-actions`
- **Method:** `POST`
- **Request Body:**

  ```json
  {
    "accountId": "1234567",
    "entityType": "Contact",
    "entitiesToUpdate": [
      {
        "_id": "6666511bcb80be240910405a",
        "name": "Emerson Hessel",
        "email": "Emerson.Hessel@hotmail.com",
        "version": 1
      },
      {
        "_id": "6666511bcb80be240910405b",
        "name": "Jarret Heller",
        "email": "Jarret.Heller@gmail.com",
        "version": 4
      }
    ],
    "scheduledFor": "2025-06-15T18:36:55.580Z"
  }
  ```

- **Response**

  ```json
  {
    "accountId": "1234567",
    "entityType": "Contact",
    "entitiesToUpdate": [
      {
        "_id": "6666511bcb80be240910405a",
        "name": "Emerson Hessel",
        "email": "Emerson.Hessel@hotmail.com",
        "version": 1
      },
      {
        "_id": "6666511bcb80be240910405b",
        "name": "Jarret Heller",
        "email": "Jarret.Heller@gmail.com",
        "version": 4
      }
    ],
    "status": "queued",
    "successCount": 0,
    "failureCount": 0,
    "skippedCount": 0,
    "actionErrors": [],
    "scheduledFor": "2025-06-15T18:36:55.580Z",
    "sequenceNumber": 0,
    "_id": "6666dcb6d9f3df74500e2c00",
    "createdAt": "2025-06-10T11:00:06.959Z",
    "__v": 0
  }
  ```

### 2. Get Bulk Actions

- **URL:** `/api/bulk-actions`
- **Method:** `GET`
- **Query Parameters:**
  - `page` (optional): Page number for pagination
  - `limit` (optional): Number of items per page
- **Response**

  ```json
  {
      "success": true,
      "data": {
          "actions": [
              {
                  "accountId": "12345",
                  "bulkActionId": "6666bd23505b70d9d1a782c3",
                  "entityType": "Contact",
                  "status": "completed",
                  "successCount": 0,
                  "failureCount": 0,
                  "skippedCount": 1,
                  "scheduledFor": null,
                  "createdAt": "2025-06-10T08:45:23.509Z"
              },
              {
                  "accountId": "12345",
                  "bulkActionId": "6666bd6a72778272b26d26d8",
                  "entityType": "Tasks",
                  "status": "queued",
                  "successCount": 0,
                  "failureCount": 0,
                  "skippedCount": 0,
                  "scheduledFor": null,
                  "createdAt": "2025-06-10T08:46:34.661Z"
              },
              {
                  "accountId": "12345",
                  "bulkActionId": "6666bdc1c279a5ab8aa5cad5",
                  "entityType": "Company",
                  "status": "processing",
                  "successCount": 0,
                  "failureCount": 0,
                  "skippedCount": 1,
                  "scheduledFor": null,
                  "createdAt": "2025-06-10T08:48:01.631Z"
              },
              ...
          ],
          "total": 23,
          "page": 1,
          "limit": 10,
          "totalPages": 3
      }
    }
  ```

### 3. Get Bulk Action by ID

- **URL:** `/api/bulk-actions/:id`
- **Method:** `GET`
- **Path Parameters:**
  - `id`: ID of the bulk action
- **Response**
  ```json
  {
    "success": true,
    "data": {
      "_id": "6666e04d5e43355375efc3ef",
      "accountId": "1234567",
      "entityType": "Contact",
      "entitiesToUpdate": [
        {
          "_id": "6666511bcb80be240910405a",
          "name": "Emerson Hessel",
          "email": "Emerson.Hessel@hotmail.com",
          "version": 1
        },
        {
          "_id": "6666511bcb80be240910405b",
          "name": "Jarret Heller",
          "email": "Jarret.Heller2@gmail.com",
          "version": 2
        }
      ],
      "status": "completed",
      "successCount": 0,
      "failureCount": 0,
      "skippedCount": 2,
      "actionErrors": [
        "{\"entityId\":\"6666511bcb80be240910405a\",\"message\":\"Duplicate Email\"}",
        "{\"entityId\":\"6666511bcb80be240910405b\",\"message\":\"Version mismatch\"}"
      ],
      "scheduledFor": null,
      "sequenceNumber": 0,
      "createdAt": "2025-06-10T11:15:25.298Z",
      "__v": 0
    }
  }
  ```

### 4. Get Bulk Action Statistics by actionId

- **URL:** `/api/bulk-actions/:id/stats`
- **Method:** `GET`
- **Path Parameters:**
  - `id`: ID of the bulk action
- **Response:**

  ```json
  {
    "success": true,
    "data": {
      "actionId": "6666e04d5e43355375efc3ef",
      "successCount": 0,
      "failureCount": 0,
      "skippedCount": 2,
      "errors": [
        "{\"entityId\":\"6666511bcb80be240910405a\",\"message\":\"Duplicate Email\"}",
        "{\"entityId\":\"6666511bcb80be240910405b\",\"message\":\"Version mismatch\"}"
      ],
      "createdAt": "2025-06-10T11:15:25.298Z"
    }
  }
  ```

---

## Logger Module

The Logger Module is used for logging messages, errors, and warnings in the application. It persists logs in MongoDB and provides endpoints to retrieve logs based on filters such as time range and log level.

### Logger Service

The Logger Service provides methods for logging messages, errors, and warnings.

### Logger Controller

The Logger Controller provides endpoints to retrieve logs:

- **GET /logs**: Retrieve logs based on filters (from, to, level).
  - Without filters it provide all the logs in paginated form
- **DELETE /logs**: Clear all logs.

#### Detailed Request Response structure is mentioned below

### 5. API to fetch & filter logs to show on UI

- **URL:** `/logs`
- **Method:** `GET`
- **Query Parameters:** (Optional)
  - `level`: fetch desired log level [LOG, WARN, ERROR]
  - `from`: `timestamp` logs starting from this
  - `to`: `timestamp` log up to this timestamp
  - `page`: pageNumber for pagination
  - `limit`: page limit for pagigation
- **Response:**

  ```json
  {
    "success": true,
    "data": {
      "actionId": "6666e04d5e43355375efc3ef",
      "successCount": 0,
      "failureCount": 0,
      "skippedCount": 2,
      "errors": [
        "{\"entityId\":\"6666511bcb80be240910405a\",\"message\":\"Duplicate Email\"}",
        "{\"entityId\":\"6666511bcb80be240910405b\",\"message\":\"Version mismatch\"}"
      ],
      "createdAt": "2025-06-10T11:15:25.298Z"
    }
  }
  ```

### 6. API to delete logs from Database

- **URL:** `/logs`
- **Method:** `DELETE`
- **Response:**

  ```json
  {
    "message": "Logs deleted successfully"
  }
  ```

---

## Documentation

- Postman collection for this project can be found in the postman directory inside the root folder of the project.

---

## Setup

### Prerequisites

Before setting up the Bulk Action Platform, ensure you have the following installed:

- Node.js (version >= 14)
- npm (version >= 6)
- MongoDB
- Redis

### Installation

1. MongoDB Docker Setup:

   ```bash
   docker run --name mongodb-container -p 27017:27017 -d mongodb/mongodb-community-server:latest
   ```

1. Redis Docker Setup:

   ```bash
   docker run --name redis-container -p 6379:6379 -d redis
   ```

1. Clone the repository:

   ```bash
   https://github.com/bhavik767/crm-bulk-action-platform.git
   ```

1. Navigate to the project directory:

   ```bash
   cd crm-bulk-action-platform
   ```

1. Install dependencies:

   ```bash
   yarn install
   ```

1. Create build & start the process (After creating .env file mentioned below)

   ```bash
   yarn build && yarn start:prod
   ```

### Configuration

1. Create a `.env` file in the root of the project: (or follow the command below to copy it from .env.example file)

   ```bash
   cp .env.example .env
   ```

   ```plaintext
    # App Config
    PORT=3000

    # Database Config
    MONGO_URI=mongodb://localhost:27017/crm

    # Redis Config
    REDIS_HOST=localhost
    REDIS_PORT=6379
    REDIS_PASSWORD=8907654321
    REDIS_URL=redis://localhost:6379

    # Bulk Processing
    BATCH_SIZE=100

    # Rate limiter Config
    RATE_LIMIT_MAX_REQUESTS=10000
    RATE_LIMIT_TIME=60
   ```

Replace `MONGODB_URI` and `REDIS_URL` with the connection strings for your MongoDB and Redis instances (if some different port is exposed from Docker), respectively.

2. Try out with some different `RATE_LIMIT_MAX_REQUESTS` or `RATE_LIMIT_TIME`.

---

## Database and Query Design

The Bulk Action Platform uses MongoDB as its primary database. The database schema design follows a document-based approach, with separate collections for each entity type (e.g., contacts, companies, leads). Queries are optimized for performance, leveraging indexes where necessary.

### Database Schemas

This project uses MongoDB for data storage. Here are the main schemas defined in the codebase:

#### BulkAction Schema

```typescript
import { Schema, Document } from 'mongoose';

export interface BulkAction extends Document {
  accountId: string;
  entityType: string;
  entitiesToUpdate: any[];
  status: string;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  actionErrors: any[];
  scheduledFor?: Date;
  sequenceNumber: number;
  createdAt: Date;
}

export const BulkActionSchema = new Schema({
  accountId: { type: String, required: true },
  entityType: { type: String, required: true },
  entitiesToUpdate: { type: Array, required: true },
  status: { type: String, default: 'queued' },
  successCount: { type: Number, default: 0 },
  failureCount: { type: Number, default: 0 },
  skippedCount: { type: Number, default: 0 },
  actionErrors: { type: Array, default: [] },
  scheduledFor: { type: Date, default: null },
  sequenceNumber: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
```

### Contact Schema

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: 0 })
  version: number;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
```

#### Important:

`version` field will help us to reject updates in one request, if has already been updated from some other bulk update request parallely processed by some other worker.

For the current request, we'll consider it as a skipped operation and will inform the user to get the updated data first for this entity before submitting a update request again.

### Other Schemas

The project also includes schemas for `Company`, `Lead`, `Opportunity`, and `Task` which follow similar structure and conventions.

### Data Transfer Objects (DTOs)

Below mentioned are some of the major DTOs in our system.

#### CreateBulkActionDto

```typescript
import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsEnum,
  IsArray,
  IsNotEmpty,
  IsString,
  IsOptional,
  ArrayMinSize,
  IsDateString,
} from 'class-validator';
import { ContactDto } from './contact.dto';
import { CompanyDto } from './company.dto';
import { LeadDto } from './lead.dto';
import { OpportunityDto } from './opportunity.dto';
import { TaskDto } from './task.dto';
import { EntityType } from '../constants/bulk-action.constant';
import { IsFutureUtcDateString } from '../validators/is-future-utc-date-string.validator';

export class CreateBulkActionDto {
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @IsEnum(EntityType)
  entityType: EntityType;

  @ValidateNested()
  @IsArray()
  @ArrayMinSize(1)
  @Type((o) => {
    const entityType = o.object.entityType;
    switch (entityType) {
      case EntityType.CONTACT:
        return ContactDto;
      case EntityType.COMPANY:
        return CompanyDto;
      case EntityType.LEAD:
        return LeadDto;
      case EntityType.OPPORTUNITY:
        return OpportunityDto;
      case EntityType.TASK:
        return TaskDto;
    }
  })
  entitiesToUpdate: Record<string, any>[];

  @IsOptional()
  @IsFutureUtcDateString()
  scheduledFor?: Date;
}
```

In future, if we need to add bulk update functionality for other entities as well, it will require very minimal changes to add the support for other entities too. `entitiesToUpdate` field will be dynamically checked against correct DTO based on `entityType` value, we received in the payload.

### Example of DTOs for other entities:

#### ContactDto

```typescript
import {
  IsString,
  IsEmail,
  IsOptional,
  Validate,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AtLeastOneField } from '../../common/decorators/at-least-one-field.decorator';
import { IsObjectIdOrUint8ArrayOrInteger } from '../../validators/is-valid-id.validator';

export class ContactDto {
  @ApiProperty({ description: 'The unique ID of the contact' })
  @IsNotEmpty()
  @IsObjectIdOrUint8ArrayOrInteger()
  _id: string;

  @ApiPropertyOptional({ description: 'The name of the contact' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'The email of the contact' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'The phone number of the contact' })
  @IsOptional()
  @IsString()
  phone?: string;

  @Validate(AtLeastOneField, ['name', 'email', 'phone'], {
    message: 'At least one of name, email, or phone must be provided',
  })
  atLeastOneField: string;
}
```

Similar DTOs are defined for `Company`, `Lead`, `Opportunity`, and `Task`.

---

## Queueing Service

The Bulk Action Platform uses BullMQ as its queueing service.

BullMQ is supporting us for following functionalies in this project:

- Acting as a message queue. We get bulk update request from client and after registering it in BullMQ, we instantly give response back to the user that your request is registered.
- Helping us to follow Event Driven Architecture for bulk updates
- For `Scheduled Jobs`, instead of creating a cron job that periodically checks for upcoming jobs to execute and wasting resources, BullMQ has facilitated us to handle scheduled jobs in much better manner, where it moves the jobs to Active list once it's delay time expires (_server time and scheduled time - both are considered in UTC_) and at that time, it can be picked up by any available consumer process.

- BullMQ helping us to priortize jobs if mutilple requests are generating from client side at the same time.

For more information about BullMQ, refer to the [official documentation](https://docs.bullmq.io/).

---

## Reconcilation Strategy

In event of server crash, if the consumer was processing the bulk action, how we are reconciling the data after the restart?

- For every DB update, we're storing the result of the update in Redis Hashmap against an actionId.
- This also helps up to figure out for which entityId, the updates were already done in that batch. So, even if the server restarts, we are able to skip updating those records again.
- Redis is used on persistence mode, which can restore data even on failure cases from AOF backup.
- This surely adds up the network calls to both Redis & MongoDB, because we're not doing updates in the database in Bulk (_Because we might lose the update result for individual entityId in Bulk update DB Call_), but this helps to build a robust infrastructure at backend which can handle failure cases as well.

---

If there are any suggestions or concerns regarding this project or documentation, please feel free to drop me a mail on
[bhavikpareek98@gmail.com](mailto:bhavikpareek98@gmail.com)

Thanks!
