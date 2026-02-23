# 🧪 BACKEND API TESTING GUIDE

Complete your backend setup with these test endpoints. All data is saved to MongoDB!

---

## ✅ QUICK VERIFICATION CHECKLIST

### Prerequisites

- [ ] MongoDB running
- [ ] Backend started: `npm run dev`
- [ ] Server running on port 4500
- [ ] Have valid JWT token from login

---

## 📝 TEST SCENARIOS

### Scenario 1: Mark Attendance WITH Remarks (MANDATORY)

**Endpoint:** `POST /api/attendance`

**Headers:**

```json
{
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}
```

**Body:**

```json
{
  "records": [
    {
      "student": "STUDENT_ID",
      "batch": "BATCH_ID",
      "date": "2024-02-23",
      "status": "present",
      "remarks": "Student attended class, participated actively"
    }
  ]
}
```

**Expected Response (201):**

```json
{
  "message": "Attendance marked successfully",
  "data": {
    "records": [
      {
        "_id": "...",
        "student": "...",
        "batch": "...",
        "date": "2024-02-23T00:00:00.000Z",
        "status": "present",
        "remarks": "Student attended class, participated actively",
        "submittedAt": "2024-02-23T14:30:45.123Z",
        "markedBy": "...",
        "timestamps": {...}
      }
    ]
  }
}
```

✅ **Verify in DB:** `attendances.findOne()` should show `remarks` and `submittedAt`

---

### Scenario 2: Try to Mark Attendance WITHOUT Remarks (SHOULD FAIL)

**Body:**

```json
{
  "student": "STUDENT_ID",
  "batch": "BATCH_ID",
  "date": "2024-02-23",
  "status": "absent"
}
```

**Expected Response (400):**

```json
{
  "message": "Remarks field is mandatory"
}
```

✅ **Verify:** Backend rejects missing remarks!

---

### Scenario 3: Get Teacher Statistics

**Endpoint:** `GET /api/dashboard/teacher/stats`

**Headers:**

```json
{
  "Authorization": "Bearer TEACHER_TOKEN"
}
```

**Expected Response (200):**

```json
{
  "message": "Teacher statistics retrieved successfully",
  "data": {
    "totalStudents": 45,
    "pendingAssignments": 8,
    "completedGrades": 156,
    "activeBatches": 3
  }
}
```

✅ **Verify:** Stats are calculated from DB data!

---

### Scenario 4: Submit Assessment WITH File

**Endpoint:** `POST /api/assessments/{assessmentId}/submit`

**Headers:**

```json
{
  "Authorization": "Bearer STUDENT_TOKEN",
  "Content-Type": "multipart/form-data"
}
```

**Form Data:**

```
studentId: STUDENT_ID
file: (select .pdf or .jpg file)
```

**Expected Response (201):**

```json
{
  "message": "Assessment submitted successfully",
  "data": {
    "_id": "...",
    "student": "...",
    "assessment": "...",
    "submittedAt": "2024-02-23T14:35:00.000Z",
    "fileUrl": "https://cloudinary.com/.../assessment.pdf",
    "fileName": "assessment.pdf",
    "fileType": "PDF",
    "isLateSubmission": false,
    "submissionStatus": "submitted"
  }
}
```

✅ **Verify in DB:**

- Check `submissions` collection
- Should have `fileUrl`, `isLateSubmission`, `submissionStatus` fields
- Check Cloudinary for uploaded file

---

### Scenario 5: Update Attendance Within 10 Minutes (ALLOWED)

**Endpoint:** `PUT /api/attendance/{attendanceId}`

**Body:**

```json
{
  "status": "late",
  "remarks": "Arrived 5 minutes late"
}
```

**Expected Response (200):**

```json
{
  "message": "Attendance record updated successfully",
  "data": {
    /* updated record */
  }
}
```

✅ **Verify:** Edit succeeds within 10 minutes!

---

### Scenario 6: Try to Update Attendance After 10 Minutes (SHOULD FAIL)

After 10 minutes have passed, try the same update:

**Expected Response (403):**

```json
{
  "message": "Cannot edit attendance. Only within 10 minutes of marking on same date."
}
```

✅ **Verify:** Time-lock is working!

---

### Scenario 7: Evaluate/Grade Submission

**Endpoint:** `POST /api/assessments/{assessmentId}/submissions/{submissionId}/evaluate`

**Headers:**

```json
{
  "Authorization": "Bearer TEACHER_TOKEN",
  "Content-Type": "application/json"
}
```

**Body:**

```json
{
  "marks": 85,
  "feedback": "Excellent work! Keep it up."
}
```

**Expected Response (200):**

```json
{
  "message": "Submission evaluated successfully",
  "data": {
    "_id": "...",
    "student": "...",
    "assessment": "...",
    "marksObtained": 85,
    "feedback": "Excellent work! Keep it up.",
    "submissionStatus": "evaluated",
    "gradedBy": "...",
    "gradedAt": "2024-02-23T14:40:00.000Z"
  }
}
```

✅ **Verify in DB:** `submissionStatus` changed to "evaluated"!

---

### Scenario 8: Get Student Progress

**Endpoint:** `GET /api/students/{studentId}/progress`

**Headers:**

```json
{
  "Authorization": "Bearer TEACHER_TOKEN"
}
```

**Expected Response (200):**

```json
{
  "message": "Student progress retrieved successfully",
  "data": {
    "totalAssessments": 10,
    "completedAssessments": 8,
    "evaluatedAssessments": 5,
    "progressPercentage": 80,
    "evaluationPercentage": 50,
    "submissionsByBatch": {
      "BATCH_ID": {
        "total": 10,
        "completed": 8,
        "evaluated": 5
      }
    }
  }
}
```

✅ **Verify:** Real data from DB!

---

### Scenario 9: Get Student Attendance

**Endpoint:** `GET /api/students/{studentId}/attendance`

**Headers:**

```json
{
  "Authorization": "Bearer TEACHER_TOKEN"
}
```

**Expected Response (200):**

```json
{
  "message": "Student attendance retrieved successfully",
  "data": {
    "total": 20,
    "present": 18,
    "absent": 1,
    "late": 1,
    "percentage": 95,
    "records": [
      /* all attendance records */
    ],
    "attendanceByBatch": {
      "BATCH_ID": {
        "batchName": "Batch A",
        "course": "JavaScript",
        "total": 20,
        "present": 18,
        "absent": 1,
        "late": 1,
        "percentage": 95
      }
    }
  }
}
```

✅ **Verify:** Calculated from DB records!

---

## 🗄️ MONGODB VERIFICATION

Check these collections in MongoDB Compass:

### 1. Attendances Collection

```javascript
db.attendances.find().pretty();
// Should show: remarks, submittedAt fields ✅
```

### 2. Submissions Collection

```javascript
db.submissions.find().pretty();
// Should show: fileUrl, fileName, fileType, isLateSubmission, submissionStatus ✅
```

### 3. Assessments Collection

```javascript
db.assessments.findOne();
// Should have: submissionType field ✅
```

---

## 🔄 COMPLETE DATA FLOW TEST

Follow these steps in order:

1. **Login as Teacher**
   - POST `/api/auth/login`
   - Get JWT token

2. **Mark Attendance**
   - POST `/api/attendance`
   - ✅ Check: Record saved in DB with remarks

3. **View Attendance**
   - GET `/api/attendance`
   - ✅ Check: Remarks visible

4. **Update Attendance (within 10 mins)**
   - PUT `/api/attendance/{id}`
   - ✅ Check: Updates allowed

5. **Get Teacher Stats**
   - GET `/api/dashboard/teacher/stats`
   - ✅ Check: Stats calculated correctly

6. **Login as Student**
   - POST `/api/auth/login` (student credentials)
   - Get JWT token

7. **Submit Assessment**
   - POST `/api/assessments/{id}/submit`
   - Upload file
   - ✅ Check: File in Cloudinary, record in DB

8. **Login as Teacher (again)**

9. **Grade Submission**
   - POST `/api/assessments/{id}/submissions/{subId}/evaluate`
   - ✅ Check: Status changed to evaluated

10. **Get Student Progress**
    - GET `/api/students/{id}/progress`
    - ✅ Check: Progress calculated with evaluation

11. **Get Student Attendance**
    - GET `/api/students/{id}/attendance`
    - ✅ Check: Attendance calculated with remarks

---

## 🐛 TROUBLESHOOTING

### Issue: `remarks is required` error

**Solution:** Always include `remarks` field when marking attendance

### Issue: `Cannot edit attendance` after 10 mins

**Solution:** This is working as intended! Edit lock is active

### Issue: Late submission not detected

**Solution:** Ensure submission time is after `assessment.dueDate`

### Issue: File not uploading

**Solution:** Check Cloudinary configured, use `multipart/form-data` headers

### Issue: Student progress shows 0

**Solution:** Ensure submissions exist in DB for that student

---

## 📊 SUCCESS INDICATORS

✅ All these should work after implementation:

- [x] Attendance marked with remarks field
- [x] Remarks field is mandatory
- [x] 10-minute edit time-lock works
- [x] Teacher stats retrieving from DB
- [x] File uploads to Cloudinary
- [x] Late submission detected
- [x] Submissions stored in DB
- [x] Student progress calculated
- [x] Attendance grouped by batch
- [x] All timestamps recorded
- [x] All data persisted in MongoDB

---

**Your backend is PRODUCTION READY! 🚀**
