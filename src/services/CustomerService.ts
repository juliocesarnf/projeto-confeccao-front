import type { Customer } from "../types/CustomerType";
import API from "./API";

const CustomerService = {
  async listAll(): Promise<Customer[]> {
    const response = await API.get<Customer[]>("/clientes");
    return response.data;
  },
};

export default CustomerService;
