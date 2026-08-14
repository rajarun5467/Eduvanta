require('dotenv').config();
const mongoose = require('mongoose');
const mysql = require('mysql2/promise');

const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const User = require('../models/User');
const { Class, Section } = require('../models/Class');
const Student = require('../models/Student');
const ClassSubject = require('../models/ClassSubject');
const FacultySubject = require('../models/FacultySubject');
const Test = require('../models/Test');
const Exam = require('../models/Exam');
const Mark = require('../models/Mark');
const Result = require('../models/Result');
const Attendance = require('../models/Attendance');
const StaffAttendance = require('../models/StaffAttendance');
const Fee = require('../models/Fee');
const Salary = require('../models/Salary');
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const Placement = require('../models/Placement');
const Application = require('../models/Application');
const Admission = require('../models/Admission');
const Download = require('../models/Download');
const LoginActivity = require('../models/LoginActivity');
const CorrectionRequest = require('../models/CorrectionRequest');

const DB_NAME = process.env.MYSQL_DB || 'edunex_college';
const MYSQL_CONF = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASS || '',
  database: DB_NAME,
  decimalNumbers: true,
  dateStrings: false,
};

const idMaps = {};
let usersRows = [];

const snakeToCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

const getRef = (table, oldId) => {
  if (!oldId) return null;
  const m = idMaps[table];
  return m && m[oldId] ? m[oldId] : null;
};

const toBool = (v) => Number(v) === 1 || v === true || v === '1';

async function clearAll() {
  const all = [
    Course, Faculty, User, Class, Section, Student, ClassSubject, FacultySubject,
    Test, Exam, Mark, Result, Attendance, StaffAttendance, Fee, Salary, Notice,
    Event, Placement, Application, Admission, Download, LoginActivity, CorrectionRequest,
  ];
  await Promise.all(all.map((m) => m.deleteMany({})));
}

async function importTable(conn, tableName, Model, opts = {}) {
  const { refs = {}, numerics = [], bools = [], keepRows = false, nullFields = [], requiredRefs = [] } = opts;
  console.log(`Migrating ${tableName} ...`);
  const [rows] = await conn.execute(`SELECT * FROM \`${tableName}\``);
  if (keepRows) usersRows = rows;
  idMaps[tableName] = {};
  if (!rows.length) { console.log(`  (empty)`); return; }

  const docs = [];
  const usedRows = [];
  for (const row of rows) {
    const doc = {};
    for (const [key, val] of Object.entries(row)) {
      const nk = snakeToCamel(key);
      doc[nk] = val;
    }
    for (const f of numerics) {
      if (doc[f] === null || doc[f] === undefined || doc[f] === '') doc[f] = 0;
      else doc[f] = Number(doc[f]);
    }
    for (const f of bools) doc[f] = toBool(doc[f]);
    for (const f of nullFields) doc[f] = null;
    for (const [field, refTable] of Object.entries(refs)) {
      doc[field] = getRef(refTable, doc[field]);
    }
    // skip rows whose required references could not be resolved
    if (requiredRefs.some((f) => !doc[f])) continue;
    // keep original timestamps
    if (doc.createdAt && row.created_at) doc.createdAt = new Date(row.created_at);
    if (row.created_at) doc.updatedAt = new Date(row.created_at);
    docs.push(doc);
    usedRows.push(row);
  }

  try {
    const inserted = await Model.insertMany(docs, { ordered: true });
    usedRows.forEach((r, i) => { idMaps[tableName][r.id] = inserted[i]._id; });
    console.log(`  imported ${inserted.length} rows`);
  } catch (err) {
    console.error(`  ERROR in ${tableName}: ${err.message}`);
    // fallback: insert one by one to keep mapping
    for (let i = 0; i < docs.length; i++) {
      try {
        const created = await Model.create(docs[i]);
        idMaps[tableName][usedRows[i].id] = created._id;
      } catch (e) {
        console.error(`  - failed id=${usedRows[i].id}: ${e.message}`);
      }
    }
  }
}

async function fixUserAssignedSections() {
  console.log('Fixing users.assignedSectionId ...');
  for (const row of usersRows) {
    if (!row.assigned_section_id) continue;
    const newSec = getRef('sections', row.assigned_section_id);
    if (!newSec) continue;
    const userId = getRef('users', row.id);
    if (userId) await User.findByIdAndUpdate(userId, { assignedSectionId: newSec });
  }
}

async function importLoginActivity(conn) {
  console.log('Migrating login_activity ...');
  const [rows] = await conn.execute('SELECT * FROM `login_activity`');
  idMaps['login_activity'] = {};
  if (!rows.length) { console.log('  (empty)'); return; }
  const docs = [];
  for (const row of rows) {
    const doc = {};
    for (const [key, val] of Object.entries(row)) doc[snakeToCamel(key)] = val;
    const refTable = doc.userType === 'student' ? 'students' : 'users';
    doc.userId = getRef(refTable, doc.userId);
    if (!doc.userId) continue;
    if (row.created_at) { doc.createdAt = new Date(row.created_at); doc.updatedAt = new Date(row.created_at); }
    docs.push(doc);
  }
  try {
    const inserted = await LoginActivity.insertMany(docs, { ordered: true });
    rows.forEach((r, i) => { idMaps['login_activity'][r.id] = inserted[i]._id; });
    console.log(`  imported ${inserted.length} rows`);
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
  }
}

const migrate = async () => {
  let conn;
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educollege');
    console.log('Connected to MongoDB');
    conn = await mysql.createConnection(MYSQL_CONF);
    console.log(`Connected to MySQL (${DB_NAME})`);

    await clearAll();
    console.log('Cleared existing MongoDB collections');

    await importTable(conn, 'courses', Course);
    await importTable(conn, 'classes', Class);
    await importTable(conn, 'faculty', Faculty, { numerics: ['salary'] });
    await importTable(conn, 'users', User, {
      bools: ['canAccessFees', 'canAccessSalary'],
      refs: { entityId: 'faculty', assignedClassId: 'classes' },
      nullFields: ['assignedSectionId'],
      keepRows: true,
    });
    await importTable(conn, 'sections', Section, { refs: { classId: 'classes', classTeacherUserId: 'users' } });
    await fixUserAssignedSections();

    await importTable(conn, 'students', Student, { refs: { classId: 'classes', sectionId: 'sections' } });
    await importTable(conn, 'faculty_subjects', FacultySubject, { refs: { facultyId: 'faculty' } });
    await importTable(conn, 'class_subjects', ClassSubject, { refs: { classId: 'classes', sectionId: 'sections', facultyId: 'faculty' } });
    await importTable(conn, 'tests', Test, { numerics: ['maxMarks'], refs: { createdBy: 'users' } });
    await importTable(conn, 'exams', Exam, { numerics: ['maxMarks'], refs: { classId: 'classes', sectionId: 'sections', createdBy: 'users' } });
    await importTable(conn, 'marks', Mark, { numerics: ['maxMarks', 'obtainedMarks', 'credits', 'semester'], refs: { studentId: 'students' } });
    await importTable(conn, 'results', Result, { numerics: ['marks'], refs: { examId: 'exams', studentId: 'students' } });
    await importTable(conn, 'attendance', Attendance, { refs: { studentId: 'students' }, requiredRefs: ['studentId'] });
    await importTable(conn, 'staff_attendance', StaffAttendance, { refs: { userId: 'users' }, requiredRefs: ['userId'] });
    await importTable(conn, 'fees', Fee, { numerics: ['totalAmount', 'paidAmount', 'dueAmount'], refs: { studentId: 'students', classId: 'classes', sectionId: 'sections' }, requiredRefs: ['studentId'] });
    await importTable(conn, 'salaries', Salary, { numerics: ['basicAmount', 'deductions', 'netAmount'], refs: { userId: 'users' }, requiredRefs: ['userId'] });
    await importTable(conn, 'notices', Notice, { refs: { createdBy: 'users' } });
    await importTable(conn, 'events', Event, { refs: { createdBy: 'users' } });
    await importTable(conn, 'placements', Placement);
    await importTable(conn, 'applications', Application);
    await importTable(conn, 'admissions', Admission);
    await importTable(conn, 'downloads', Download);
    await importLoginActivity(conn);
    await importTable(conn, 'attendance_correction_requests', CorrectionRequest, { refs: { userId: 'users', facultyId: 'faculty', reviewedBy: 'users' }, requiredRefs: ['userId'] });

    console.log('\nMigration complete!');
    console.log('Admin login: admin / (same password as PHP)');
    console.log('Student login: email + DOB (YYYY-MM-DD)');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    if (conn) await conn.end();
    process.exit(1);
  }
};

migrate();
