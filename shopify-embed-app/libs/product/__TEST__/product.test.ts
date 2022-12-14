import { IProductModel } from "@models/product.model";
import mongoose, { Document } from "mongoose";

import { createProduct, createSchedule, createStaff } from "@libs/jest-helpers";
import { IStaffModel } from "@models/staff.model";
import { addHours, subHours } from "date-fns";
import productController from "../product.controller";

const productId = 123456789;

interface ICustomProductModel extends IProductModel, Document {}
interface ICustomStaffModel extends IStaffModel, Document {}

let product: ICustomProductModel;
let staff1: ICustomStaffModel;
let staff2: ICustomStaffModel;
let staff3: ICustomStaffModel;

const tag = "testerne";

describe("admin-product controller", () => {
  beforeAll(() => mongoose.connect(global.__MONGO_URI__));
  afterAll(() => mongoose.disconnect());
  afterEach(() => mongoose.connection.db.dropDatabase());

  it("Should find by id", async () => {
    product = await createProduct({ productId });

    const query = {
      shop: global.shop,
      id: product._id,
    };

    const findProduct = await productController.getById({ query });

    expect(findProduct.productId).toEqual(productId);
  });

  it("Should update properties by id", async () => {
    product = await createProduct({ productId });

    const query = {
      shop: global.shop,
      id: product._id,
    };

    const duration = 50;
    const buffertime = 100;
    const updateProduct = await productController.update({
      query,
      body: {
        duration,
        buffertime,
      },
    });

    expect(updateProduct.duration).toEqual(duration);
    expect(updateProduct.buffertime).toEqual(buffertime);
  });

  it("Should be able to add staff, and remove staff", async () => {
    product = await createProduct({ productId });

    staff1 = await createStaff();

    await createSchedule({
      tag,
      start: new Date(),
      end: addHours(new Date(), 5),
      staff: staff1._id,
    });

    staff2 = await createStaff();

    await createSchedule({
      tag,
      start: subHours(new Date(), 3),
      end: addHours(new Date(), 2),
      staff: staff2._id,
    });

    staff3 = await createStaff();

    await createSchedule({
      tag,
      start: subHours(new Date(), 5),
      end: addHours(new Date(), 5),
      staff: staff3._id,
    });

    const query = {
      shop: global.shop,
      id: product._id.toString(),
    };

    const staffToAdd = await productController.getStaff({
      query,
    });

    expect(staffToAdd.length).toEqual(3);

    let pickStaff = staffToAdd[0];

    let updatedProduct: Product;

    updatedProduct = await productController.update({
      query,
      body: {
        staff: [{ _id: pickStaff._id, tag: pickStaff.tags[0] }],
      },
    });

    expect(updatedProduct.staff.length).toEqual(1);

    updatedProduct = await productController.update({
      query,
      body: {
        staff: [],
      },
    });

    expect(updatedProduct.staff.length).toEqual(0);
  });
});
