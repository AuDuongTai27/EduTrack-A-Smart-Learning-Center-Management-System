import Pagination, {type ScheduleListPaginationProps} from '../../Teacher/schedule/ScheduleListPagination';
export type {ScheduleListPaginationProps} from '../../Teacher/schedule/ScheduleListPagination';
export default function ScheduleListPagination(props: ScheduleListPaginationProps) {return <Pagination {...props} itemLabel="duty shifts" />;}
