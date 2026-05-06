import type { Worker } from "../types/WorkerType";
import API from "./API";

const EmployeesService = {
  async getWorkers(): Promise<Worker[]> {
    const response = await API.get("/funcionarios");
    console.log(response.data);
    return response.data;
  }
};

export default EmployeesService;
