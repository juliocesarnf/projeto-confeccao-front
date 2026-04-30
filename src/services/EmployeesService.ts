import API from "./API";

const EmployeesService = {
  async getEmployees(): Promise<any> {
    const response = await API.get("/funcionarios");
    return response.data;
  }
};

export default EmployeesService;
