import type { Class } from './Class';
import type { Assignment } from './Assignment';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.ContentUnit (bảng content_units)
 */
export interface ContentUnit {
  contentUnitId: number;
  classId: number;
  parentUnitId?: number | null;
  title: string;
  unitType: 'lesson' | 'chapter' | 'material' | string;
  description?: string | null;
  orderIndex: number;

  // Navigation Properties
  class?: Class;
  parentUnit?: ContentUnit | null;
  subUnits?: ContentUnit[];
  assignments?: Assignment[];
}
