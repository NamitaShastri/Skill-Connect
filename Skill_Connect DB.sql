-- The student Dashboard

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
	year INT NOT NULL, --newly added
	department TEXT NOT NULL,-- newly added will be short;y reflected in UI also
    title TEXT,
    email TEXT UNIQUE NOT NULL, -- same comment as abiove
    password TEXT NOT NULL,
    role TEXT CHECK (role IN ('student', 'faculty')),

    linkedin_url TEXT,
    linkedin_connected BOOLEAN DEFAULT FALSE,

    github_username TEXT,
    github_connected BOOLEAN DEFAULT FALSE
);

CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    category TEXT
);
-- created tables for project upload
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,  
    roles_needed TEXT, --updated
    skills TEXT, --updated (directly added the column here instead of adding diff table for skills)
    github_url TEXT
);

-- the post for the project table (some post may not have project attached)
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Linking the project with post(for adding project later on after posting)
CREATE TABLE post_projects (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id) ON DELETE CASCADE,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE
);


CREATE TABLE clubs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE club_members (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    club_id INT REFERENCES clubs(id) ON DELETE CASCADE
);


-- The Project collab page
CREATE TABLE project_requests (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    applicant_id INT REFERENCES users(id) ON DELETE CASCADE,
    github_link TEXT,
    contribution TEXT,
    skills TEXT,
    status TEXT DEFAULT 'pending'
);

CREATE TABLE project_members (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE
);

--Club page opportunity req table
CREATE TABLE club_opportunities(
    id SERIAL PRIMARY KEY,

    club_id INT REFERENCES clubs(id) ON DELETE CASCADE,
    applicant_id INT REFERENCES users(id) ON DELETE CASCADE,

    role TEXT,
    message TEXT,

    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending'
);

-- Event table for event page
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE,
    start_time TIME,
    end_time TIME,
    type TEXT, -- workshop / competition etc.
    status TEXT CHECK (status IN ('upcoming', 'completed')) DEFAULT 'upcoming'
);

ALTER TABLE events
ADD COLUMN form_link TEXT;

CREATE TABLE event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE
);

--ai generated based on event_registrations table for unique request and to eliminate same person requesting again for the same event
ALTER TABLE event_registrations
ADD CONSTRAINT unique_registration UNIQUE (event_id, user_id);

-- club members(ai)
ALTER TABLE club_members
ADD CONSTRAINT unique_club_member UNIQUE (user_id, club_id);

-- project members(ai)
ALTER TABLE project_members
ADD CONSTRAINT unique_member UNIQUE (project_id, user_id);


-- Netwrking page starts from here
CREATE TABLE connections (
    id SERIAL PRIMARY KEY,

    sender_id INT REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INT REFERENCES users(id) ON DELETE CASCADE,

    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending'
);

CREATE TABLE mentorship_requests (
    id SERIAL PRIMARY KEY,

    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    mentor_id INT REFERENCES users(id) ON DELETE CASCADE,

    message TEXT,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending'
);


CREATE TABLE recent_activities (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    action TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- (ai)
ALTER TABLE connections
ADD CONSTRAINT unique_connection UNIQUE (sender_id, receiver_id);

ALTER TABLE project_requests
ADD CONSTRAINT unique_project_request UNIQUE (project_id, applicant_id);

ALTER TABLE mentorship_requests
ADD CONSTRAINT unique_mentorship UNIQUE (student_id, mentor_id);


ALTER TABLE users
ALTER COLUMN year DROP NOT NULL;

ALTER TABLE users
ADD CONSTRAINT check_year_for_students
CHECK (
    (role = 'student' AND year IS NOT NULL)
    OR
    (role = 'faculty')
);

-- Data of students of SOCSET
-- DIP CSE
INSERT INTO users (name, year, department, title, email, password, role) VALUES
-- Year 1
('Rohan Mehta',1,'Diploma CSE','Computer Science Student','rohan@gmail.com','1234','student'),
('Aditi Shah',1,'Diploma CSE','Computer Science Student','aditi@gmail.com','1234','student'),
('Karan Patel',1,'Diploma CSE','Computer Science Student','karan@gmail.com','1234','student'),
('Nisha Desai',1,'Diploma CSE','Computer Science Student','nisha@gmail.com','1234','student'),
('Yug Patel',1,'Diploma CSE','Computer Science Student','yug@gmail.com','1234','student'),

-- Year 2 
('Namita Shastri',2,'Diploma CSE','Computer Science Student','namita.shastri@itmbu.ac.in','1234','student'),
('Harsh Trivedi',2,'Diploma CSE','Computer Science Student','harsh@gmail.com','1234','student'),
('Pooja Shah',2,'Diploma CSE','Computer Science Student','pooja@gmail.com','1234','student'),
('Dhruv Joshi',2,'Diploma CSE','Computer Science Student','dhruv@gmail.com','1234','student'),
('Riya Mehta',2,'Diploma CSE','Computer Science Student','riya@gmail.com','1234','student'),

-- Year 3
('Jay Patel',3,'Diploma CSE','Computer Science Student','jay@gmail.com','1234','student'),
('Sneha Parmar',3,'Diploma CSE','Computer Science Student','sneha@gmail.com','1234','student'),
('Parth Bhatt',3,'Diploma CSE','Computer Science Student','parthbhatt@gmail.com','1234','student'),
('Jinal Mehta',3,'Diploma CSE','Computer Science Student','jinal@gmail.com','1234','student'),
('Meet Desai',3,'Diploma CSE','Computer Science Student','meet@gmail.com','1234','student');

-- DIP IT
INSERT INTO users (name, year, department, title, email, password, role) VALUES
-- Year 1
('Dev Patel',1,'Diploma IT','Information Technology Student','dev@gmail.com','1234','student'),
('Meera Shah',1,'Diploma IT','Information Technology Student','meera@gmail.com','1234','student'),
('Rahul Verma',1,'Diploma IT','Information Technology Student','rahul@gmail.com','1234','student'),
('Neha Shah',1,'Diploma IT','Information Technology Student','neha@gmail.com','1234','student'),
('Aman Joshi',1,'Diploma IT','Information Technology Student','aman@gmail.com','1234','student'),

-- Year 2 
('Janak Parmar',2,'Diploma IT','Information Technology Student','parmar.janak@itmbu.ac.in','1234','student'),
('Ravi Patel',2,'Diploma IT','Information Technology Student','ravi@gmail.com','1234','student'),
('Heena Mehta',2,'Diploma IT','Information Technology Student','heena@gmail.com','1234','student'),
('Parth Shah',2,'Diploma IT','Information Technology Student','parth@gmail.com','1234','student'),
('Jigar Desai',2,'Diploma IT','Information Technology Student','jigar@gmail.com','1234','student'),

-- Year 3
('Kunal Shah',3,'Diploma IT','Information Technology Student','kunal@gmail.com','1234','student'),
('Nirali Patel',3,'Diploma IT','Information Technology Student','nirali@gmail.com','1234','student'),
('Chirag Mehta',3,'Diploma IT','Information Technology Student','chirag@gmail.com','1234','student'),
('Bhavya Shah',3,'Diploma IT','Information Technology Student','bhavya@gmail.com','1234','student'),
('Tushar Patel',3,'Diploma IT','Information Technology Student','tushar@gmail.com','1234','student');




-- B.tech CSE 
INSERT INTO users (name, year, department, title, email, password, role) VALUES
-- Year 1
('Aman Gupta',1,'B.Tech CSE','Computer Science Student','csebt1@gmail.com','1234','student'),
('Simran Kaur',1,'B.Tech CSE','Computer Science Student','csebt2@gmail.com','1234','student'),
('Riya Shah',1,'B.Tech CSE','Computer Science Student','csebt3@gmail.com','1234','student'),
('Kunal Mehta',1,'B.Tech CSE','Computer Science Student','csebt4@gmail.com','1234','student'),
('Priya Nair',1,'B.Tech CSE','Computer Science Student','csebt5@gmail.com','1234','student'),

-- Year 2
('Dhruv Patel',2,'B.Tech CSE','Computer Science Student','csebt6@gmail.com','1234','student'),
('Sneha Shah',2,'B.Tech CSE','Computer Science Student','csebt7@gmail.com','1234','student'),
('Jay Mehta',2,'B.Tech CSE','Computer Science Student','csebt8@gmail.com','1234','student'),
('Krupa Desai',2,'B.Tech CSE','Computer Science Student','csebt9@gmail.com','1234','student'),
('Yash Joshi',2,'B.Tech CSE','Computer Science Student','csebt10@gmail.com','1234','student'),

-- Year 3
('Ritesh Shah',3,'B.Tech CSE','Computer Science Student','csebt11@gmail.com','1234','student'),
('Neel Patel',3,'B.Tech CSE','Computer Science Student','csebt12@gmail.com','1234','student'),
('Parth Dave',3,'B.Tech CSE','Computer Science Student','csebt13@gmail.com','1234','student'),
('Jinal Shah',3,'B.Tech CSE','Computer Science Student','csebt14@gmail.com','1234','student'),
('Meet Joshi',3,'B.Tech CSE','Computer Science Student','csebt15@gmail.com','1234','student'),

-- Year 4
('Arjun Singh',4,'B.Tech CSE','Computer Science Student','csebt16@gmail.com','1234','student'),
('Pooja Patel',4,'B.Tech CSE','Computer Science Student','csebt17@gmail.com','1234','student'),
('Nikhil Shah',4,'B.Tech CSE','Computer Science Student','csebt18@gmail.com','1234','student'),
('Vishal Mehta',4,'B.Tech CSE','Computer Science Student','csebt19@gmail.com','1234','student'),
('Komal Shah',4,'B.Tech CSE','Computer Science Student','csebt20@gmail.com','1234','student');


-- B.tech IT
INSERT INTO users (name, year, department, title, email, password, role) VALUES
-- Year 1
('Devansh Patel',1,'B.Tech IT','Information Technology Student','itbt1@gmail.com','1234','student'),
('Heena Shah',1,'B.Tech IT','Information Technology Student','itbt2@gmail.com','1234','student'),
('Ravi Mehta',1,'B.Tech IT','Information Technology Student','itbt3@gmail.com','1234','student'),
('Neha Kapoor',1,'B.Tech IT','Information Technology Student','itbt4@gmail.com','1234','student'),
('Aman Shah',1,'B.Tech IT','Information Technology Student','itbt5@gmail.com','1234','student'),

-- Year 2
('Parth Mehta',2,'B.Tech IT','Information Technology Student','itbt6@gmail.com','1234','student'),
('Jigar Patel',2,'B.Tech IT','Information Technology Student','itbt7@gmail.com','1234','student'),
('Nirali Shah',2,'B.Tech IT','Information Technology Student','itbt8@gmail.com','1234','student'),
('Chirag Mehta',2,'B.Tech IT','Information Technology Student','itbt9@gmail.com','1234','student'),
('Bhavya Patel',2,'B.Tech IT','Information Technology Student','itbt10@gmail.com','1234','student'),

-- Year 3
('Tushar Shah',3,'B.Tech IT','Information Technology Student','itbt11@gmail.com','1234','student'),
('Deep Patel',3,'B.Tech IT','Information Technology Student','itbt12@gmail.com','1234','student'),
('Kajal Mehta',3,'B.Tech IT','Information Technology Student','itbt13@gmail.com','1234','student'),
('Ritesh Shah',3,'B.Tech IT','Information Technology Student','itbt14@gmail.com','1234','student'),
('Snehal Patel',3,'B.Tech IT','Information Technology Student','itbt15@gmail.com','1234','student'),

-- Year 4
('Milan Joshi',4,'B.Tech IT','Information Technology Student','itbt16@gmail.com','1234','student'),
('Kriti Shah',4,'B.Tech IT','Information Technology Student','itbt17@gmail.com','1234','student'),
('Hardik Patel',4,'B.Tech IT','Information Technology Student','itbt18@gmail.com','1234','student'),
('Jiya Mehta',4,'B.Tech IT','Information Technology Student','itbt19@gmail.com','1234','student'),
('Ankit Shah',4,'B.Tech IT','Information Technology Student','itbt20@gmail.com','1234','student');


-- B.tech CSE (AI)
INSERT INTO users (name, year, department, title, email, password, role) VALUES
-- Year 1
('Aarav Shah',1,'B.Tech CSE (AI)','Artificial Intelligence Student','ai1@gmail.com','1234','student'),
('Diya Patel',1,'B.Tech CSE (AI)','Artificial Intelligence Student','ai2@gmail.com','1234','student'),
('Krish Mehta',1,'B.Tech CSE (AI)','Artificial Intelligence Student','ai3@gmail.com','1234','student'),
('Riya Joshi',1,'B.Tech CSE (AI)','Artificial Intelligence Student','ai4@gmail.com','1234','student'),
('Yashvi Shah',1,'B.Tech CSE (AI)','Artificial Intelligence Student','ai5@gmail.com','1234','student'),

-- Year 2
('Devansh Mehta',2,'B.Tech CSE (AI)','Artificial Intelligence Student','ai6@gmail.com','1234','student'),
('Kavya Shah',2,'B.Tech CSE (AI)','Artificial Intelligence Student','ai7@gmail.com','1234','student'),
('Rohan Patel',2,'B.Tech CSE (AI)','Artificial Intelligence Student','ai8@gmail.com','1234','student'),
('Sneha Mehta',2,'B.Tech CSE (AI)','Artificial Intelligence Student','ai9@gmail.com','1234','student'),
('Harsh Shah',2,'B.Tech CSE (AI)','Artificial Intelligence Student','ai10@gmail.com','1234','student'),

-- Year 3
('Parth Patel',3,'B.Tech CSE (AI)','Artificial Intelligence Student','ai11@gmail.com','1234','student'),
('Jinal Shah',3,'B.Tech CSE (AI)','Artificial Intelligence Student','ai12@gmail.com','1234','student'),
('Meet Mehta',3,'B.Tech CSE (AI)','Artificial Intelligence Student','ai13@gmail.com','1234','student'),
('Nirali Patel',3,'B.Tech CSE (AI)','Artificial Intelligence Student','ai14@gmail.com','1234','student'),
('Chirag Shah',3,'B.Tech CSE (AI)','Artificial Intelligence Student','ai15@gmail.com','1234','student'),

-- Year 4
('Tushar Patel',4,'B.Tech CSE (AI)','Artificial Intelligence Student','ai16@gmail.com','1234','student'),
('Bhavya Shah',4,'B.Tech CSE (AI)','Artificial Intelligence Student','ai17@gmail.com','1234','student'),
('Deep Mehta',4,'B.Tech CSE (AI)','Artificial Intelligence Student','ai18@gmail.com','1234','student'),
('Kajal Patel',4,'B.Tech CSE (AI)','Artificial Intelligence Student','ai19@gmail.com','1234','student'),
('Ritesh Shah',4,'B.Tech CSE (AI)','Artificial Intelligence Student','ai20@gmail.com','1234','student');


-- B.tech CSE(Cyber)
INSERT INTO users (name, year, department, title, email, password, role) VALUES
-- Year 1
('Arnav Patel',1,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy1@gmail.com','1234','student'),
('Mahi Shah',1,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy2@gmail.com','1234','student'),
('Dev Mehta',1,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy3@gmail.com','1234','student'),
('Kavya Patel',1,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy4@gmail.com','1234','student'),
('Ronak Shah',1,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy5@gmail.com','1234','student'),

-- Year 2
('Yash Mehta',2,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy6@gmail.com','1234','student'),
('Nidhi Shah',2,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy7@gmail.com','1234','student'),
('Amit Patel',2,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy8@gmail.com','1234','student'),
('Pooja Mehta',2,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy9@gmail.com','1234','student'),
('Kiran Shah',2,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy10@gmail.com','1234','student'),

-- Year 3
('Harsh Patel',3,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy11@gmail.com','1234','student'),
('Jiya Shah',3,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy12@gmail.com','1234','student'),
('Neel Mehta',3,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy13@gmail.com','1234','student'),
('Riya Patel',3,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy14@gmail.com','1234','student'),
('Parth Shah',3,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy15@gmail.com','1234','student'),

-- Year 4
('Vivek Mehta',4,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy16@gmail.com','1234','student'),
('Sneha Patel',4,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy17@gmail.com','1234','student'),
('Rohan Shah',4,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy18@gmail.com','1234','student'),
('Komal Mehta',4,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy19@gmail.com','1234','student'),
('Ankit Patel',4,'B.Tech CSE (Cyber Security)','Cyber Security Student','cy20@gmail.com','1234','student');


-- BCA
INSERT INTO users (name, year, department, title, email, password, role) VALUES
-- Year 1
('Ritesh Shah',1,'BCA','Computer Application Student','bca1@gmail.com','1234','student'),
('Sneha Patel',1,'BCA','Computer Application Student','bca2@gmail.com','1234','student'),
('Jay Mehta',1,'BCA','Computer Application Student','bca3@gmail.com','1234','student'),
('Neel Shah',1,'BCA','Computer Application Student','bca4@gmail.com','1234','student'),
('Krupa Desai',1,'BCA','Computer Application Student','bca5@gmail.com','1234','student'),

-- Year 2
('Aman Shah',2,'BCA','Computer Application Student','bca6@gmail.com','1234','student'),
('Nirali Patel',2,'BCA','Computer Application Student','bca7@gmail.com','1234','student'),
('Chirag Mehta',2,'BCA','Computer Application Student','bca8@gmail.com','1234','student'),
('Bhavya Shah',2,'BCA','Computer Application Student','bca9@gmail.com','1234','student'),
('Tushar Patel',2,'BCA','Computer Application Student','bca10@gmail.com','1234','student'),

-- Year 3
('Deep Patel',3,'BCA','Computer Application Student','bca11@gmail.com','1234','student'),
('Kajal Mehta',3,'BCA','Computer Application Student','bca12@gmail.com','1234','student'),
('Ritesh Shah',3,'BCA','Computer Application Student','bca13@gmail.com','1234','student'),
('Snehal Patel',3,'BCA','Computer Application Student','bca14@gmail.com','1234','student'),
('Milan Joshi',3,'BCA','Computer Application Student','bca15@gmail.com','1234','student');


-- MCA
INSERT INTO users (name, year, department, title, email, password, role) VALUES
-- Year 1
('Amit Joshi',1,'MCA','Postgraduate Computer Application Student','mca1@gmail.com','1234','student'),
('Heena Shah',1,'MCA','Postgraduate Computer Application Student','mca2@gmail.com','1234','student'),
('Dhruv Patel',1,'MCA','Postgraduate Computer Application Student','mca3@gmail.com','1234','student'),
('Jinal Mehta',1,'MCA','Postgraduate Computer Application Student','mca4@gmail.com','1234','student'),
('Parth Shah',1,'MCA','Postgraduate Computer Application Student','mca5@gmail.com','1234','student'),

-- Year 2
('Nikhil Shah',2,'MCA','Postgraduate Computer Application Student','mca6@gmail.com','1234','student'),
('Vishal Mehta',2,'MCA','Postgraduate Computer Application Student','mca7@gmail.com','1234','student'),
('Pooja Patel',2,'MCA','Postgraduate Computer Application Student','mca8@gmail.com','1234','student'),
('Raj Patel',2,'MCA','Postgraduate Computer Application Student','mca9@gmail.com','1234','student'),
('Kavita Shah',2,'MCA','Postgraduate Computer Application Student','mca10@gmail.com','1234','student');


-- M.tech
INSERT INTO users (name, year, department, title, email, password, role) VALUES
-- Year 1
('Rakesh Patel',1,'M.Tech CSE','Postgraduate Engineering Student','mtech1@gmail.com','1234','student'),
('Kiran Shah',1,'M.Tech CSE','Postgraduate Engineering Student','mtech2@gmail.com','1234','student'),
('Mehul Mehta',1,'M.Tech CSE','Postgraduate Engineering Student','mtech3@gmail.com','1234','student'),
('Pallavi Shah',1,'M.Tech CSE','Postgraduate Engineering Student','mtech4@gmail.com','1234','student'),
('Tarun Patel',1,'M.Tech CSE','Postgraduate Engineering Student','mtech5@gmail.com','1234','student'),

-- Year 2
('Ankit Shah',2,'M.Tech CSE','Postgraduate Engineering Student','mtech6@gmail.com','1234','student'),
('Jigar Patel',2,'M.Tech CSE','Postgraduate Engineering Student','mtech7@gmail.com','1234','student'),
('Komal Shah',2,'M.Tech CSE','Postgraduate Engineering Student','mtech8@gmail.com','1234','student'),
('Ravi Mehta',2,'M.Tech CSE','Postgraduate Engineering Student','mtech9@gmail.com','1234','student'),
('Sneha Patel',2,'M.Tech CSE','Postgraduate Engineering Student','mtech10@gmail.com','1234','student');

SELECT id, name, department, year FROM users;

INSERT INTO skills (user_id, name, level, category) VALUES

-- 1–20
(1,'Python','Intermediate','Programming'),(1,'HTML','Advanced','Web Development'),
(2,'Java','Beginner','Programming'),(2,'CSS','Intermediate','Web Development'),
(3,'C++','Intermediate','Programming'),(3,'DSA','Beginner','Core CS'),
(4,'JavaScript','Advanced','Web Development'),(4,'React','Intermediate','Web Development'),
(5,'Machine Learning','Beginner','AI/ML'),(5,'Python','Intermediate','Programming'),
(6,'Python','Advanced','Programming'),(6,'Machine Learning','Intermediate','AI/ML'),
(7,'Java','Intermediate','Programming'),(7,'Spring Boot','Beginner','Backend'),
(8,'HTML','Advanced','Web Development'),(8,'CSS','Advanced','Web Development'),
(9,'JavaScript','Intermediate','Web Development'),(9,'Node.js','Beginner','Backend'),
(10,'SQL','Intermediate','Database'),(10,'MongoDB','Beginner','Database'),

(11,'Python','Intermediate','Programming'),(11,'Data Analysis','Beginner','Data Science'),
(12,'C','Advanced','Programming'),(12,'DSA','Intermediate','Core CS'),
(13,'React','Intermediate','Web Development'),(13,'Node.js','Intermediate','Backend'),
(14,'Java','Beginner','Programming'),(14,'SQL','Intermediate','Database'),
(15,'HTML','Advanced','Web Development'),(15,'JavaScript','Intermediate','Web Development'),
(16,'Networking','Intermediate','Networking'),(16,'Linux','Beginner','Systems'),
(17,'Cloud Computing','Beginner','Cloud'),(17,'AWS','Beginner','Cloud'),
(18,'DBMS','Intermediate','Database'),(18,'SQL','Advanced','Database'),
(19,'Cyber Security','Beginner','Security'),(19,'Networking','Intermediate','Security'),
(20,'Python','Intermediate','Programming'),(20,'Machine Learning','Beginner','AI/ML'),

-- 21–40
(21,'Networking','Advanced','Networking'),(21,'Cyber Security','Intermediate','Security'),
(22,'Java','Intermediate','Programming'),(22,'Spring Boot','Beginner','Backend'),
(23,'SQL','Advanced','Database'),(23,'MongoDB','Intermediate','Database'),
(24,'React','Intermediate','Web Development'),(24,'JavaScript','Advanced','Web Development'),
(25,'HTML','Advanced','Web Development'),(25,'CSS','Intermediate','Web Development'),
(26,'Python','Intermediate','Programming'),(26,'Pandas','Beginner','Data Science'),
(27,'Data Analysis','Intermediate','Data Science'),(27,'Excel','Advanced','Tools'),
(28,'JavaScript','Intermediate','Web Development'),(28,'Node.js','Intermediate','Backend'),
(29,'C++','Intermediate','Programming'),(29,'DSA','Intermediate','Core CS'),
(30,'Cloud Computing','Beginner','Cloud'),(30,'Docker','Beginner','Tools'),

(31,'C++','Advanced','Programming'),(31,'DSA','Advanced','Core CS'),
(32,'Java','Intermediate','Programming'),(32,'Spring Boot','Intermediate','Backend'),
(33,'Python','Intermediate','Programming'),(33,'Machine Learning','Beginner','AI/ML'),
(34,'React','Intermediate','Web Development'),(34,'Node.js','Intermediate','Backend'),
(35,'SQL','Advanced','Database'),(35,'MongoDB','Intermediate','Database'),
(36,'Java','Advanced','Programming'),(36,'System Design','Beginner','Core CS'),
(37,'Python','Advanced','Programming'),(37,'Deep Learning','Beginner','AI/ML'),
(38,'JavaScript','Advanced','Web Development'),(38,'React','Advanced','Web Development'),
(39,'Node.js','Intermediate','Backend'),(39,'Express.js','Intermediate','Backend'),
(40,'Operating Systems','Intermediate','Core CS'),(40,'DBMS','Advanced','Database'),

-- 41–80
(41,'Python','Intermediate','Programming'),(41,'SQL','Intermediate','Database'),
(42,'Java','Intermediate','Programming'),(42,'Spring Boot','Beginner','Backend'),
(43,'C++','Intermediate','Programming'),(43,'DSA','Advanced','Core CS'),
(44,'React','Intermediate','Web Development'),(44,'JavaScript','Advanced','Web Development'),
(45,'MongoDB','Intermediate','Database'),(45,'Node.js','Intermediate','Backend'),
(46,'Operating Systems','Advanced','Core CS'),(46,'System Design','Intermediate','Core CS'),
(47,'HTML','Advanced','Web Development'),(47,'CSS','Advanced','Web Development'),
(48,'JavaScript','Intermediate','Web Development'),(48,'React','Intermediate','Web Development'),
(49,'Python','Intermediate','Programming'),(49,'Machine Learning','Beginner','AI/ML'),
(50,'SQL','Advanced','Database'),(50,'DBMS','Advanced','Database'),

(51,'Networking','Intermediate','Networking'),(51,'Linux','Intermediate','Systems'),
(52,'Cloud Computing','Beginner','Cloud'),(52,'AWS','Beginner','Cloud'),
(53,'DBMS','Intermediate','Database'),(53,'SQL','Advanced','Database'),
(54,'Cyber Security','Beginner','Security'),(54,'Networking','Intermediate','Security'),
(55,'Python','Intermediate','Programming'),(55,'Machine Learning','Beginner','AI/ML'),
(56,'Java','Intermediate','Programming'),(56,'Spring Boot','Beginner','Backend'),
(57,'SQL','Advanced','Database'),(57,'MongoDB','Intermediate','Database'),
(58,'React','Intermediate','Web Development'),(58,'JavaScript','Advanced','Web Development'),
(59,'HTML','Advanced','Web Development'),(59,'CSS','Intermediate','Web Development'),
(60,'Cloud Computing','Beginner','Cloud'),(60,'Docker','Beginner','Tools'),

-- 81–120
(61,'Networking','Intermediate','Networking'),(61,'Linux','Beginner','Systems'),
(62,'Python','Intermediate','Programming'),(62,'Data Analysis','Beginner','Data Science'),
(63,'JavaScript','Intermediate','Web Development'),(63,'Node.js','Intermediate','Backend'),
(64,'SQL','Intermediate','Database'),(64,'MongoDB','Beginner','Database'),
(65,'Cyber Security','Intermediate','Security'),(65,'Networking','Advanced','Security'),
(66,'Cloud Computing','Beginner','Cloud'),(66,'AWS','Beginner','Cloud'),
(67,'HTML','Advanced','Web Development'),(67,'CSS','Advanced','Web Development'),
(68,'Java','Intermediate','Programming'),(68,'Spring Boot','Beginner','Backend'),
(69,'Python','Intermediate','Programming'),(69,'Machine Learning','Beginner','AI/ML'),
(70,'DevOps','Beginner','Cloud'),(70,'Docker','Beginner','Tools'),

(71,'Python','Intermediate','Programming'),(71,'Machine Learning','Intermediate','AI/ML'),
(72,'Deep Learning','Beginner','AI/ML'),(72,'TensorFlow','Beginner','AI/ML'),
(73,'Data Analysis','Intermediate','Data Science'),(73,'Pandas','Intermediate','Data Science'),
(74,'NLP','Beginner','AI/ML'),(74,'Python','Advanced','Programming'),
(75,'Computer Vision','Beginner','AI/ML'),(75,'OpenCV','Beginner','AI/ML'),
(76,'Python','Intermediate','Programming'),(76,'Machine Learning','Intermediate','AI/ML'),
(77,'Deep Learning','Beginner','AI/ML'),(77,'TensorFlow','Beginner','AI/ML'),
(78,'Data Analysis','Intermediate','Data Science'),(78,'Pandas','Intermediate','Data Science'),
(79,'NLP','Beginner','AI/ML'),(79,'Python','Advanced','Programming'),
(80,'Computer Vision','Beginner','AI/ML'),(80,'OpenCV','Beginner','AI/ML'),

-- INSERT INTO skills (user_id, name, level, category) VALUES

-- 81–90 (AI students mostly)
(81,'Python','Intermediate','Programming'),(81,'Machine Learning','Intermediate','AI/ML'),
(82,'Deep Learning','Beginner','AI/ML'),(82,'TensorFlow','Beginner','AI/ML'),
(83,'Data Analysis','Intermediate','Data Science'),(83,'Pandas','Intermediate','Data Science'),
(84,'NLP','Beginner','AI/ML'),(84,'Python','Advanced','Programming'),
(85,'Computer Vision','Beginner','AI/ML'),(85,'OpenCV','Beginner','AI/ML'),
(86,'Python','Intermediate','Programming'),(86,'Machine Learning','Intermediate','AI/ML'),
(87,'Deep Learning','Beginner','AI/ML'),(87,'TensorFlow','Beginner','AI/ML'),
(88,'Data Analysis','Intermediate','Data Science'),(88,'Pandas','Intermediate','Data Science'),
(89,'NLP','Beginner','AI/ML'),(89,'Python','Advanced','Programming'),
(90,'Computer Vision','Beginner','AI/ML'),(90,'OpenCV','Beginner','AI/ML'),

-- 91–100 (Cyber)
(91,'Cyber Security','Intermediate','Security'),(91,'Networking','Intermediate','Security'),
(92,'Ethical Hacking','Beginner','Security'),(92,'Linux','Intermediate','Systems'),
(93,'Cryptography','Intermediate','Security'),(93,'Networking','Beginner','Security'),
(94,'Penetration Testing','Beginner','Security'),(94,'Linux','Intermediate','Systems'),
(95,'Network Security','Intermediate','Security'),(95,'Firewalls','Beginner','Security'),
(96,'Cyber Laws','Beginner','Security'),(96,'Cryptography','Intermediate','Security'),
(97,'Security Auditing','Beginner','Security'),(97,'SIEM','Beginner','Security'),
(98,'Ethical Hacking','Intermediate','Security'),(98,'Networking','Advanced','Security'),
(99,'Penetration Testing','Beginner','Security'),(99,'Linux','Intermediate','Systems'),
(100,'Cyber Security','Advanced','Security'),(100,'Networking','Advanced','Security'),

-- 101–110
(101,'Cyber Security','Intermediate','Security'),(101,'Networking','Intermediate','Security'),
(102,'Ethical Hacking','Beginner','Security'),(102,'Linux','Intermediate','Systems'),
(103,'Cryptography','Intermediate','Security'),(103,'Networking','Beginner','Security'),
(104,'Penetration Testing','Beginner','Security'),(104,'Linux','Intermediate','Systems'),
(105,'Network Security','Intermediate','Security'),(105,'Firewalls','Beginner','Security'),
(106,'Cyber Laws','Beginner','Security'),(106,'Cryptography','Intermediate','Security'),
(107,'Security Auditing','Beginner','Security'),(107,'SIEM','Beginner','Security'),
(108,'Ethical Hacking','Intermediate','Security'),(108,'Networking','Advanced','Security'),
(109,'Penetration Testing','Beginner','Security'),(109,'Linux','Intermediate','Systems'),
(110,'Cyber Security','Advanced','Security'),(110,'Networking','Advanced','Security'),

-- 111–120 (BCA)
(111,'HTML','Intermediate','Web Development'),(111,'CSS','Intermediate','Web Development'),
(112,'JavaScript','Intermediate','Web Development'),(112,'React','Beginner','Web Development'),
(113,'SQL','Intermediate','Database'),(113,'MySQL','Intermediate','Database'),
(114,'Java','Beginner','Programming'),(114,'OOP','Intermediate','Programming'),
(115,'Python','Intermediate','Programming'),(115,'Data Analysis','Beginner','Data Science'),
(116,'HTML','Advanced','Web Development'),(116,'JavaScript','Intermediate','Web Development'),
(117,'React','Beginner','Web Development'),(117,'Node.js','Beginner','Backend'),
(118,'SQL','Intermediate','Database'),(118,'MySQL','Intermediate','Database'),
(119,'Java','Beginner','Programming'),(119,'OOP','Intermediate','Programming'),
(120,'Python','Intermediate','Programming'),(120,'Data Analysis','Beginner','Data Science');

-- 121–145
INSERT INTO skills (user_id, name, level, category) VALUES
(121,'HTML','Intermediate','Web Development'),(121,'JavaScript','Beginner','Web Development'),
(122,'React','Beginner','Web Development'),(122,'Node.js','Beginner','Backend'),
(123,'SQL','Intermediate','Database'),(123,'MySQL','Intermediate','Database'),
(124,'Java','Beginner','Programming'),(124,'OOP','Intermediate','Programming'),
(125,'Python','Intermediate','Programming'),(125,'Data Analysis','Beginner','Data Science'),

(126,'Java','Advanced','Programming'),(126,'System Design','Intermediate','Core CS'),
(127,'Python','Advanced','Programming'),(127,'Machine Learning','Intermediate','AI/ML'),
(128,'SQL','Advanced','Database'),(128,'DBMS','Advanced','Database'),
(129,'React','Intermediate','Web Development'),(129,'Node.js','Intermediate','Backend'),
(130,'Operating Systems','Advanced','Core CS'),(130,'System Design','Advanced','Core CS'),

(131,'Java','Advanced','Programming'),(131,'System Design','Intermediate','Core CS'),
(132,'Python','Advanced','Programming'),(132,'Machine Learning','Intermediate','AI/ML'),
(133,'SQL','Advanced','Database'),(133,'DBMS','Advanced','Database'),
(134,'React','Intermediate','Web Development'),(134,'Node.js','Intermediate','Backend'),
(135,'Operating Systems','Advanced','Core CS'),(135,'System Design','Advanced','Core CS'),

(136,'Advanced Algorithms','Advanced','Core CS'),(136,'Research Methods','Intermediate','Academics'),
(137,'Machine Learning','Advanced','AI/ML'),(137,'Deep Learning','Intermediate','AI/ML'),
(138,'Cloud Computing','Advanced','Cloud'),(138,'AWS','Intermediate','Cloud'),
(139,'Cyber Security','Advanced','Security'),(139,'Networking','Advanced','Security'),
(140,'Data Science','Advanced','Data Science'),(140,'Python','Advanced','Programming'),

(141,'Advanced Algorithms','Advanced','Core CS'),(141,'Research Methods','Intermediate','Academics'),
(142,'Machine Learning','Advanced','AI/ML'),(142,'Deep Learning','Intermediate','AI/ML'),
(143,'Cloud Computing','Advanced','Cloud'),(143,'AWS','Intermediate','Cloud'),
(144,'Cyber Security','Advanced','Security'),(144,'Networking','Advanced','Security'),
(145,'Data Science','Advanced','Data Science'),(145,'Python','Advanced','Programming');

-- SELECT COUNT(*) FROM skills;
-- Faculty data and their skills

INSERT INTO users (name, year, department, title, email, password, role) VALUES

('Ishan Mistri',NULL,'SOCSET','Professor','ishan.cse@itmbu.ac.in','1234','faculty'),
('Prachi Rajput',NULL,'SOCSET','Head od Dpeartment of Diploma SOCSET','prachi.rajput@itmbu.ac.in','1234','faculty'),
('Pooja Bhaliya',NULL,'SOCSET','Professor','poojabhaliya.cse@itmbu.ac.in','1234','faculty'),
('Riya Modi',NULL,'SOCSET',' Professo','riya.modi@itmbu.ac.in','1234','faculty'),
('Neel Patel',NULL,'SOCSET','Professor','neelpatel.cse@itmbu.ac.in','1234','faculty'),
('Yogita Parmar',NULL,'SOCSET','Professor','yogita.parmar@itmbu.ac.in','1234','faculty'),
('Abhishek Dave',NULL,'SOCSET','Professor','abhishekdave.cse@itmbu.ac.in','1234','faculty'),
('Smruti Sharma',NULL,'SOCSET','Professor','smruti.cse@itmbu.ac.in','1234','faculty');


INSERT INTO skills (user_id, name, level, category) VALUES
((SELECT id FROM users WHERE email='ishan.cse@itmbu.ac.in'),'Python','Advanced','Programming'),
((SELECT id FROM users WHERE email='ishan.cse@itmbu.ac.in'),'Machine Learning','Advanced','AI/ML'),

((SELECT id FROM users WHERE email='prachi.rajput@itmbu.ac.in'),'Android Development','Advanced','Mobile Dev'),
((SELECT id FROM users WHERE email='prachi.rajput@itmbu.ac.in'),'AI','Intermediate','AI/ML'),

((SELECT id FROM users WHERE email='poojabhaliya.cse@itmbu.ac.in'),'Java','Advanced','Programming'),
((SELECT id FROM users WHERE email='poojabhaliya.cse@itmbu.ac.in'),'DBMS','Advanced','Database'),

((SELECT id FROM users WHERE email='riya.modi@itmbu.ac.in'),'Web Development','Advanced','Web Development'),
((SELECT id FROM users WHERE email='riya.modi@itmbu.ac.in'),'JavaScript','Advanced','Web Development'),

((SELECT id FROM users WHERE email='neelpatel.cse@itmbu.ac.in'),'C++','Advanced','Programming'),
((SELECT id FROM users WHERE email='neelpatel.cse@itmbu.ac.in'),'DSA','Advanced','Core CS'),

((SELECT id FROM users WHERE email='yogita.parmar@itmbu.ac.in'),'Python','Advanced','Programming'),
((SELECT id FROM users WHERE email='yogita.parmar@itmbu.ac.in'),'Data Science','Advanced','Data Science'),

((SELECT id FROM users WHERE email='abhishekdave.cse@itmbu.ac.in'),'Software Engineering','Advanced','Core CS'),
((SELECT id FROM users WHERE email='abhishekdave.cse@itmbu.ac.in'),'Deep Learning','Advanced','AI/ML'),

((SELECT id FROM users WHERE email='smruti.cse@itmbu.ac.in'),'Cyber Security','Advanced','Security'),
((SELECT id FROM users WHERE email='smruti.cse@itmbu.ac.in'),'Networking','Advanced','Security');


-- Networking page Data
-- connection data
INSERT INTO connections (sender_id, receiver_id, status) VALUES

(
 (SELECT id FROM users WHERE email='namita.shastri@itmbu.ac.in'),
 (SELECT id FROM users WHERE email='parmar.janak@itmbu.ac.in'),
 'accepted'
),

(
 (SELECT id FROM users WHERE email='namita.shastri@itmbu.ac.in'),
 (SELECT id FROM users WHERE email='csebt1@gmail.com'),
 'accepted'
),

(
 (SELECT id FROM users WHERE email='namita.shastri@itmbu.ac.in'),
 (SELECT id FROM users WHERE email='mca1@gmail.com'),
 'pending'
),

(
 (SELECT id FROM users WHERE email='parmar.janak@itmbu.ac.in'),
 (SELECT id FROM users WHERE email='bca1@gmail.com'),
 'accepted'
),

(
 (SELECT id FROM users WHERE email='parmar.janak@itmbu.ac.in'),
 (SELECT id FROM users WHERE email='mtech1@gmail.com'),
 'pending'
);

-- mentorhip data
INSERT INTO mentorship_requests (student_id, mentor_id, message, status) VALUES

(
 (SELECT id FROM users WHERE email='namita.shastri@itmbu.ac.in'),
 (SELECT id FROM users WHERE email='ishan.cse@itmbu.ac.in'),
 'Looking for AI + backend guidance',
 'accepted'
),

(
 (SELECT id FROM users WHERE email='namita.shastri@itmbu.ac.in'),
 (SELECT id FROM users WHERE email='prachi.rajput@itmbu.ac.in'),
 'Interested in Android + AI development',
 'pending'
),

(
 (SELECT id FROM users WHERE email='parmar.janak@itmbu.ac.in'),
 (SELECT id FROM users WHERE email='smruti.cse@itmbu.ac.in'),
 'Interested in cyber security',
 'accepted'
),

(
 (SELECT id FROM users WHERE email='parmar.janak@itmbu.ac.in'),
 (SELECT id FROM users WHERE email='yogita.parmar@itmbu.ac.in'),
 'Want to explore data science',
 'pending'
);

-- connection for faculties
INSERT INTO connections (sender_id, receiver_id, status) VALUES

(
 (SELECT id FROM users WHERE email='ishan.cse@itmbu.ac.in'),
 (SELECT id FROM users WHERE email='prachi.rajput@itmbu.ac.in'),
 'accepted'
),

(
 (SELECT id FROM users WHERE email='ishan.cse@itmbu.ac.in'),
 (SELECT id FROM users WHERE email='abhishekdave.cse@itmbu.ac.in'),
 'accepted'
),

(
 (SELECT id FROM users WHERE email='prachi.rajput@itmbu.ac.in'),
 (SELECT id FROM users WHERE email='riya.modi@itmbu.ac.in'),
 'pending'
),

(
 (SELECT id FROM users WHERE email='smruti.cse@itmbu.ac.in'),
 (SELECT id FROM users WHERE email='neelpatel.cse@itmbu.ac.in'),
 'accepted'
),

(
 (SELECT id FROM users WHERE email='yogita.parmar@itmbu.ac.in'),
 (SELECT id FROM users WHERE email='poojabhaliya.cse@itmbu.ac.in'),
 'pending'
);


-- club page
INSERT INTO clubs (name) VALUES
('CodeOrbit Club'),
('TechnoLab'),
('HexSociety'),
('GDG — Google Developer Group'),
('AI & Robotics Club'),
('Data Science Society');

ALTER TABLE clubs ADD COLUMN description TEXT;

UPDATE clubs SET description = 'Coding competitions, hackathons & software projects'
WHERE name = 'CodeOrbit Club';
UPDATE clubs SET description = 'A space where ideas spark, creativity thrives, and people grow'
WHERE name = 'TechnoLab';
UPDATE clubs SET description = 'Let''s breathe some binary & code like there is no tomorrow'
WHERE name = 'HexSociety';
UPDATE clubs SET description = 'Flex the Hex'
WHERE name = 'GDG — Google Developer Group';
UPDATE clubs SET description = 'Exploring artificial intelligence and robotics'
WHERE name = 'AI & Robotics Club';
UPDATE clubs SET description = 'Data analysis, visualization, and ML applications'
WHERE name = 'Data Science Society';


INSERT INTO club_members (user_id, club_id) VALUES

(
 (SELECT id FROM users WHERE email='namita.shastri@itmbu.ac.in'),
 (SELECT id FROM clubs WHERE name='CodeOrbit Club')
),
(
 (SELECT id FROM users WHERE email='namita.shastri@itmbu.ac.in'),
 (SELECT id FROM clubs WHERE name='AI & Robotics Club')
),

(
 (SELECT id FROM users WHERE email='parmar.janak@itmbu.ac.in'),
 (SELECT id FROM clubs WHERE name='GDG — Google Developer Group')
),
(
 (SELECT id FROM users WHERE email='parmar.janak@itmbu.ac.in'),
 (SELECT id FROM clubs WHERE name='TechnoLab')
);


ALTER TABLE club_opportunities
ADD COlUMN form_link TEXT;

INSERT INTO club_opportunities (club_id, role, message, form_link)
VALUES

(
 (SELECT id FROM clubs WHERE name='CodeOrbit Club'),
 'Frontend Developer',
 'Looking for a React developer to maintain event portal UI',
 'https://forms.google.com/codeorbit-frontend'
),

(
 (SELECT id FROM clubs WHERE name='HexSociety'),
 'Hardware Team',
 'Open for students interested in Arduino + IoT',
 'https://forms.google.com/hex-hardware'
),

(
 (SELECT id FROM clubs WHERE name='GDG — Google Developer Group'),
 'Web Pentester',
 'Seeking volunteers for penetration testing sessions',
 'https://forms.google.com/gdg-pentest'
),

(
 (SELECT id FROM clubs WHERE name='AI & Robotics Club'),
 'ML Engineer',
 'Help develop machine learning models for projects',
 'https://forms.google.com/ai-ml'
),

(
 (SELECT id FROM clubs WHERE name='Design Club'),
 'UI/UX Designer',
 'Design interfaces for club websites and apps',
 'https://forms.google.com/design-uiux'
),

(
 (SELECT id FROM clubs WHERE name='Robotics Club'),
 'Programmer',
 'Code for robotics competitions and automation',
 'https://forms.google.com/robotics'
);


-- events page data
INSERT INTO events (title, description, event_date, start_time, end_time, type, status, form_link) VALUES

('AI & ML Workshop',
 'Hands-on session on AI and Machine Learning basics',
 '2026-12-10',
 '10:00',
 '13:00',
 'workshop',
 'upcoming',
 'https://forms.google.com/ai-workshop'
),

('Git & GitHub Mastery',
 'Learn version control and collaboration using Git',
 '2026-12-18',
 '14:00',
 '17:00',
 'workshop',
 'upcoming',
 'https://forms.google.com/github-mastery'
),

('Web Dev Bootcamp',
 'Full-day session on frontend and backend development',
 '2026-12-22',
 '09:00',
 '16:00',
 'workshop',
 'upcoming',
 'https://forms.google.com/web-bootcamp'
),

('Data Science Summit',
 'Explore data science trends and tools',
 '2027-01-05',
 '11:00',
 '14:00',
 'seminar',
 'upcoming',
 'https://forms.google.com/data-summit'
),

-- Past events (no need for form link but you can keep NULL)
('Hackathon 2025',
 '120+ participants, 36 teams, 24-hour challenge. Winning project: AI Health Tracker',
 '2025-11-05',
 '09:00',
 '18:00',
 'competition',
 'completed',
 NULL
),

('Cyber Security Bootcamp',
 'Covered exploits, network attacks, and secure coding practices',
 '2025-10-28',
 '10:00',
 '16:00',
 'workshop',
 'completed',
 NULL
),

('College Tech Expo',
 '40+ project showcases and panel discussions with industry experts',
 '2025-09-15',
 '10:00',
 '15:00',
 'expo',
 'completed',
 NULL
);


-- project collab page data
INSERT INTO projects (user_id, title, description, roles_needed, skills, github_url) VALUES

(
 (SELECT id FROM users WHERE email='namita.shastri@itmbu.ac.in'),
 'AI Chatbot for College',
 'AI chatbot to answer student queries and automate FAQs',
 'ML Engineer, Backend Developer',
 'Python, NLP, Flask',
 'https://github.com/namita/ai-chatbot'
),


(
 (SELECT id FROM users WHERE email='parmar.janak@itmbu.ac.in'),
 'Campus Events Portal',
 'Platform to manage and register for college events',
 'Frontend Developer, Backend Developer',
 'React, Node.js, MongoDB',
 'https://github.com/janak/events-portal'
),

-- Other users (use existing users by ID range safely)
(
 3,
 'Smart Attendance System',
 'Automated attendance using face recognition',
 'AI Developer',
 'Python, OpenCV',
 'https://github.com/user3/attendance'
),

(
 5,
 'E-Learning Platform',
 'Online platform for course management and learning',
 'Full Stack Developer',
 'React, Node.js',
 'https://github.com/user5/elearning'
),

(
 8,
 'Cyber Threat Detector',
 'Detect malicious activities in network traffic',
 'Security Analyst',
 'Cyber Security, Networking',
 'https://github.com/user8/cyber-detect'
);


INSERT INTO project_requests (project_id, applicant_id, github_link, contribution, skills, status) VALUES

(
 (SELECT id FROM projects WHERE title='AI Chatbot for College'),
 (SELECT id FROM users WHERE email='parmar.janak@itmbu.ac.in'),
 'https://github.com/Janak0756',
 'I can help build frontend UI for chatbot dashboard',
 'React, CSS',
 'accepted'
),

(
 (SELECT id FROM projects WHERE title='AI Chatbot for College'),
 4,
 'https://github.com/user4',
 'Interested in backend APIs',
 'Node.js, Express',
 'pending'
),

(
 (SELECT id FROM projects WHERE title='AI Chatbot for College'),
 6,
 'https://github.com/user6',
 'Can work on database',
 'SQL, MongoDB',
 'rejected'
),

(
 (SELECT id FROM projects WHERE title='Campus Events Portal'),
 (SELECT id FROM users WHERE email='namita.shastri@itmbu.ac.in'),
 'https://github.com/NamitaShastri',
 'Can help in backend and UI improvements',
 'Node.js, UI Design',
 'accepted'
);


