export type Worker = {
  id: number;
  name: string;
  active: boolean;
};

export type AssignmentMap = {
  [productId: number]: {
    [processId: number]: number[]; // workerIds
  };
};

