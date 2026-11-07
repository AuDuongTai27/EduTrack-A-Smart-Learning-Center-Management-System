export interface GradeDto {
  gradeId: number;
  gradeName: string;
  totalClasses?: number;
}

export interface ManagedGradeDto extends GradeDto {
  totalClasses: number;
}
