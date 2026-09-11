CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  work_location VARCHAR(255),
  payment_terms VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workers (
  id SERIAL PRIMARY KEY,
  worker_id VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  gender VARCHAR(30),
  category VARCHAR(255) NOT NULL,
  skills VARCHAR(500),
  work_location VARCHAR(255),
  salary NUMERIC(12,2) NOT NULL CHECK (salary > 0),
  joining_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'Available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  requirement_id VARCHAR(100) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  worker_category VARCHAR(255),
  workers_required INTEGER NOT NULL CHECK (workers_required > 0),
  skills_required VARCHAR(500),
  work_location VARCHAR(255),
  shift VARCHAR(50) DEFAULT 'Day',
  salary_offered NUMERIC(12,2) NOT NULL CHECK (salary_offered > 0),
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'Open',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deployments (
  id SERIAL PRIMARY KEY,
  deployment_id VARCHAR(100) NOT NULL UNIQUE,
  worker_id INTEGER NOT NULL
    REFERENCES workers(id) ON DELETE RESTRICT,
  client_id INTEGER NOT NULL
    REFERENCES clients(id) ON DELETE RESTRICT,
  job_id INTEGER NOT NULL
    REFERENCES jobs(id) ON DELETE RESTRICT,
  work_location VARCHAR(255),
  deployment_date DATE NOT NULL,
  shift VARCHAR(50) DEFAULT 'Day',
  salary NUMERIC(12,2) NOT NULL CHECK (salary >= 0),
  billing_rate NUMERIC(12,2) DEFAULT 0 CHECK (billing_rate >= 0),
  supervisor_name VARCHAR(255),
  contract_start_date DATE,
  contract_end_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'Active'
    CHECK (status IN ('Active', 'Completed', 'Terminated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  attendance_id VARCHAR(100) NOT NULL UNIQUE,
  worker_id INTEGER NOT NULL
    REFERENCES workers(id) ON DELETE RESTRICT,
  deployment_id INTEGER
    REFERENCES deployments(id) ON DELETE SET NULL,
  client_id INTEGER
    REFERENCES clients(id) ON DELETE SET NULL,
  attendance_date DATE NOT NULL,
  attendance_status VARCHAR(50) NOT NULL
    CHECK (
      attendance_status IN (
        'Present',
        'Absent',
        'Half Day',
        'Leave',
        'Holiday'
      )
    ),
  overtime_hours NUMERIC(4,2) NOT NULL DEFAULT 0
    CHECK (overtime_hours >= 0 AND overtime_hours <= 24),
  shift VARCHAR(50) DEFAULT 'Day',
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (worker_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS payrolls (
  id SERIAL PRIMARY KEY,
  payroll_id VARCHAR(100) NOT NULL UNIQUE,
  worker_id INTEGER NOT NULL
    REFERENCES workers(id) ON DELETE RESTRICT,
  salary_month VARCHAR(20) NOT NULL,
  basic_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  working_days INTEGER DEFAULT 0,
  present_days INTEGER DEFAULT 0,
  absent_days INTEGER DEFAULT 0,
  half_days INTEGER DEFAULT 0,
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  overtime_amount NUMERIC(12,2) DEFAULT 0,
  bonus NUMERIC(12,2) DEFAULT 0,
  advance_deduction NUMERIC(12,2) DEFAULT 0,
  pf_deduction NUMERIC(12,2) DEFAULT 0,
  esi_deduction NUMERIC(12,2) DEFAULT 0,
  other_deduction NUMERIC(12,2) DEFAULT 0,
  absent_deduction NUMERIC(12,2) DEFAULT 0,
  net_salary NUMERIC(12,2) DEFAULT 0,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Draft'
    CHECK (
      payment_status IN ('Draft', 'Generated', 'Paid')
    ),
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (worker_id, salary_month)
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(100) NOT NULL UNIQUE,
  client_id INTEGER NOT NULL
    REFERENCES clients(id) ON DELETE RESTRICT,
  billing_month VARCHAR(20) NOT NULL,
  number_of_workers INTEGER NOT NULL DEFAULT 0
    CHECK (number_of_workers >= 0),
  subtotal NUMERIC(12,2) DEFAULT 0 CHECK (subtotal >= 0),
  gst_percentage NUMERIC(5,2) DEFAULT 0
    CHECK (gst_percentage >= 0),
  gst_amount NUMERIC(12,2) DEFAULT 0 CHECK (gst_amount >= 0),
  other_charges NUMERIC(12,2) DEFAULT 0
    CHECK (other_charges >= 0),
  discount NUMERIC(12,2) DEFAULT 0 CHECK (discount >= 0),
  grand_total NUMERIC(12,2) DEFAULT 0
    CHECK (grand_total >= 0),
  due_date DATE,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending'
    CHECK (
      payment_status IN ('Pending', 'Partially Paid', 'Paid')
    ),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  sale_id VARCHAR(100) NOT NULL UNIQUE,
  client_id INTEGER NOT NULL
    REFERENCES clients(id) ON DELETE RESTRICT,
  invoice_id INTEGER
    REFERENCES invoices(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  sale_date DATE NOT NULL,
  payment_method VARCHAR(100),
  transaction_reference VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'Paid'
    CHECK (
      payment_status IN ('Pending', 'Paid', 'Partially Paid')
    ),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  purchase_id VARCHAR(100) NOT NULL UNIQUE,
  vendor_name VARCHAR(255) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price > 0),
  gst_percentage NUMERIC(5,2) DEFAULT 0
    CHECK (gst_percentage >= 0),
  gst_amount NUMERIC(12,2) DEFAULT 0 CHECK (gst_amount >= 0),
  total_amount NUMERIC(12,2) DEFAULT 0 CHECK (total_amount >= 0),
  purchase_date DATE NOT NULL,
  payment_method VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'Pending'
    CHECK (
      payment_status IN ('Pending', 'Paid', 'Partially Paid')
    ),
  invoice_number VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  asset_id VARCHAR(100) NOT NULL UNIQUE,
  asset_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  serial_number VARCHAR(255),
  purchase_date DATE,
  purchase_cost NUMERIC(12,2) NOT NULL
    CHECK (purchase_cost >= 0),
  asset_condition VARCHAR(50) DEFAULT 'Good',
  assigned_worker_id INTEGER
    REFERENCES workers(id) ON DELETE SET NULL,
  assigned_client_id INTEGER
    REFERENCES clients(id) ON DELETE SET NULL,
  issue_date DATE,
  return_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'Available'
    CHECK (
      status IN (
        'Available',
        'Assigned',
        'Under Maintenance',
        'Lost',
        'Damaged'
      )
    ),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL
    CHECK (
      role IN (
        'Admin',
        'HR Manager',
        'Accountant',
        'Operations Manager'
      )
    ),
  status VARCHAR(50) NOT NULL DEFAULT 'Active'
    CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS clients_phone_unique
ON clients (phone);

CREATE UNIQUE INDEX IF NOT EXISTS clients_email_unique
ON clients (email);

CREATE UNIQUE INDEX IF NOT EXISTS workers_worker_id_unique
ON workers (worker_id);

CREATE UNIQUE INDEX IF NOT EXISTS workers_phone_unique
ON workers (phone);

CREATE UNIQUE INDEX IF NOT EXISTS jobs_requirement_id_unique
ON jobs (requirement_id);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique
ON users (email);

CREATE UNIQUE INDEX IF NOT EXISTS assets_serial_number_unique
ON assets (serial_number)
WHERE serial_number IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_worker_deployment
ON deployments (worker_id)
WHERE status = 'Active';

CREATE INDEX IF NOT EXISTS idx_clients_status
ON clients (status);

CREATE INDEX IF NOT EXISTS idx_workers_status
ON workers (status);

CREATE INDEX IF NOT EXISTS idx_jobs_status
ON jobs (status);

CREATE INDEX IF NOT EXISTS idx_deployments_status
ON deployments (status);

CREATE INDEX IF NOT EXISTS idx_attendance_date
ON attendance (attendance_date);

CREATE INDEX IF NOT EXISTS idx_payrolls_month
ON payrolls (salary_month);

CREATE INDEX IF NOT EXISTS idx_invoices_billing_month
ON invoices (billing_month);

CREATE INDEX IF NOT EXISTS idx_sales_sale_date
ON sales (sale_date);

CREATE INDEX IF NOT EXISTS idx_purchases_purchase_date
ON purchases (purchase_date);

CREATE INDEX IF NOT EXISTS idx_assets_status
ON assets (status);

INSERT INTO clients (
  company_name,
  contact_person,
  email,
  phone,
  work_location,
  payment_terms,
  status
)
VALUES (
  'ABC Technologies',
  'Rahul Sharma',
  'rahul@abc.com',
  '9876543210',
  'Noida',
  '30 Days',
  'Active'
)
ON CONFLICT DO NOTHING;

INSERT INTO clients (
  company_name,
  contact_person,
  email,
  phone,
  work_location,
  payment_terms,
  status
)
VALUES (
  'XYZ Corporation',
  'Amit Verma',
  'amit@xyz.com',
  '9876501234',
  'Delhi',
  '15 Days',
  'Active'
)
ON CONFLICT DO NOTHING;

INSERT INTO workers (
  worker_id,
  full_name,
  phone,
  email,
  gender,
  category,
  skills,
  work_location,
  salary,
  joining_date,
  status
)
VALUES (
  'WRK-001',
  'Ramesh Kumar',
  '9876543211',
  'ramesh@example.com',
  'Male',
  'Electrician',
  'Electrical maintenance',
  'Noida',
  22000,
  '2026-09-01',
  'Available'
)
ON CONFLICT DO NOTHING;

INSERT INTO workers (
  worker_id,
  full_name,
  phone,
  email,
  gender,
  category,
  skills,
  work_location,
  salary,
  joining_date,
  status
)
VALUES (
  'WRK-002',
  'Suresh Yadav',
  '9876543212',
  'suresh@example.com',
  'Male',
  'Security Guard',
  'Security and surveillance',
  'Delhi',
  18000,
  '2026-08-15',
  'Deployed'
)
ON CONFLICT DO NOTHING;

INSERT INTO jobs (
  requirement_id,
  client_name,
  job_title,
  worker_category,
  workers_required,
  skills_required,
  work_location,
  shift,
  salary_offered,
  start_date,
  end_date,
  status,
  description
)
VALUES (
  'JOB-001',
  'ABC Technologies',
  'Electrician',
  'Skilled Worker',
  5,
  'Electrical maintenance',
  'Noida',
  'Day',
  22000,
  '2026-09-15',
  '2027-03-15',
  'Open',
  'Electricians required for plant maintenance.'
)
ON CONFLICT DO NOTHING;

INSERT INTO jobs (
  requirement_id,
  client_name,
  job_title,
  worker_category,
  workers_required,
  skills_required,
  work_location,
  shift,
  salary_offered,
  start_date,
  end_date,
  status,
  description
)
VALUES (
  'JOB-002',
  'XYZ Corporation',
  'Security Guard',
  'Security',
  10,
  'Security and surveillance',
  'Delhi',
  'Night',
  18000,
  '2026-09-20',
  '2027-09-20',
  'In Progress',
  'Security guards required for corporate office.'
)
ON CONFLICT DO NOTHING;

INSERT INTO users (
  full_name,
  email,
  password_hash,
  role,
  status
)
VALUES (
  'System Administrator',
  'admin@workforceerp.com',
  '$2a$10$T0J4vKBt0r8SASx9V0Z2M.vbL9P02c9rPqtL0SHnbm7M6lI9UaR2m',
  'Admin',
  'Active'
)
ON CONFLICT DO NOTHING;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;