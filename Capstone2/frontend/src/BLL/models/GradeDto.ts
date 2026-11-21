export interface GradeDto {
  gradeId: number;
  gradeName: string;
  totalClasses?: number;
  status?: string;
}

export interface ManagedGradeDto extends GradeDto {
  totalClasses: number;
}
