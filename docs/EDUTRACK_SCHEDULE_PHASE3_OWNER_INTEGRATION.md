# Phase 3 - Minimal owner integration patch (NOT APPLIED)

User decision: wait for owner review. The six production files below remain unchanged.

Contract: generic Approval update/delete/review must reject IDs with typed Schedule detail. The conditional SQL review excludes typed IDs. Teaching/Learner direct writers need the same guard; sample normalization must not alter typed headers. Generic Add cannot create a new schedule_change text command. New Schedule APIs own the atomic header/detail/Session transaction.

UI hooks add only an import and the Schedule-owned panel after PageHeader on the three existing pages. Existing layout/list logic remains unchanged. Generic buttons are still backed by the required server guard.

All production Schedule mutations remain disabled unless GenericRoutesGuarded is configured server-side after integration. Approve/apply additionally requires AttendanceWritesCoordinated. This turn does not enable either flag in appsettings. Only the isolated test host opts in to exercise Schedule code; this does not establish that owner integrations are ready.

Below are review diffs only. No patch has been applied.

## Capstone2/backend/Repositories/Implementation/ApprovalRequestRepository.cs

```diff
diff --git a/Capstone2/backend/Repositories/Implementation/ApprovalRequestRepository.cs b/Capstone2/backend/Repositories/Implementation/ApprovalRequestRepository.cs
--- a/Capstone2/backend/Repositories/Implementation/ApprovalRequestRepository.cs
+++ b/Capstone2/backend/Repositories/Implementation/ApprovalRequestRepository.cs
@@ -43,4 +43,26 @@ namespace EduTrack.API.Repositories.Implementation
         }

+        // Typed Schedule requests must use the Schedule transaction/apply workflow.
+        public override async Task<ApprovalRequest> AddAsync(ApprovalRequest entity)
+        {
+            if (entity.RequestType.Trim().Equals("schedule_change", StringComparison.OrdinalIgnoreCase))
+                throw new InvalidOperationException("Typed Schedule requests must use Schedule Change Requests; generic writes are not allowed.");
+            return await base.AddAsync(entity);
+        }
+
+        public override async Task<ApprovalRequest> UpdateAsync(ApprovalRequest entity)
+        {
+            if (await _context.ScheduleChangeRequestDetails.AnyAsync(d => d.RequestId == entity.RequestId))
+                throw new InvalidOperationException("Typed Schedule requests must use Schedule Change Requests; generic writes are not allowed.");
+            return await base.UpdateAsync(entity);
+        }
+
+        public override async Task<bool> DeleteAsync(int id)
+        {
+            if (await _context.ScheduleChangeRequestDetails.AnyAsync(d => d.RequestId == id))
+                throw new InvalidOperationException("Typed Schedule requests must use Schedule Change Requests; generic writes are not allowed.");
+            return await base.DeleteAsync(id);
+        }
+
         public async Task<bool> TryReviewPendingAsync(
             int id,
@@ -52,5 +74,6 @@ namespace EduTrack.API.Repositories.Implementation
             var affected = await _dbSet
                 .Where(ar => ar.RequestId == id
-                          && ar.Status.ToLower() == "pending")
+                          && ar.Status.ToLower() == "pending"
+                          && !_context.ScheduleChangeRequestDetails.Any(d => d.RequestId == ar.RequestId))
                 .ExecuteUpdateAsync(setters => setters
                     .SetProperty(ar => ar.Status, status)
```

## Capstone2/backend/Services/Teaching/Implementation/TeachingRequestService.cs

```diff
diff --git a/Capstone2/backend/Services/Teaching/Implementation/TeachingRequestService.cs b/Capstone2/backend/Services/Teaching/Implementation/TeachingRequestService.cs
--- a/Capstone2/backend/Services/Teaching/Implementation/TeachingRequestService.cs
+++ b/Capstone2/backend/Services/Teaching/Implementation/TeachingRequestService.cs
@@ -80,4 +80,7 @@ namespace EduTrack.API.Services.Teaching.Implementation
         public async Task<ApprovalRequestDto?> UpdateTeachingRequestAsync(int requestId, UpdateTeachingRequestDto dto)
         {
+            if (await _context.ScheduleChangeRequestDetails.AnyAsync(d => d.RequestId == requestId))
+                throw new InvalidOperationException("Typed Schedule requests must use Schedule Change Requests; generic writes are not allowed.");
+
             var entity = await _context.ApprovalRequests
                 .Include(ar => ar.Student)
```

## Capstone2/backend/Services/Learning/Implementation/LearnerDashboardService.cs

```diff
diff --git a/Capstone2/backend/Services/Learning/Implementation/LearnerDashboardService.cs b/Capstone2/backend/Services/Learning/Implementation/LearnerDashboardService.cs
--- a/Capstone2/backend/Services/Learning/Implementation/LearnerDashboardService.cs
+++ b/Capstone2/backend/Services/Learning/Implementation/LearnerDashboardService.cs
@@ -983,4 +983,7 @@ namespace EduTrack.API.Services.Learning.Implementation
         public async Task<LearnerFeedbackItemDto?> UpdateLearnerFeedbackAsync(int requestId, UpdateLearnerFeedbackRequestDto request)
         {
+            if (await _context.ScheduleChangeRequestDetails.AnyAsync(d => d.RequestId == requestId))
+                throw new InvalidOperationException("Typed Schedule requests must use Schedule Change Requests; generic writes are not allowed.");
+
             var entity = await _context.ApprovalRequests
                 .Include(r => r.Requester)
@@ -1254,5 +1257,6 @@ namespace EduTrack.API.Services.Learning.Implementation
             // Chuyển các đơn mẫu nếu trước đó lỡ tạo với requestType != 'feedback' của user 6 hoặc 9 về chuẩn 'feedback'
             var nonStandard = await _context.ApprovalRequests
-                .Where(r => (r.RequestedBy == 6 || r.RequestedBy == 9) && r.RequestType != "feedback")
+                .Where(r => (r.RequestedBy == 6 || r.RequestedBy == 9) && r.RequestType != "feedback"
+                    && !_context.ScheduleChangeRequestDetails.Any(d => d.RequestId == r.RequestId))
                 .ToListAsync();
             if (nonStandard.Count > 0)
```

## Capstone2/frontend/src/GUIs/pages/teacher/Teacher/TeacherRequestPage.tsx

```diff
diff --git a/Capstone2/frontend/src/GUIs/pages/teacher/Teacher/TeacherRequestPage.tsx b/Capstone2/frontend/src/GUIs/pages/teacher/Teacher/TeacherRequestPage.tsx
--- a/Capstone2/frontend/src/GUIs/pages/teacher/Teacher/TeacherRequestPage.tsx
+++ b/Capstone2/frontend/src/GUIs/pages/teacher/Teacher/TeacherRequestPage.tsx
@@ -1,2 +1,3 @@
+import {ScheduleChangeRequests} from '../../../components/shared/schedule/ScheduleChangeRequests';
 import React, { useEffect, useState, useMemo } from "react";
 import PageHeader from "../../../components/Common/PageHeader";
@@ -66,4 +67,5 @@ export default function TeacherRequestPage() {
         ]}
       />
+      <ScheduleChangeRequests mode="teacher" />

       {/* Sent Requests List */}
```

## Capstone2/frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffApprovalRequestPage.tsx

```diff
diff --git a/Capstone2/frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffApprovalRequestPage.tsx b/Capstone2/frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffApprovalRequestPage.tsx
--- a/Capstone2/frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffApprovalRequestPage.tsx
+++ b/Capstone2/frontend/src/GUIs/pages/admin/AdminStaff/AdminStaffApprovalRequestPage.tsx
@@ -1,2 +1,3 @@
+import {ScheduleChangeRequests} from '../../../components/shared/schedule/ScheduleChangeRequests';
 import { useState, useEffect, useMemo } from "react";
 import PageHeader from "../../../components/Common/PageHeader";
@@ -445,4 +446,5 @@ export default function AdminStaffApprovalRequestPage() {
           >
             <i className="bi bi-plus-square me-2" />
+      <ScheduleChangeRequests mode="reviewer" />
             New Request
           </button>
```

## Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerApprovalRequestPage.tsx

```diff
diff --git a/Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerApprovalRequestPage.tsx b/Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerApprovalRequestPage.tsx
--- a/Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerApprovalRequestPage.tsx
+++ b/Capstone2/frontend/src/GUIs/pages/admin/CenterManager/CenterManagerApprovalRequestPage.tsx
@@ -1,2 +1,3 @@
+import {ScheduleChangeRequests} from '../../../components/shared/schedule/ScheduleChangeRequests';
 import { useState, useEffect, useMemo } from "react";
 import PageHeader from "../../../components/Common/PageHeader";
@@ -267,4 +268,5 @@ export default function CenterManagerApprovalRequestPage() {
         ]}
       />
+      <ScheduleChangeRequests mode="reviewer" />

       {/* Success Notification Alert */}
```
