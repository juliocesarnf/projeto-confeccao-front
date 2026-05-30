import API from "./API";
import type { Report } from "../types/ReportType";

const ReportService = {
  async getAllReports(): Promise<Report[]> {
    const response = await API.get("/reports/");
    return response.data;
  }
};

export default ReportService;