# Database Schema and Migration Queries

## Current PostgreSQL Tables

### 1. Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'auditor', 'reviewer', 'corporate', 'hotelgm')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Properties Table
```sql
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  region TEXT NOT NULL,
  image TEXT,
  last_audit_score INTEGER,
  next_audit_date TIMESTAMP,
  status TEXT DEFAULT 'green' CHECK (status IN ('green', 'amber', 'red')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Audits Table
```sql
CREATE TABLE audits (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id),
  auditor_id INTEGER REFERENCES users(id),
  reviewer_id INTEGER REFERENCES users(id),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'submitted', 'reviewed', 'completed')),
  overall_score INTEGER,
  cleanliness_score INTEGER,
  branding_score INTEGER,
  operational_score INTEGER,
  compliance_zone TEXT CHECK (compliance_zone IN ('green', 'amber', 'red')),
  findings JSONB,
  action_plan JSONB,
  submitted_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Audit Items Table
```sql
CREATE TABLE audit_items (
  id SERIAL PRIMARY KEY,
  audit_id INTEGER NOT NULL REFERENCES audits(id),
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  score INTEGER,
  comments TEXT,
  photos JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed'))
);
```

## SQL Server Migration Scripts

### 1. Users Table (SQL Server)
```sql
CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  username NVARCHAR(255) NOT NULL UNIQUE,
  password NVARCHAR(255) NOT NULL,
  role NVARCHAR(50) NOT NULL CHECK (role IN ('admin', 'auditor', 'reviewer', 'corporate', 'hotelgm')),
  name NVARCHAR(255) NOT NULL,
  email NVARCHAR(255) NOT NULL,
  created_at DATETIME2 DEFAULT GETDATE()
);
```

### 2. Properties Table (SQL Server)
```sql
CREATE TABLE properties (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  location NVARCHAR(255) NOT NULL,
  region NVARCHAR(255) NOT NULL,
  image NVARCHAR(500),
  last_audit_score INT,
  next_audit_date DATETIME2,
  status NVARCHAR(50) DEFAULT 'green' CHECK (status IN ('green', 'amber', 'red')),
  created_at DATETIME2 DEFAULT GETDATE()
);
```

### 3. Audits Table (SQL Server)
```sql
CREATE TABLE audits (
  id INT IDENTITY(1,1) PRIMARY KEY,
  property_id INT NOT NULL FOREIGN KEY REFERENCES properties(id),
  auditor_id INT FOREIGN KEY REFERENCES users(id),
  reviewer_id INT FOREIGN KEY REFERENCES users(id),
  status NVARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'submitted', 'reviewed', 'completed')),
  overall_score INT,
  cleanliness_score INT,
  branding_score INT,
  operational_score INT,
  compliance_zone NVARCHAR(50) CHECK (compliance_zone IN ('green', 'amber', 'red')),
  findings NVARCHAR(MAX) CHECK (ISJSON(findings) = 1),
  action_plan NVARCHAR(MAX) CHECK (ISJSON(action_plan) = 1),
  submitted_at DATETIME2,
  reviewed_at DATETIME2,
  created_at DATETIME2 DEFAULT GETDATE()
);
```

### 4. Audit Items Table (SQL Server)
```sql
CREATE TABLE audit_items (
  id INT IDENTITY(1,1) PRIMARY KEY,
  audit_id INT NOT NULL FOREIGN KEY REFERENCES audits(id),
  category NVARCHAR(255) NOT NULL,
  item NVARCHAR(500) NOT NULL,
  score INT,
  comments NVARCHAR(MAX),
  photos NVARCHAR(MAX) CHECK (ISJSON(photos) = 1),
  status NVARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed'))
);
```

## Sample Data Insertion

### Users Sample Data
```sql
INSERT INTO users (username, password, role, name, email) VALUES
('admin', 'password', 'admin', 'Admin User', 'admin@hotel.com'),
('auditor', 'password', 'auditor', 'Sarah Johnson', 'sarah.johnson@audit.com'),
('reviewer', 'password', 'reviewer', 'Michael Chen', 'michael.chen@qa.com'),
('corporate', 'password', 'corporate', 'Corporate User', 'corporate@hotel.com'),
('hotelgm', 'password', 'hotelgm', 'Hotel GM', 'gm@tajpalace.com');
```

### Properties Sample Data
```sql
INSERT INTO properties (name, location, region, image, last_audit_score, status) VALUES
('Taj Palace, New Delhi', 'New Delhi', 'North India', 
 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 
 85, 'green'),
('Taj Mahal, Mumbai', 'Mumbai', 'West India', 
 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 
 72, 'amber'),
('Taj Lake Palace, Udaipur', 'Udaipur', 'West India', 
 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', 
 91, 'green');
```

## Key Differences Between PostgreSQL and SQL Server

1. **Auto-increment**: PostgreSQL uses `SERIAL`, SQL Server uses `IDENTITY(1,1)`
2. **Text fields**: PostgreSQL uses `TEXT`, SQL Server uses `NVARCHAR(MAX)` or `NVARCHAR(n)`
3. **JSON**: PostgreSQL has `JSONB`, SQL Server uses `NVARCHAR(MAX)` with JSON validation
4. **Timestamps**: PostgreSQL uses `TIMESTAMP`, SQL Server uses `DATETIME2`
5. **Current timestamp**: PostgreSQL uses `CURRENT_TIMESTAMP`, SQL Server uses `GETDATE()`
6. **Foreign keys**: Slightly different syntax between the two systems

## Migration Steps for SQL Server

1. Install SQL Server dependencies
2. Update connection string and database configuration
3. Modify Drizzle ORM schema for SQL Server dialect
4. Update database connection in `server/db.ts`
5. Run migration scripts to create tables
6. Seed database with sample data
7. Test application functionality