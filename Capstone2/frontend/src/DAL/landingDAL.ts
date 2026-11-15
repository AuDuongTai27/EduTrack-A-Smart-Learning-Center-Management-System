import { landingApi } from '../api/landingApi';

// Never replace public business data with illustrative records.
export const landingDAL = {
  async getLandingOverview(signal?: AbortSignal) {
    return { data: await landingApi.getOverview(signal), isLiveApi: true };
  },
  subscribeNewsletter: landingApi.subscribeNewsletter,
  getClasses: landingApi.getClasses,
};
export default landingDAL;
