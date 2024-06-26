import { v4 as uuid } from "uuid";

export class BaseModel {
  constructor() {
    this._id = uuid();
  }

  get id() {
    return this._id;
  }
}
