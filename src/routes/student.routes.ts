import { Router } from "express";
import {
  createAdmission,
  getAdmission,
  listAdmissions,
  updateAdmission,
} from "../controllers/admission.controller.js";
import { createBifurcation, searchBifurcations } from "../controllers/bifurcation.controller.js";
import {
  downloadLeavingCertificate,
  downloadTransferCertificate,
  listLeavingCertificates,
  listTransferCertificates,
  uploadLeavingCertificate,
  uploadTransferCertificate,
} from "../controllers/certificate.controller.js";
import {
  convertInquiryToRegistration,
  createInquiry,
  createPublicInquiry,
  getInquiry,
  listInquiries,
  updateInquiry,
} from "../controllers/inquiry.controller.js";
import {
  createRegistration,
  getRegistration,
  listRegistrations,
  updateRegistration,
} from "../controllers/registration.controller.js";
import {
  getMyStudentProfile,
  getStudentById,
  linkStudentToUser,
  updateStudentRecord,
} from "../controllers/student-profile.controller.js";
import {
  createStudentParent,
  deleteStudentParent,
  listStudentParents,
  updateStudentParent,
} from "../controllers/student-parent.controller.js";
import { provisionPortalAccess } from "../controllers/student-portal.controller.js";
import {
  listDepartedStudents,
  markStudentDeparture,
} from "../controllers/student-departure.controller.js";
import {
  listStudentClassSectionOptions,
  listStudentRecords,
} from "../controllers/student-records.controller.js";
import {
  getAcademicOptions,
  listSchoolSections,
} from "../controllers/academic-reference.controller.js";
import {
  assignSectionStaff,
  getClassSectionDetail,
  listClassOverview,
  removeSectionStaff,
} from "../controllers/class-overview.controller.js";
import {
  createSchoolClass,
  createSchoolSection,
  deleteSchoolClass,
  deleteSchoolSection,
  listSchoolClassesWithSections,
  updateSchoolClass,
  updateSchoolSection,
} from "../controllers/school-class.controller.js";
import { attachSession, requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/rbac.middleware.js";
import { certificateUpload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  admissionListQuerySchema,
  bifurcationSearchQuerySchema,
  certificateListQuerySchema,
  assignSectionStaffSchema,
  classSectionDetailQuerySchema,
  convertInquirySchema,
  markStudentDepartureSchema,
  createAdmissionSchema,
  createBifurcationSchema,
  createInquirySchema,
  publicInquirySchema,
  createRegistrationSchema,
  departedStudentsListQuerySchema,
  studentRecordsListQuerySchema,
  schoolSectionsQuerySchema,
  idParamSchema,
  inquiryListQuerySchema,
  linkStudentUserSchema,
  studentParentBodySchema,
  studentParentIdParamSchema,
  updateStudentParentSchema,
  updateStudentRecordSchema,
  provisionPortalAccessSchema,
  registrationListQuerySchema,
  updateAdmissionSchema,
  updateInquirySchema,
  updateRegistrationSchema,
  uploadCertificateMetaSchema,
  uploadLeavingCertificateMetaSchema,
} from "../validators/student.validator.js";
import {
  createSchoolClassSchema,
  createSchoolSectionSchema,
  schoolClassIdParamSchema,
  schoolClassNestedParamSchema,
  schoolSectionIdParamSchema,
  updateSchoolClassSchema,
  updateSchoolSectionSchema,
} from "../validators/academic.validator.js";

const studentRouter = Router();

studentRouter.post(
  "/inquiries/public",
  validate({ body: publicInquirySchema }),
  createPublicInquiry,
);

studentRouter.use(attachSession, requireAuth);

studentRouter.get(
  "/records",
  requireAdmin,
  validate({ query: studentRecordsListQuerySchema }),
  listStudentRecords,
);
studentRouter.get(
  "/records/class-section-options",
  requireAdmin,
  listStudentClassSectionOptions,
);
studentRouter.get(
  "/classes/overview",
  requireAdmin,
  listClassOverview,
);
studentRouter.get(
  "/classes/section",
  requireAdmin,
  validate({ query: classSectionDetailQuerySchema }),
  getClassSectionDetail,
);
studentRouter.post(
  "/classes/teachers",
  requireAdmin,
  validate({ body: assignSectionStaffSchema }),
  assignSectionStaff,
);
studentRouter.delete(
  "/classes/teachers/:id",
  requireAdmin,
  validate({ params: idParamSchema }),
  removeSectionStaff,
);
studentRouter.get(
  "/academic-options",
  requireAdmin,
  getAcademicOptions,
);
studentRouter.get(
  "/sections",
  requireAdmin,
  validate({ query: schoolSectionsQuerySchema }),
  listSchoolSections,
);

studentRouter.get(
  "/school-classes",
  requireAdmin,
  listSchoolClassesWithSections,
);
studentRouter.post(
  "/school-classes",
  requireAdmin,
  validate({ body: createSchoolClassSchema }),
  createSchoolClass,
);
studentRouter.patch(
  "/school-classes/:id",
  requireAdmin,
  validate({ params: schoolClassIdParamSchema, body: updateSchoolClassSchema }),
  updateSchoolClass,
);
studentRouter.delete(
  "/school-classes/:id",
  requireAdmin,
  validate({ params: schoolClassIdParamSchema }),
  deleteSchoolClass,
);
studentRouter.post(
  "/school-classes/:classId/sections",
  requireAdmin,
  validate({
    params: schoolClassNestedParamSchema,
    body: createSchoolSectionSchema,
  }),
  createSchoolSection,
);
studentRouter.patch(
  "/school-sections/:id",
  requireAdmin,
  validate({
    params: schoolSectionIdParamSchema,
    body: updateSchoolSectionSchema,
  }),
  updateSchoolSection,
);
studentRouter.delete(
  "/school-sections/:id",
  requireAdmin,
  validate({ params: schoolSectionIdParamSchema }),
  deleteSchoolSection,
);

studentRouter.get("/me", getMyStudentProfile);
studentRouter.get(
  "/profile/:id",
  validate({ params: idParamSchema }),
  getStudentById,
);
studentRouter.patch(
  "/profile/:id",
  requireAdmin,
  validate({ params: idParamSchema, body: updateStudentRecordSchema }),
  updateStudentRecord,
);
studentRouter.get(
  "/profile/:id/parents",
  requireAdmin,
  validate({ params: idParamSchema }),
  listStudentParents,
);
studentRouter.post(
  "/profile/:id/parents",
  requireAdmin,
  validate({ params: idParamSchema, body: studentParentBodySchema }),
  createStudentParent,
);
studentRouter.patch(
  "/parents/:parentId",
  requireAdmin,
  validate({
    params: studentParentIdParamSchema,
    body: updateStudentParentSchema,
  }),
  updateStudentParent,
);
studentRouter.delete(
  "/parents/:parentId",
  requireAdmin,
  validate({ params: studentParentIdParamSchema }),
  deleteStudentParent,
);

studentRouter.get(
  "/inquiries",
  validate({ query: inquiryListQuerySchema }),
  listInquiries,
);
studentRouter.get(
  "/inquiries/:id",
  validate({ params: idParamSchema }),
  getInquiry,
);
studentRouter.post(
  "/inquiries",
  requireAdmin,
  validate({ body: createInquirySchema }),
  createInquiry,
);
studentRouter.patch(
  "/inquiries/:id",
  requireAdmin,
  validate({ params: idParamSchema, body: updateInquirySchema }),
  updateInquiry,
);
studentRouter.post(
  "/inquiries/:id/convert-registration",
  requireAdmin,
  validate({ params: idParamSchema, body: convertInquirySchema }),
  convertInquiryToRegistration,
);

studentRouter.get(
  "/registrations",
  validate({ query: registrationListQuerySchema }),
  listRegistrations,
);
studentRouter.get(
  "/registrations/:id",
  validate({ params: idParamSchema }),
  getRegistration,
);
studentRouter.post(
  "/registrations",
  requireAdmin,
  validate({ body: createRegistrationSchema }),
  createRegistration,
);
studentRouter.patch(
  "/registrations/:id",
  requireAdmin,
  validate({ params: idParamSchema, body: updateRegistrationSchema }),
  updateRegistration,
);

studentRouter.get(
  "/admissions",
  validate({ query: admissionListQuerySchema }),
  listAdmissions,
);
studentRouter.get(
  "/admissions/:id",
  validate({ params: idParamSchema }),
  getAdmission,
);
studentRouter.post(
  "/admissions",
  requireAdmin,
  validate({ body: createAdmissionSchema }),
  createAdmission,
);
studentRouter.patch(
  "/admissions/:id",
  requireAdmin,
  validate({ params: idParamSchema, body: updateAdmissionSchema }),
  updateAdmission,
);

studentRouter.post(
  "/departures",
  requireAdmin,
  validate({ body: markStudentDepartureSchema }),
  markStudentDeparture,
);
studentRouter.get(
  "/departures",
  requireAdmin,
  validate({ query: departedStudentsListQuerySchema }),
  listDepartedStudents,
);

studentRouter.get(
  "/transfer-certificates",
  validate({ query: certificateListQuerySchema }),
  listTransferCertificates,
);
studentRouter.post(
  "/transfer-certificates",
  requireAdmin,
  certificateUpload.single("file"),
  validate({ body: uploadCertificateMetaSchema }),
  uploadTransferCertificate,
);
studentRouter.get(
  "/transfer-certificates/:id/download",
  validate({ params: idParamSchema }),
  downloadTransferCertificate,
);

studentRouter.get(
  "/leaving-certificates",
  validate({ query: certificateListQuerySchema }),
  listLeavingCertificates,
);
studentRouter.post(
  "/leaving-certificates",
  requireAdmin,
  certificateUpload.single("file"),
  validate({ body: uploadLeavingCertificateMetaSchema }),
  uploadLeavingCertificate,
);
studentRouter.get(
  "/leaving-certificates/:id/download",
  validate({ params: idParamSchema }),
  downloadLeavingCertificate,
);

studentRouter.get(
  "/bifurcations/search",
  validate({ query: bifurcationSearchQuerySchema }),
  searchBifurcations,
);
studentRouter.post(
  "/bifurcations",
  requireAdmin,
  validate({ body: createBifurcationSchema }),
  createBifurcation,
);

studentRouter.patch(
  "/:id/link-user",
  requireAdmin,
  validate({ params: idParamSchema, body: linkStudentUserSchema }),
  linkStudentToUser,
);

studentRouter.post(
  "/:id/portal-access",
  requireAdmin,
  validate({ params: idParamSchema, body: provisionPortalAccessSchema }),
  provisionPortalAccess,
);

export { studentRouter };