import userDAL from "./userDAL";
import { classStaffApi } from "../api/classStaffApi";
import { eligibleClassStaff, type ClassStaffAssignment, type ClassStaffKind } from "../BLL/services/classStaffService";

export const classStaffDAL = {
  async getCandidates(kind: ClassStaffKind, assignments: ClassStaffAssignment[]) {
    const {data} = await userDAL.getAllUsers();
    if (!Array.isArray(data) || data.some(user => !user || !Number.isSafeInteger(user.userId) || user.userId <= 0
      || typeof user.fullName !== "string" || typeof user.status !== "string"
      || (user.roles != null && (!Array.isArray(user.roles) || user.roles.some(role => typeof role !== "string")))))
      throw new Error("Danh sách tài khoản không hợp lệ. Vui lòng thử tải lại.");
    return eligibleClassStaff(data, kind, assignments);
  },
  assign: classStaffApi.assign,
  deactivate: classStaffApi.deactivate,
};
